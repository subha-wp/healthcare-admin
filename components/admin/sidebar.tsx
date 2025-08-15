"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Pill,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Doctor Management",
    href: "/admin/doctors",
    icon: UserCheck,
  },
  {
    name: "Pharmacy Management",
    href: "/admin/pharmacies",
    icon: Pill,
  },
  {
    name: "Chamber Management",
    href: "/admin/chambers",
    icon: Building2,
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    name: "Medical Records",
    href: "/admin/medical-records",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "bg-slate-900 text-slate-100 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-[#228b42]">
                BookMyChamber
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Info */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm font-medium">A</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-400 truncate">
                  admin@healthcare.com
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
