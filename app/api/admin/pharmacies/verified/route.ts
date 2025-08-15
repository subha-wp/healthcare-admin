import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        documents: {
          path: ["verificationStatus"],
          equals: true,
        },
      },
      include: { user: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ pharmacies });
  } catch (error) {
    console.error("Error fetching verified pharmacies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
