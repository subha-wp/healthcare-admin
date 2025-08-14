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
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}
    if (role && role !== "all") {
      where.role = role
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { patient: { firstName: { contains: search, mode: "insensitive" } } },
        { patient: { lastName: { contains: search, mode: "insensitive" } } },
        { doctor: { firstName: { contains: search, mode: "insensitive" } } },
        { doctor: { lastName: { contains: search, mode: "insensitive" } } },
        { pharmacy: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          patient: true,
          doctor: true,
          pharmacy: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
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
    const { email, password, role, ...profileData } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with role-specific profile
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        ...(role === "PATIENT" && {
          patient: {
            create: {
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              phone: profileData.phone,
              dateOfBirth: new Date(profileData.dateOfBirth),
              gender: profileData.gender,
              address: profileData.address,
              emergencyContact: profileData.emergencyContact,
            },
          },
        }),
        ...(role === "DOCTOR" && {
          doctor: {
            create: {
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              phone: profileData.phone,
              specialization: profileData.specialization,
              qualification: profileData.qualification,
              experience: profileData.experience,
              licenseNumber: profileData.licenseNumber,
              consultationFee: profileData.consultationFee,
              bio: profileData.bio,
            },
          },
        }),
        ...(role === "PHARMACY" && {
          pharmacy: {
            create: {
              name: profileData.name,
              phone: profileData.phone,
              email: profileData.pharmacyEmail,
              address: profileData.address,
              licenseNumber: profileData.licenseNumber,
              gstin: profileData.gstin,
              ownerName: profileData.ownerName,
            },
          },
        }),
      },
      include: {
        patient: true,
        doctor: true,
        pharmacy: true,
      },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
