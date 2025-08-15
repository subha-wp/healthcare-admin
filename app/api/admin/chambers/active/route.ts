import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chambers = await prisma.chamber.findMany({
      where: {
        isActive: true,
        isVerified: true,
      },
      include: {
        doctor: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
      },
      orderBy: [{ doctor: { name: "asc" } }, { pharmacy: { name: "asc" } }],
    });

    return NextResponse.json({ chambers });
  } catch (error) {
    console.error("Error fetching active chambers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
