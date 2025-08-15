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
    const specialization = searchParams.get("specialization");
    const verified = searchParams.get("verified");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { licenseNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    if (specialization && specialization !== "all") {
      where.specialization = specialization;
    }
    if (verified && verified !== "all") {
      where.isVerified = verified === "true";
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: true,
          chambers: {
            include: {
              pharmacy: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctor.count({ where }),
    ]);

    return NextResponse.json({
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
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
      email,
      firstName,
      lastName,
      phone,
      address,
      specialization,
      qualification,
      experience,
      licenseNumber,
      aadhaarNo,
      consultationFee,
      about,
      documents,
    } = body;

    // Validate required fields
    if (
      !email ||
      !firstName ||
      !lastName ||
      !phone ||
      !specialization ||
      !qualification ||
      !licenseNumber ||
      !aadhaarNo
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Check if license number already exists
    const existingDoctor = await prisma.doctor.findUnique({
      where: { licenseNo: licenseNumber },
    });

    if (existingDoctor) {
      return NextResponse.json(
        { error: "License number already exists" },
        { status: 400 }
      );
    }

    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and doctor profile
    const newDoctor = await prisma.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        hashedPassword,
        role: "DOCTOR",
        doctor: {
          create: {
            name: `${firstName} ${lastName}`,
            phone,
            specialization,
            qualification,
            address,
            experience,
            licenseNo: licenseNumber,
            aadhaarNo,
            consultationFee: consultationFee,
            about: about || "",
            documents: documents || {},
            isVerified: false,
          },
        },
      },
      include: {
        doctor: true,
      },
    });

    return NextResponse.json(
      {
        doctor: newDoctor,
        credentials: { email, password },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating doctor:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("email")) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
      if (target?.includes("licenseNo")) {
        return NextResponse.json(
          { error: "License number already exists" },
          { status: 400 }
        );
      }
      if (target?.includes("aadhaarNo")) {
        return NextResponse.json(
          { error: "Aadhaar number already exists" },
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
