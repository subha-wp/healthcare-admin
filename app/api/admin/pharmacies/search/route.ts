// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = Number.parseInt(searchParams.get("limit") || "20");

    if (!query || query.length < 2) {
      return NextResponse.json({ pharmacies: [] });
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { businessName: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
          { gstin: { contains: query, mode: "insensitive" } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        user: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    // Transform data to include verification status and sort verified first
    const pharmaciesWithStatus = pharmacies
      .map((pharmacy) => ({
        id: pharmacy.id,
        name: pharmacy.name,
        businessName: pharmacy.businessName,
        address: pharmacy.address,
        isVerified: pharmacy.documents?.verificationStatus === true,
        user: {
          email: pharmacy.user.email,
        },
      }))
      .sort((a, b) => {
        // Sort verified pharmacies first, then by name
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ pharmacies: pharmaciesWithStatus });
  } catch (error) {
    console.error("Error searching pharmacies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
