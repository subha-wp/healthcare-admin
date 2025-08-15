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

    const appointment = await prisma.appointment.findUnique({
      where: { id },
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

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Error fetching appointment:", error);
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentDate, slotNumber, status, paymentStatus, notes } = body;

    // Get current appointment
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: { chamber: true },
    });

    if (!currentAppointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // If changing date or slot, check availability
    if (
      (appointmentDate &&
        appointmentDate !== currentAppointment.date.toISOString()) ||
      (slotNumber && slotNumber !== currentAppointment.slotNumber)
    ) {
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          chamberId: currentAppointment.chamberId,
          date: appointmentDate
            ? new Date(appointmentDate)
            : currentAppointment.date,
          slotNumber: slotNumber || currentAppointment.slotNumber,
          status: { in: ["PENDING", "CONFIRMED"] },
          id: { not: id },
        },
      });

      if (conflictingAppointment) {
        return NextResponse.json(
          { error: "Slot is already booked" },
          { status: 400 }
        );
      }
    }

    // Validate slot number if provided
    if (
      slotNumber &&
      (slotNumber < 1 || slotNumber > currentAppointment.chamber.maxSlots)
    ) {
      return NextResponse.json(
        { error: "Invalid slot number" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (appointmentDate) updateData.date = new Date(appointmentDate);
    if (slotNumber) updateData.slotNumber = slotNumber;
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

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
    console.error("Error updating appointment:", error);
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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if appointment can be cancelled
    if (appointment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel completed appointment" },
        { status: 400 }
      );
    }

    // Update appointment status to cancelled
    await prisma.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        paymentStatus:
          appointment.paymentStatus === "PAID" ? "REFUNDED" : "PENDING",
      },
    });

    return NextResponse.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
