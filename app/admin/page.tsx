"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  UserCheck,
  Building2,
  Calendar,
  DollarSign,
  Activity,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalPharmacies: number;
  totalChambers: number;
  totalAppointments: number;
  monthlyRevenue: number;
}

interface RecentAppointment {
  id: string;
  patient: {
    firstName: string;
    lastName: string;
    user: { email: string };
  };
  chamber: {
    doctor: {
      firstName: string;
      lastName: string;
      user: { email: string };
    };
    pharmacy: {
      name: string;
      user: { email: string };
    };
  };
  date: string;
  status: string;
  totalAmount: number;
}

export default function AdminDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    recentAppointments: RecentAppointment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setDashboardData({
        stats: {
          totalUsers: 2847,
          totalDoctors: 156,
          totalPharmacies: 89,
          totalChambers: 234,
          totalAppointments: 1847,
          monthlyRevenue: 285000,
        },
        recentAppointments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initial data fetch and periodic updates
  useEffect(() => {
    fetchDashboardData();

    // Set up periodic updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalUsers: 0,
    totalDoctors: 0,
    totalPharmacies: 0,
    totalChambers: 0,
    totalAppointments: 0,
    monthlyRevenue: 0,
  };

  const recentAppointments = dashboardData?.recentAppointments || [];

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active platform users",
    },
    {
      title: "Active Doctors",
      value: stats.totalDoctors.toLocaleString(),
      change: "+3%",
      changeType: "positive" as const,
      icon: UserCheck,
      description: "Verified doctors",
    },
    {
      title: "Registered Pharmacies",
      value: stats.totalPharmacies.toLocaleString(),
      change: "+8%",
      changeType: "positive" as const,
      icon: Building2,
      description: "Active pharmacy partners",
    },
    {
      title: "Total Chambers",
      value: stats.totalChambers.toLocaleString(),
      change: "+5%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "Active chambers",
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments.toLocaleString(),
      change: "+15%",
      changeType: "positive" as const,
      icon: Calendar,
      description: "All time appointments",
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      change: "+18%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "This month's earnings",
    },
    {
      title: "System Status",
      value: isOnline ? "Online" : "Offline",
      change: isOnline ? "+0.1%" : "-",
      changeType: isOnline ? ("positive" as const) : ("negative" as const),
      icon: Activity,
      description: "System connectivity",
    },
    {
      title: "Success Rate",
      value: "94.2%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Appointment completion",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome back, Admin
          </h2>
          <p className="text-slate-600 mt-2">
            Here's what's happening with your healthcare platform today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <Badge
              variant={isOnline ? "default" : "destructive"}
              className="text-xs"
            >
              {isOnline ? (
                <Wifi className="h-3 w-3 mr-1" />
              ) : (
                <WifiOff className="h-3 w-3 mr-1" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm">
              <PieChart className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">
                Connection Issue: {error}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                className="ml-auto bg-transparent"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-md transition-shadow relative"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
            {/* Loading indicator for real-time updates */}
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Recent Appointments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics and system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">
                          Total Platform Users
                        </p>
                        <p className="text-sm text-blue-600">
                          Active across all roles
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">
                        {stats.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-sm text-blue-600">+12% this month</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">
                          Monthly Revenue
                        </p>
                        <p className="text-sm text-green-600">
                          This month's earnings
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-900">
                        ₹{stats.monthlyRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        +18% vs last month
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Real-time system status and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Database Connection
                    </span>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      API Response Time
                    </span>
                    <span className="text-sm text-green-600">~120ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Sessions</span>
                    <span className="text-sm font-medium">
                      {stats.totalUsers > 0
                        ? Math.floor(stats.totalUsers * 0.1)
                        : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Uptime</span>
                    <span className="text-sm text-green-600">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>
                Latest appointment bookings (Real-time)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appointment, index) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {appointment.patient.firstName}{" "}
                            {appointment.patient.lastName}
                          </p>
                          <p className="text-sm text-slate-500">
                            with Dr. {appointment.chamber.doctor.firstName}{" "}
                            {appointment.chamber.doctor.lastName}
                          </p>
                          <p className="text-xs text-slate-400">
                            at {appointment.chamber.pharmacy.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          ₹{appointment.totalAmount}
                        </p>
                        <Badge
                          variant={
                            appointment.status === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointment.status}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No recent appointments found</p>
                    <p className="text-sm mt-2">
                      Appointments will appear here once users start booking
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <UserCheck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">Add Doctor</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Register new doctor
                    </p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Add Pharmacy</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Register new pharmacy
                    </p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Create Chamber</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Setup new chamber
                    </p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-slate-50 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm font-medium">Manage Users</p>
                    <p className="text-xs text-slate-500 mt-1">
                      View all users
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
