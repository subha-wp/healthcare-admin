import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get current appointment
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!currentAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Validate status transition
    const currentStatus = currentAppointment.status;

    // Business rules for status transitions
    if (currentStatus === "COMPLETED" && status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot change status of completed appointment" },
        { status: 400 }
      );
    }

    if (currentStatus === "CANCELLED" && status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot change status of cancelled appointment" },
        { status: 400 }
      );
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        // Auto-update payment status based on appointment status
        ...(status === "CANCELLED" && {
          paymentStatus:
            currentAppointment.paymentStatus === "PAID"
              ? "REFUNDED"
              : "PENDING",
        }),
      },
      include: {
        patient: {
          include: { user: true },
        },
        doctor: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
        chamber: true,
        medicalRecord: true,
      },
    });

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
