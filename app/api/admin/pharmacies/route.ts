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
    const verified = searchParams.get("verified")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ]
    }

    const [pharmacies, total] = await Promise.all([
      prisma.pharmacy.findMany({
        where,
        include: {
          user: true,
          chambers: {
            include: {
              doctor: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.pharmacy.count({ where }),
    ])

    return NextResponse.json({
      pharmacies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching pharmacies:", error)
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
    const { email, ...pharmacyData } = body

    // Generate random password
    const password = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and pharmacy profile
    const newPharmacy = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "PHARMACY",
        pharmacy: {
          create: {
            name: pharmacyData.name,
            phone: pharmacyData.phone,
            email: pharmacyData.pharmacyEmail,
            address: pharmacyData.address,
            licenseNumber: pharmacyData.licenseNumber,
            gstin: pharmacyData.gstin,
            ownerName: pharmacyData.ownerName,
            location: pharmacyData.location || {},
            documents: pharmacyData.documents || {},
          },
        },
      },
      include: {
        pharmacy: true,
      },
    })

    return NextResponse.json(
      {
        pharmacy: newPharmacy,
        credentials: { email, password },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating pharmacy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
