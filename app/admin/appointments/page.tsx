// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Eye,
  Edit,
  DollarSign,
  Stethoscope,
  Building2,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  Users,
  TrendingUp,
  Activity,
  Download,
  X,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import { AppointmentDetailsModal } from "@/components/admin/appointment-details-modal";
import { CreateAppointmentModal } from "@/components/admin/create-appointment-modal";
import { EditAppointmentModal } from "@/components/admin/edit-appointment-modal";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeData } from "@/hooks/use-real-time-data";

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  pharmacyId: string;
  chamberId: string;
  date: string;
  slotNumber: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod: "ONLINE" | "CASH";
  amount: number;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    phone: string;
    user: { email: string };
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    user: { email: string };
  };
  pharmacy: {
    id: string;
    name: string;
    address: string;
    user: { email: string };
  };
  chamber: {
    id: string;
    startTime: string;
    endTime: string;
    slotDuration: number;
    fees: number;
  };
  medicalRecord?: {
    id: string;
    diagnosis: string;
    prescription: string;
    notes?: string;
  };
}

interface AppointmentStats {
  total: number;
  today: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  pendingPayments: number;
  completionRate: number;
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: pagination.page.toString(),
    limit: pagination.limit.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(paymentFilter !== "all" && { paymentStatus: paymentFilter }),
    ...(dateFilter !== "all" && { dateFilter }),
  });

  const {
    data: appointmentsData,
    loading,
    error,
    refetch,
    lastUpdated,
  } = useRealTimeData<{
    appointments: Appointment[];
    stats: AppointmentStats;
    pagination: any;
  }>({
    endpoint: `/api/admin/appointments?${queryParams}`,
    interval: 30000,
    enabled: isOnline,
  });

  const appointments = appointmentsData?.appointments || [];
  const stats = appointmentsData?.stats || {
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completionRate: 0,
  };
  const paginationData = appointmentsData?.pagination || pagination;

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

  // Update pagination when data changes
  useEffect(() => {
    if (paginationData) {
      setPagination(paginationData);
    }
  }, [paginationData]);

  // Debounced search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, refetch]);

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handlePaymentUpdate = async (
    appointmentId: string,
    paymentStatus: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/appointments/${appointmentId}/payment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this appointment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/appointments/${appointmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel appointment");
      }

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    } as const;

    const icons = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      COMPLETED: CheckCircle,
      CANCELLED: X,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    } as const;

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getSlotTime = (appointment: Appointment) => {
    const startTime = new Date(
      `2000-01-01T${appointment.chamber.startTime}:00`
    );
    const slotStart = new Date(
      startTime.getTime() +
        (appointment.slotNumber - 1) *
          appointment.chamber.slotDuration *
          60 *
          1000
    );
    const slotEnd = new Date(
      slotStart.getTime() + appointment.chamber.slotDuration * 60 * 1000
    );

    return `${slotStart.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} - ${slotEnd.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (statusFilter !== "all" && appointment.status !== statusFilter)
      return false;
    if (paymentFilter !== "all" && appointment.paymentStatus !== paymentFilter)
      return false;

    const today = new Date();
    const appointmentDate = new Date(appointment.date);

    if (dateFilter === "today") {
      return appointmentDate.toDateString() === today.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return appointmentDate >= weekAgo;
    }
    if (dateFilter === "month") {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return appointmentDate >= monthAgo;
    }

    return true;
  });

  if (loading && !appointmentsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Appointment Management
          </h2>
          <p className="text-slate-600 mt-2">
            Manage all patient appointments and medical consultations
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
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
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
                Connection Issue: {error.message}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                className="ml-auto bg-transparent"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">+12% from last month</p>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Today's Appointments
            </CardTitle>
            <Clock className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.today}
            </div>
            <p className="text-xs text-slate-500 mt-1">+5% from yesterday</p>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Payments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{stats.pendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.pending} appointments
            </p>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.completionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">+2.1% improvement</p>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>
                View and manage all patient appointments with real-time updates
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by patient, doctor, or appointment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <div className="border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading appointments...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Appointment ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium text-xs">
                            #{appointment.id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {appointment.patient.name}
                              </p>
                              <div className="flex items-center space-x-1 text-xs text-slate-500">
                                <Phone className="h-3 w-3" />
                                <span>{appointment.patient.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-medium">
                                  {appointment.doctor.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {appointment.doctor.specialization}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-4 w-4 text-slate-400" />
                              <div>
                                <p className="font-medium">
                                  {appointment.pharmacy.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate max-w-24">
                                  {appointment.pharmacy.address.split(",")[0]}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {new Date(
                                  appointment.date
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-slate-500">
                                {getSlotTime(appointment)}
                              </p>
                              <p className="text-xs text-slate-400">
                                Slot #{appointment.slotNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentBadge(appointment.paymentStatus)}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{appointment.amount}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedAppointment(appointment)
                                }
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setEditingAppointment(appointment)
                                }
                                title="Edit Appointment"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {appointment.status === "PENDING" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "CONFIRMED"
                                    )
                                  }
                                  title="Confirm Appointment"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {(appointment.status === "PENDING" ||
                                appointment.status === "CONFIRMED") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleDeleteAppointment(appointment.id)
                                  }
                                  title="Cancel Appointment"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              {/* Pagination */}
              {paginationData.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-600">
                    Showing{" "}
                    {(paginationData.page - 1) * paginationData.limit + 1} to{" "}
                    {Math.min(
                      paginationData.page * paginationData.limit,
                      paginationData.total
                    )}{" "}
                    of {paginationData.total} appointments
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page - 1,
                        }))
                      }
                      disabled={paginationData.page <= 1 || loading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {paginationData.page} of {paginationData.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: prev.page + 1,
                        }))
                      }
                      disabled={
                        paginationData.page >= paginationData.pages || loading
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Calendar View
                    </h3>
                    <p className="text-slate-500">
                      Interactive calendar with appointment scheduling
                    </p>
                    <div className="mt-6 grid grid-cols-7 gap-2 max-w-md mx-auto">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <div
                            key={day}
                            className="p-2 text-center text-xs font-medium bg-slate-100 rounded"
                          >
                            {day}
                          </div>
                        )
                      )}
                      {Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={i}
                          className="p-2 text-center text-sm border rounded hover:bg-slate-50 cursor-pointer"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Appointment Status Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of appointment statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-sm">Completed</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{stats.completed}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            {stats.total > 0
                              ? ((stats.completed / stats.total) * 100).toFixed(
                                  1
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                          <span className="text-sm">Confirmed</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{stats.confirmed}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            {stats.total > 0
                              ? ((stats.confirmed / stats.total) * 100).toFixed(
                                  1
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span className="text-sm">Pending</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{stats.pending}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            {stats.total > 0
                              ? ((stats.pending / stats.total) * 100).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-sm">Cancelled</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{stats.cancelled}</span>
                          <span className="text-xs text-slate-500 ml-2">
                            {stats.total > 0
                              ? ((stats.cancelled / stats.total) * 100).toFixed(
                                  1
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analytics</CardTitle>
                    <CardDescription>
                      Payment and revenue breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{stats.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">
                          Total Revenue
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          ₹{stats.pendingPayments.toLocaleString()}
                        </div>
                        <div className="text-sm text-orange-700">
                          Pending Payments
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹
                          {stats.total > 0
                            ? Math.round(stats.totalRevenue / stats.total)
                            : 0}
                        </div>
                        <div className="text-sm text-blue-700">
                          Average per Appointment
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusUpdate={handleStatusUpdate}
          onPaymentUpdate={handlePaymentUpdate}
          onEdit={() => {
            setEditingAppointment(selectedAppointment);
            setSelectedAppointment(null);
          }}
        />
      )}

      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAppointmentCreated={(newAppointment) => {
          refetch();
          setIsCreateModalOpen(false);
          toast({
            title: "Success",
            description: "Appointment scheduled successfully",
          });
        }}
      />

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          isOpen={!!editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onAppointmentUpdated={(updatedAppointment) => {
            refetch();
            setEditingAppointment(null);
            toast({
              title: "Success",
              description: "Appointment updated successfully",
            });
          }}
        />
      )}
    </div>
  );
}
