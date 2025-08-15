import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { verified, notes } = body;

    const updatedChamber = await prisma.chamber.update({
      where: { id },
      data: {
        isVerified: verified,
        verificationDate: verified ? new Date() : null,
        verificationNotes: notes,
        isActive: verified, // Activate chamber when verified
      },
      include: {
        doctor: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json({ chamber: updatedChamber });
  } catch (error) {
    console.error("Error verifying chamber:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
