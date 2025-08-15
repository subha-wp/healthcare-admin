// @ts-nocheck
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

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        chambers: {
          include: {
            pharmacy: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            patient: true,
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
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
    if (!user || (user.role !== "ADMIN" && user.role !== "OFFICE_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      phone,
      specialization,
      qualification,
      experience,
      consultationFee,
      about,
      address,
      documents,
    } = body;

    // Validate required fields
    if (
      !name ||
      !phone ||
      !specialization ||
      !qualification ||
      experience === undefined ||
      consultationFee === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update doctor profile
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name,
        phone,
        specialization,
        qualification,
        experience,
        consultationFee,
        about: about || null,
        address: address || null,
        documents: documents || {},
      },
      include: {
        user: true,
        chambers: {
          include: {
            pharmacy: true,
          },
        },
      },
    });

    return NextResponse.json({ doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);

    // Handle specific Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

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

    // Check if doctor has any active chambers or appointments
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        chambers: true,
        appointments: {
          where: {
            status: {
              in: ["PENDING", "CONFIRMED"],
            },
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    if (doctor.appointments.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete doctor with active appointments" },
        { status: 400 }
      );
    }

    // Delete doctor and associated user
    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    return NextResponse.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
