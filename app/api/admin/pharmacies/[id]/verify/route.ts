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

    // Find the pharmacy first
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // Update pharmacy verification status
    const updatedPharmacy = await prisma.pharmacy.update({
      where: { id },
      data: {
        // Note: We need to add these fields to the schema
        // For now, we'll store in documents JSON field
        documents: {
          ...((pharmacy.documents as any) || {}),
          verificationStatus: verified,
          verificationDate: verified ? new Date().toISOString() : null,
          verificationNotes: notes,
        },
      },
      include: {
        user: true,
        chambers: true,
      },
    });

    return NextResponse.json({ pharmacy: updatedPharmacy });
  } catch (error) {
    console.error("Error verifying pharmacy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
