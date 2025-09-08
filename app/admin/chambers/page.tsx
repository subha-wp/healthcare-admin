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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Activity,
  Repeat,
  CalendarDays,
} from "lucide-react";
import { ChamberDetailsModal } from "@/components/admin/chamber-details-modal";
import { CreateChamberModal } from "@/components/admin/create-chamber-modal";
import { VerifyChamberModal } from "@/components/admin/verify-chamber-modal";
import { EditChamberModal } from "@/components/admin/edit-chamber-modal";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeData } from "@/hooks/use-real-time-data";
import {
  getScheduleDisplay,
  getScheduleTypeDisplay,
} from "@/lib/chamber-utils";

interface Chamber {
  id: string;
  doctorId: string;
  pharmacyId: string;
  weekNumber: string;
  weekDay: string;
  startTime: string;
  endTime: string;
  fees: number;
  slotDuration: number;
  maxSlots: number;
  isActive: boolean;
  isVerified: boolean;
  verificationDate?: string;
  verificationNotes?: string;
  createdAt: string;
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
  appointments: any[];
  totalAppointments: number;
  completedAppointments: number;
  revenue: number;
  rating: number;
  _count: {
    appointments: number;
  };
}

export default function ChambersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedChamber, setSelectedChamber] = useState<Chamber | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [verifyingChamber, setVerifyingChamber] = useState<Chamber | null>(
    null
  );
  const [editingChamber, setEditingChamber] = useState<Chamber | null>(null);
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
    ...(verificationFilter !== "all" && { verified: verificationFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const {
    data: chambersData,
    loading,
    error,
    refetch,
    lastUpdated,
  } = useRealTimeData<{ chambers: Chamber[]; pagination: any }>({
    endpoint: `/api/admin/chambers?${queryParams}`,
    interval: 30000,
    enabled: isOnline,
  });

  const chambers = chambersData?.chambers || [];
  const paginationData = chambersData?.pagination || pagination;

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
  }, [searchTerm, verificationFilter, statusFilter, refetch]);

  const handleVerifyChamber = async (
    chamberId: string,
    verified: boolean,
    notes: string
  ) => {
    try {
      const response = await fetch(`/api/admin/chambers/${chamberId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify chamber");
      }

      toast({
        title: "Success",
        description: `Chamber ${
          verified ? "verified" : "rejected"
        } successfully`,
      });

      refetch();
      setVerifyingChamber(null);
    } catch (error) {
      console.error("Error verifying chamber:", error);
      toast({
        title: "Error",
        description: "Failed to verify chamber. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChamber = async (chamberId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this chamber? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chambers/${chamberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete chamber");
      }

      toast({
        title: "Success",
        description: "Chamber deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error deleting chamber:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete chamber",
        variant: "destructive",
      });
    }
  };

  const handleEditChamber = (updatedChamber: any) => {
    refetch();
    setEditingChamber(null);
    toast({
      title: "Success",
      description: "Chamber updated successfully",
    });
  };

  const verifiedChambers = chambers.filter((c) => c.isVerified).length;
  const pendingChambers = chambers.filter((c) => !c.isVerified).length;
  const activeChambers = chambers.filter((c) => c.isActive).length;
  const totalRevenue = chambers.reduce((sum, c) => sum + c.revenue, 0);

  const filteredChambers = chambers.filter((chamber) => {
    if (verificationFilter === "verified" && !chamber.isVerified) return false;
    if (verificationFilter === "pending" && chamber.isVerified) return false;
    if (statusFilter === "active" && !chamber.isActive) return false;
    if (statusFilter === "inactive" && chamber.isActive) return false;
    return true;
  });

  if (loading && !chambersData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading chambers...</p>
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
            Chamber Management
          </h2>
          <p className="text-slate-600 mt-2">
            Manage doctor-pharmacy partnerships and chamber schedules
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
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Chamber</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Chambers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {paginationData.total}
            </div>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active Chambers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeChambers}
            </div>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingChambers}
            </div>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
            {loading && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Chambers</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="schedule">Schedule View</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Chambers</CardTitle>
              <CardDescription>
                Complete list of doctor-pharmacy chamber partnerships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by doctor, pharmacy, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={verificationFilter}
                  onValueChange={setVerificationFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chambers</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Chambers Table */}
              <div className="border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading chambers...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Fees</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredChambers.map((chamber) => (
                        <TableRow key={chamber.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {chamber.doctor.name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {chamber.doctor.specialization}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {chamber.pharmacy.name}
                              </div>
                              <div className="text-sm text-slate-500 truncate max-w-32">
                                {chamber.pharmacy.address.split(",")[0]}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {getScheduleDisplay(chamber)}
                              </div>
                              <div className="text-sm text-slate-500">
                                {chamber.startTime} - {chamber.endTime}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {getScheduleTypeDisplay(chamber)}
                                </Badge>
                                <span>
                                  {chamber.maxSlots} slots ×{" "}
                                  {chamber.slotDuration}min
                                </span>
                                {chamber.scheduleType === "MULTI_WEEKLY" && (
                                  <span className="text-purple-600">
                                    {chamber.weekDays?.length || 0} days/week
                                  </span>
                                )}
                                {chamber.doctor && (
                                  <span className="text-blue-600 text-xs">
                                    Dr. {chamber.doctor.name.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">₹{chamber.fees}</div>
                            <div className="text-xs text-slate-500">
                              per consultation
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3 text-blue-500" />
                                <span className="text-xs">
                                  {chamber.totalAppointments} appointments
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-xs">
                                  ₹{chamber.revenue.toLocaleString()}
                                </span>
                              </div>
                              {chamber.rating > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs">
                                    {chamber.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <Badge
                                variant={
                                  chamber.isVerified ? "default" : "secondary"
                                }
                              >
                                {chamber.isVerified ? (
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Verified</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Pending</span>
                                  </div>
                                )}
                              </Badge>
                              <Badge
                                variant={
                                  chamber.isActive ? "outline" : "secondary"
                                }
                              >
                                {chamber.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedChamber(chamber)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingChamber(chamber)}
                                title="Edit Chamber"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!chamber.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => setVerifyingChamber(chamber)}
                                  title="Verify Chamber"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteChamber(chamber.id)}
                                title="Delete Chamber"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                    of {paginationData.total} chambers
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verified Chambers</CardTitle>
              <CardDescription>
                Active and verified doctor-pharmacy partnerships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chambers
                  .filter((c) => c.isVerified)
                  .map((chamber) => (
                    <Card
                      key={chamber.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedChamber(chamber)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <Badge
                            variant={chamber.isActive ? "outline" : "secondary"}
                          >
                            {chamber.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">
                          {chamber.doctor.name}
                        </h3>
                        <p className="text-slate-600 text-sm mb-2">
                          {chamber.doctor.specialization}
                        </p>
                        <p className="text-slate-500 text-sm mb-4">
                          {chamber.pharmacy.name}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Schedule:</span>
                            <span>{getScheduleDisplay(chamber)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Time:</span>
                            <span>
                              {chamber.startTime} - {chamber.endTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Fees:</span>
                            <span>₹{chamber.fees}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">
                              Appointments:
                            </span>
                            <span>{chamber.totalAppointments}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Revenue:</span>
                            <span>₹{chamber.revenue.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification</CardTitle>
              <CardDescription>
                Chambers awaiting admin verification and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chambers
                  .filter((c) => !c.isVerified)
                  .map((chamber) => (
                    <Card key={chamber.id} className="border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {chamber.doctor.name}
                              </h3>
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-1">
                              {chamber.doctor.specialization} at{" "}
                              {chamber.pharmacy.name}
                            </p>
                            <p className="text-slate-500 text-sm mb-2">
                              Schedule: {getScheduleDisplay(chamber)},{" "}
                              {chamber.startTime} - {chamber.endTime}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Fees: ₹{chamber.fees}</span>
                              <span>Slots: {chamber.maxSlots}</span>
                              <span>Duration: {chamber.slotDuration}min</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-2">
                              Submitted:{" "}
                              {new Date(chamber.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedChamber(chamber)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setVerifyingChamber(chamber)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Chamber Schedule Overview</CardTitle>
              <CardDescription>
                Weekly and monthly schedule view of all active chambers with new
                scheduling patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Weekly Recurring Chambers */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                    <Repeat className="h-5 w-5 text-blue-600" />
                    <span>Weekly Recurring Chambers</span>
                    <Badge variant="outline" className="text-xs">
                      Multiple time slots supported
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-7 gap-4">
                    {[
                      "MONDAY",
                      "TUESDAY",
                      "WEDNESDAY",
                      "THURSDAY",
                      "FRIDAY",
                      "SATURDAY",
                      "SUNDAY",
                    ].map((day) => (
                      <div key={day} className="space-y-2">
                        <h4 className="font-semibold text-center p-2 bg-blue-100 rounded">
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </h4>
                        <div className="space-y-2 min-h-32">
                          {chambers
                            .filter(
                              (c) =>
                                (c.weekDay === day || (c.weekDays && c.weekDays.includes(day))) &&
                                c.isActive &&
                                c.isVerified &&
                                (c.scheduleType === "WEEKLY_RECURRING" ||
                                  c.scheduleType === "MULTI_WEEKLY" ||
                                  c.isRecurring)
                            )
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((chamber) => (
                              <Card
                                key={chamber.id}
                                className="p-2 text-xs cursor-pointer hover:shadow-sm transition-shadow border-blue-200"
                                onClick={() => setSelectedChamber(chamber)}
                              >
                                <div className="font-medium truncate">
                                  {chamber.doctor.name}
                                </div>
                                <div className="text-slate-500 truncate">
                                  {chamber.pharmacy.name}
                                </div>
                                <div className="text-slate-400">
                                  {chamber.startTime}-{chamber.endTime}
                                </div>
                                <div className="text-slate-400">
                                  ₹{chamber.fees}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs mt-1"
                                >
                                  {chamber.scheduleType === "MULTI_WEEKLY" ? "Multi" : "Weekly"}
                                </Badge>
                              </Card>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Specific Chambers */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5 text-purple-600" />
                    <span>Monthly Specific Chambers</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {chambers
                      .filter(
                        (c) =>
                          c.scheduleType === "MONTHLY_SPECIFIC" &&
                          c.isActive &&
                          c.isVerified
                      )
                      .map((chamber) => (
                        <Card
                          key={chamber.id}
                          className="p-4 cursor-pointer hover:shadow-md transition-shadow border-purple-200"
                          onClick={() => setSelectedChamber(chamber)}
                        >
                          <div className="space-y-2">
                            <div className="font-medium">
                              {chamber.doctor.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {chamber.pharmacy.name}
                            </div>
                            <div className="text-sm font-medium text-purple-700">
                              {getScheduleDisplay(chamber)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {chamber.startTime} - {chamber.endTime}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                ₹{chamber.fees}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                Monthly
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-400">
                              {chamber.weekNumbers?.length || 0} sessions/month
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedChamber && (
        <ChamberDetailsModal
          chamber={selectedChamber}
          isOpen={!!selectedChamber}
          onClose={() => setSelectedChamber(null)}
          onEdit={() => {
            setEditingChamber(selectedChamber);
            setSelectedChamber(null);
          }}
          onDelete={(chamberId) => {
            handleDeleteChamber(chamberId);
            setSelectedChamber(null);
          }}
        />
      )}

      <CreateChamberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChamberCreated={(newChamber) => {
          refetch();
          setIsCreateModalOpen(false);
          toast({
            title: "Success",
            description: "Chamber created successfully",
          });
        }}
      />

      {editingChamber && (
        <EditChamberModal
          chamber={editingChamber}
          isOpen={!!editingChamber}
          onClose={() => setEditingChamber(null)}
          onChamberUpdated={handleEditChamber}
        />
      )}

      {verifyingChamber && (
        <VerifyChamberModal
          chamber={verifyingChamber}
          isOpen={!!verifyingChamber}
          onClose={() => setVerifyingChamber(null)}
          onVerified={(chamberId, verified, notes) => {
            handleVerifyChamber(chamberId, verified, notes);
          }}
        />
      )}
    </div>
  );
}
