import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [
      totalUsers,
      totalDoctors,
      totalPharmacies,
      totalChambers,
      totalAppointments,
      recentAppointments,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.doctor.count(),
      prisma.pharmacy.count(),
      prisma.chamber.count(),
      prisma.appointment.count(),
      prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          patient: { include: { user: true } },
          chamber: {
            include: {
              doctor: { include: { user: true } },
              pharmacy: { include: { user: true } },
            },
          },
        },
      }),
      prisma.appointment.aggregate({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          paymentStatus: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalDoctors,
        totalPharmacies,
        totalChambers,
        totalAppointments,
        monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
      },
      recentAppointments,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
