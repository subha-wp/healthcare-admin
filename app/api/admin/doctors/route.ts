import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const specialization = searchParams.get("specialization")
    const verified = searchParams.get("verified")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
      ]
    }
    if (specialization && specialization !== "all") {
      where.specialization = specialization
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        include: {
          user: true,
          chambers: {
            include: {
              pharmacy: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.doctor.count({ where }),
    ])

    return NextResponse.json({
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching doctors:", error)
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
    const { email, ...doctorData } = body

    // Generate random password
    const password = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and doctor profile
    const newDoctor = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "DOCTOR",
        doctor: {
          create: {
            firstName: doctorData.firstName,
            lastName: doctorData.lastName,
            phone: doctorData.phone,
            specialization: doctorData.specialization,
            qualification: doctorData.qualification,
            experience: doctorData.experience,
            licenseNumber: doctorData.licenseNumber,
            consultationFee: doctorData.consultationFee,
            bio: doctorData.bio,
            documents: doctorData.documents || {},
          },
        },
      },
      include: {
        doctor: true,
      },
    })

    return NextResponse.json(
      {
        doctor: newDoctor,
        credentials: { email, password },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating doctor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
