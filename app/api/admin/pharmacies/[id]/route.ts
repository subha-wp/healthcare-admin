import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        user: true,
        chambers: {
          include: {
            doctor: {
              include: { user: true },
            },
          },
        },
        appointments: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            patient: true,
            chamber: {
              include: { doctor: true },
            },
          },
        },
      },
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ pharmacy });
  } catch (error) {
    console.error("Error fetching pharmacy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      name,
      businessName,
      phone,
      address,
      gstin,
      tradeLicense,
      location,
    } = body;

    const updatedPharmacy = await prisma.pharmacy.update({
      where: { id },
      data: {
        name,
        businessName,
        phone,
        address,
        gstin,
        tradeLicense,
        location,
      },
      include: {
        user: true,
        chambers: true,
      },
    });

    return NextResponse.json({ pharmacy: updatedPharmacy });
  } catch (error) {
    console.error("Error updating pharmacy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if pharmacy has active chambers
    const activeChambers = await prisma.chamber.count({
      where: { pharmacyId: id, isActive: true },
    });

    if (activeChambers > 0) {
      return NextResponse.json(
        { error: "Cannot delete pharmacy with active chambers" },
        { status: 400 }
      );
    }

    await prisma.pharmacy.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pharmacy deleted successfully" });
  } catch (error) {
    console.error("Error deleting pharmacy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
