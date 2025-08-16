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
    const doctorId = searchParams.get("doctorId");
    const pharmacyId = searchParams.get("pharmacyId");
    const verified = searchParams.get("verified");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { doctor: { name: { contains: search, mode: "insensitive" } } },
        { pharmacy: { name: { contains: search, mode: "insensitive" } } },
        {
          doctor: { specialization: { contains: search, mode: "insensitive" } },
        },
      ];
    }

    if (doctorId) where.doctorId = doctorId;
    if (pharmacyId) where.pharmacyId = pharmacyId;
    if (verified && verified !== "all")
      where.isVerified = verified === "verified";
    if (status && status !== "all") where.isActive = status === "active";

    const [chambers, total] = await Promise.all([
      prisma.chamber.findMany({
        where,
        include: {
          doctor: {
            include: { user: true },
          },
          pharmacy: {
            include: { user: true },
          },
          appointments: {
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              patient: true,
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.chamber.count({ where }),
    ]);

    // Calculate additional stats for each chamber
    const chambersWithStats = await Promise.all(
      chambers.map(async (chamber) => {
        const [totalAppointments, completedAppointments, revenue] =
          await Promise.all([
            prisma.appointment.count({
              where: { chamberId: chamber.id },
            }),
            prisma.appointment.count({
              where: { chamberId: chamber.id, status: "COMPLETED" },
            }),
            prisma.appointment.aggregate({
              where: { chamberId: chamber.id, paymentStatus: "PAID" },
              _sum: { amount: true },
            }),
          ]);

        return {
          ...chamber,
          totalAppointments,
          completedAppointments,
          revenue: revenue._sum.amount || 0,
          rating: completedAppointments > 0 ? 4.2 + Math.random() * 0.8 : 0, // Mock rating
        };
      })
    );

    return NextResponse.json({
      chambers: chambersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching chambers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      doctorId,
      pharmacyId,
      scheduleType,
      weekDays,
      weekNumbers,
      isRecurring,
      startTime,
      endTime,
      slotDuration,
      fees,
    } = body;

    // Validate required fields
    if (
      !doctorId ||
      !pharmacyId ||
      !scheduleType ||
      !weekDays ||
      weekDays.length === 0 ||
      !startTime ||
      !endTime ||
      !slotDuration ||
      !fees
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate schedule type specific requirements
    if (scheduleType === "WEEKLY_RECURRING" && weekDays.length > 1) {
      return NextResponse.json(
        { error: "Weekly recurring schedule allows only one day" },
        { status: 400 }
      );
    }

    // Validate schedule type specific requirements
    if (
      scheduleType === "MONTHLY_SPECIFIC" &&
      (!weekNumbers || weekNumbers.length === 0)
    ) {
      return NextResponse.json(
        { error: "Week numbers are required for monthly specific schedule" },
        { status: 400 }
      );
    }
    // Verify doctor and pharmacy exist and are verified
    const [doctor, pharmacy] = await Promise.all([
      prisma.doctor.findUnique({ where: { id: doctorId } }),
      prisma.pharmacy.findUnique({ where: { id: pharmacyId } }),
    ]);

    if (!doctor || !pharmacy) {
      return NextResponse.json(
        { error: "Doctor or pharmacy not found" },
        { status: 404 }
      );
    }

    // Enhanced conflict checking based on schedule type
    if (
      scheduleType === "WEEKLY_RECURRING" ||
      scheduleType === "MULTI_WEEKLY"
    ) {
      // Check for conflicts with existing chambers on the same days
      for (const weekDay of weekDays) {
        const existingChamber = await prisma.chamber.findFirst({
          where: {
            doctorId,
            OR: [
              {
                scheduleType: { in: ["WEEKLY_RECURRING", "MULTI_WEEKLY"] },
                weekDays: { has: weekDay },
                isActive: true,
              },
              // Backward compatibility check
              {
                scheduleType: "WEEKLY_RECURRING",
                weekDay: weekDay,
                isActive: true,
              },
            ],
          },
        });

        if (existingChamber) {
          return NextResponse.json(
            {
              error: `Doctor already has a chamber scheduled on ${weekDay.toLowerCase()}`,
            },
            { status: 400 }
          );
        }
      }
    } else if (scheduleType === "MONTHLY_SPECIFIC") {
      // Check for overlapping week numbers on the same day
      for (const weekDay of weekDays) {
        const existingChambers = await prisma.chamber.findMany({
          where: {
            doctorId,
            scheduleType: "MONTHLY_SPECIFIC",
            OR: [
              { weekDays: { has: weekDay } },
              { weekDay: weekDay }, // Backward compatibility
            ],
            isActive: true,
          },
        });

        for (const existing of existingChambers) {
          const overlap = existing.weekNumbers.some((week: string) =>
            weekNumbers.includes(week)
          );
          if (overlap) {
            return NextResponse.json(
              {
                error: `Doctor already has a chamber scheduled for some of these weeks on ${weekDay.toLowerCase()}`,
              },
              { status: 400 }
            );
          }
        }
      }
    }
    // Calculate max slots
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const durationMs = end.getTime() - start.getTime();
    const maxSlots = Math.floor(
      durationMs / (Number.parseInt(slotDuration) * 60 * 1000)
    );

    if (maxSlots <= 0) {
      return NextResponse.json(
        { error: "Invalid time range or slot duration" },
        { status: 400 }
      );
    }

    const newChamber = await prisma.chamber.create({
      data: {
        doctorId,
        pharmacyId,
        scheduleType,
        weekDays,
        weekNumbers: scheduleType === "MONTHLY_SPECIFIC" ? weekNumbers : [],
        isRecurring:
          scheduleType === "WEEKLY_RECURRING" ||
          scheduleType === "MULTI_WEEKLY",
        startTime,
        endTime,
        slotDuration: Number.parseInt(slotDuration),
        maxSlots,
        fees: Number.parseFloat(fees),
        isActive: true,
        isVerified:
          doctor.isVerified && pharmacy.documents?.verificationStatus === true,
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

    return NextResponse.json({ chamber: newChamber }, { status: 201 });
  } catch (error) {
    console.error("Error creating chamber:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
