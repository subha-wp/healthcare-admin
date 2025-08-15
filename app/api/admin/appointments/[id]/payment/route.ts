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
    const { paymentStatus, paymentMethod } = body;

    // Validate payment status
    const validPaymentStatuses = ["PENDING", "PAID", "REFUNDED"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
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

    // Validate payment status transition
    const currentPaymentStatus = currentAppointment.paymentStatus;

    if (currentPaymentStatus === "REFUNDED" && paymentStatus !== "REFUNDED") {
      return NextResponse.json(
        { error: "Cannot change status of refunded payment" },
        { status: 400 }
      );
    }

    // Update payment status
    const updateData: any = { paymentStatus };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
