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
      return NextResponse.json({ doctors: [] });
    }

    const doctors = await prisma.doctor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { specialization: { contains: query, mode: "insensitive" } },
          { qualification: { contains: query, mode: "insensitive" } },
          { user: { email: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        user: true,
      },
      take: limit,
      orderBy: [
        { isVerified: "desc" }, // Verified doctors first
        { name: "asc" },
      ],
    });

    // Transform data to include verification status
    const doctorsWithStatus = doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      consultationFee: doctor.consultationFee || 0,
      isVerified: doctor.isVerified,
      user: {
        email: doctor.user.email,
      },
    }));

    return NextResponse.json({ doctors: doctorsWithStatus });
  } catch (error) {
    console.error("Error searching doctors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
