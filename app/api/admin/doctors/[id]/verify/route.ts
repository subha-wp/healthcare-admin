import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { verified, notes } = body

    const updatedDoctor = await prisma.doctor.update({
      where: { id: params.id },
      data: {
        isVerified: verified,
        verificationDate: verified ? new Date() : null,
        verificationNotes: notes,
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json({ doctor: updatedDoctor })
  } catch (error) {
    console.error("Error verifying doctor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
