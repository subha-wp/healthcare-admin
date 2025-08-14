import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "healthcare-admin"
    const type = (formData.get("type") as string) || "document"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type based on upload type
    const allowedTypes = {
      document: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
      image: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
      license: ["application/pdf", "image/jpeg", "image/png", "image/jpg"],
    }

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, `${folder}/${type}`)

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
