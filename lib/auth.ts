// @ts-nocheck
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import type { NextRequest } from "next/server";

const prisma = new PrismaClient();

export interface AdminUser {
  id: string;
  email: string;
  role: "ADMIN" | "OFFICE_MANAGER";
  admin?: {
    id: string;
    name: string;
    phone?: string;
    department?: string;
    permissions?: any;
    lastLogin?: Date;
  };
}

export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { admin: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "OFFICE_MANAGER")) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "OFFICE_MANAGER",
      admin: user.admin || undefined,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function verifyToken(
  request: NextRequest
): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return null;
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      include: { admin: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "OFFICE_MANAGER")) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "OFFICE_MANAGER",
      admin: user.admin || undefined,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function hasPermission(user: AdminUser, permission: string): boolean {
  // Admin has all permissions
  if (user.role === "ADMIN") {
    return true;
  }

  // Office manager has limited permissions
  if (user.role === "OFFICE_MANAGER") {
    const allowedPermissions = [
      "view_users",
      "view_doctors",
      "view_pharmacies",
      "view_chambers",
      "view_appointments",
      "view_medical_records",
      "create_appointments",
      "update_appointments",
    ];
    return allowedPermissions.includes(permission);
  }

  return false;
}
