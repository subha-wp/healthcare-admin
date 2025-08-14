import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getAdminUser()

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
