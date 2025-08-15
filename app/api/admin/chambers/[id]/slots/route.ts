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

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const excludeAppointment = searchParams.get("excludeAppointment");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(dateParam);

    // Get chamber details
    const chamber = await prisma.chamber.findUnique({
      where: { id },
    });

    if (!chamber) {
      return NextResponse.json({ error: "Chamber not found" }, { status: 404 });
    }

    // Get existing appointments for this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        chamberId: id,
        appointmentDate: {
          gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
          lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
        },
        status: { in: ["PENDING", "CONFIRMED"] },
        ...(excludeAppointment && { id: { not: excludeAppointment } }),
      },
      select: { slotNumber: true },
    });

    const bookedSlots = existingAppointments.map((apt) => apt.slotNumber);
    const allSlots = Array.from({ length: chamber.maxSlots }, (_, i) => i + 1);
    const availableSlots = allSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return NextResponse.json({
      availableSlots,
      bookedSlots,
      totalSlots: chamber.maxSlots,
      chamber: {
        startTime: chamber.startTime,
        endTime: chamber.endTime,
        slotDuration: chamber.slotDuration,
        fees: chamber.fees,
      },
    });
  } catch (error) {
    console.error("Error fetching chamber slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
