// @ts-nocheck
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const dateFilter = searchParams.get("dateFilter");
    const doctorId = searchParams.get("doctorId");
    const pharmacyId = searchParams.get("pharmacyId");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { patient: { name: { contains: search, mode: "insensitive" } } },
        { doctor: { name: { contains: search, mode: "insensitive" } } },
        { pharmacy: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Status filters
    if (status && status !== "all") where.status = status;
    if (paymentStatus && paymentStatus !== "all")
      where.paymentStatus = paymentStatus;
    if (doctorId) where.doctorId = doctorId;
    if (pharmacyId) where.pharmacyId = pharmacyId;

    // Date filters
    if (dateFilter && dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          where.date = {
            gte: startDate,
            lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
          };
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          where.date = { gte: startDate };
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          where.date = { gte: startDate };
          break;
      }
    }

    // Fetch appointments with related data
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.appointment.count({ where }),
    ]);

    // Calculate statistics
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [
      todayAppointments,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalRevenue,
      pendingPayments,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          date: {
            gte: todayStart,
            lt: todayEnd,
          },
        },
      }),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.appointment.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.appointment.aggregate({
        where: { paymentStatus: "PENDING" },
        _sum: { amount: true },
      }),
    ]);

    const stats = {
      total,
      today: todayAppointments,
      pending: pendingCount,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments: pendingPayments._sum.amount || 0,
      completionRate: total > 0 ? (completedCount / total) * 100 : 0,
    };

    return NextResponse.json({
      appointments,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      chamberId,
      appointmentDate,
      slotNumber,
      paymentMethod = "ONLINE",
      notes,
    } = body;

    // Validate required fields
    if (!patientId || !chamberId || !appointmentDate || !slotNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get chamber details
    const chamber = await prisma.chamber.findUnique({
      where: { id: chamberId },
      include: {
        doctor: true,
        pharmacy: true,
      },
    });

    if (!chamber) {
      return NextResponse.json({ error: "Chamber not found" }, { status: 404 });
    }

    if (!chamber.isVerified || !chamber.isActive) {
      return NextResponse.json(
        { error: "Chamber is not active or verified" },
        { status: 400 }
      );
    }

    // Check if slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        chamberId,
        date: new Date(appointmentDate),
        slotNumber,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "Slot is already booked" },
        { status: 400 }
      );
    }

    // Validate slot number
    if (slotNumber < 1 || slotNumber > chamber.maxSlots) {
      return NextResponse.json(
        { error: "Invalid slot number" },
        { status: 400 }
      );
    }

    // Create appointment
    const newAppointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId: chamber.doctorId,
        pharmacyId: chamber.pharmacyId,
        chamberId,
        date: new Date(appointmentDate),
        slotNumber,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod,
        amount: chamber.fees,
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
      },
    });

    return NextResponse.json({ appointment: newAppointment }, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
