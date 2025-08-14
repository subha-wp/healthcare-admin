import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")
    const pharmacyId = searchParams.get("pharmacyId")
    const verified = searchParams.get("verified")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    if (doctorId) where.doctorId = doctorId
    if (pharmacyId) where.pharmacyId = pharmacyId
    if (verified !== null) where.isVerified = verified === "true"

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
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.chamber.count({ where }),
    ])

    return NextResponse.json({
      chambers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching chambers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, pharmacyId, weekNumber, weekDay, startTime, endTime, slotDuration, fees } = body

    // Calculate max slots
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const durationMs = end.getTime() - start.getTime()
    const maxSlots = Math.floor(durationMs / (slotDuration * 60 * 1000))

    const newChamber = await prisma.chamber.create({
      data: {
        doctorId,
        pharmacyId,
        weekNumber,
        weekDay,
        startTime,
        endTime,
        slotDuration,
        maxSlots,
        fees,
        isActive: true,
      },
      include: {
        doctor: {
          include: { user: true },
        },
        pharmacy: {
          include: { user: true },
        },
      },
    })

    return NextResponse.json({ chamber: newChamber }, { status: 201 })
  } catch (error) {
    console.error("Error creating chamber:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
