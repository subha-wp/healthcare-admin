// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const verified = searchParams.get("verified");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { gstin: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Filter by verification status
    if (verified && verified !== "all") {
      if (verified === "verified") {
        where.documents = {
          path: ["verificationStatus"],
          equals: true,
        };
      } else if (verified === "pending") {
        where.OR = [
          { documents: { path: ["verificationStatus"], equals: false } },
          { documents: { path: ["verificationStatus"], equals: null } },
          { documents: { equals: null } },
        ];
      }
    }

    const [pharmacies, total] = await Promise.all([
      prisma.pharmacy.findMany({
        where,
        include: {
          user: true,
          chambers: {
            include: {
              doctor: true,
            },
          },
          _count: {
            select: {
              chambers: true,
              appointments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.pharmacy.count({ where }),
    ]);

    return NextResponse.json({
      pharmacies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      businessName,
      phone,
      address,
      gstin,
      tradeLicense,
      latitude,
      longitude,
    } = body;

    // Validate required fields
    if (!name || !businessName || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate email from pharmacy name
    const emailPrefix = name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".")
      .replace(/pharmacy$/, "");
    const email = `${emailPrefix}@bookmychamber.com`;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and pharmacy profile
    const newPharmacy = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        hashedPassword,
        role: "PHARMACY",
        pharmacy: {
          create: {
            name,
            businessName,
            phone,
            address,
            gstin,
            tradeLicense,
            location: {
              latitude: latitude ? parseFloat(latitude) : 0,
              longitude: longitude ? parseFloat(longitude) : 0,
            },
            documents: {
              verificationStatus: false,
              verificationDate: null,
              verificationNotes: null,
            },
          },
        },
      },
      include: {
        pharmacy: true,
      },
    });

    return NextResponse.json(
      {
        pharmacy: newPharmacy,
        credentials: { email, password },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pharmacy:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("email")) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
