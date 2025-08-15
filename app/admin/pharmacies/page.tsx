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
  MapPin,
  FileText,
  Clock,
  Star,
  Trash2,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff,
  Building2,
} from "lucide-react";
import { PharmacyDetailsModal } from "@/components/admin/pharmacy-details-modal";
import { CreatePharmacyModal } from "@/components/admin/create-pharmacy-modal";
import { VerifyPharmacyModal } from "@/components/admin/verify-pharmacy-modal";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeData } from "@/hooks/use-real-time-data";

interface Pharmacy {
  id: string;
  userId: string;
  name: string;
  businessName: string;
  phone: string;
  address: string;
  location: any;
  gstin?: string;
  tradeLicense?: string;
  documents?: any;
  avatarUrl?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  chambers: any[];
  appointments?: any[];
  _count?: {
    chambers: number;
    appointments: number;
  };
}

export default function PharmaciesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [verifyingPharmacy, setVerifyingPharmacy] = useState<Pharmacy | null>(
    null
  );
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
  });

  const {
    data: pharmaciesData,
    loading,
    error,
    refetch,
    lastUpdated,
  } = useRealTimeData<{ pharmacies: Pharmacy[]; pagination: any }>({
    endpoint: `/api/admin/pharmacies?${queryParams}`,
    interval: 30000,
    enabled: isOnline,
  });

  const pharmacies = pharmaciesData?.pharmacies || [];
  const paginationData = pharmaciesData?.pagination || pagination;

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
  }, [searchTerm, verificationFilter, refetch]);

  const handleDeletePharmacy = async (pharmacyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this pharmacy? This action cannot be undone."
      )
    )
      return;

    try {
      const response = await fetch(`/api/admin/pharmacies/${pharmacyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete pharmacy");
      }

      toast({
        title: "Success",
        description: "Pharmacy deleted successfully",
      });

      refetch();
    } catch (error) {
      console.error("Error deleting pharmacy:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete pharmacy",
        variant: "destructive",
      });
    }
  };

  const handleVerifyPharmacy = async (
    pharmacyId: string,
    verified: boolean,
    notes: string
  ) => {
    try {
      const response = await fetch(
        `/api/admin/pharmacies/${pharmacyId}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verified, notes }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to verify pharmacy");
      }

      toast({
        title: "Success",
        description: `Pharmacy ${
          verified ? "verified" : "rejected"
        } successfully`,
      });

      refetch();
      setVerifyingPharmacy(null);
    } catch (error) {
      console.error("Error verifying pharmacy:", error);
      toast({
        title: "Error",
        description: "Failed to verify pharmacy. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isVerified = (pharmacy: Pharmacy) => {
    return pharmacy.documents?.verificationStatus === true;
  };

  const getVerificationDate = (pharmacy: Pharmacy) => {
    return pharmacy.documents?.verificationDate;
  };

  const verifiedPharmacies = pharmacies.filter((p) => isVerified(p)).length;
  const pendingPharmacies = pharmacies.filter((p) => !isVerified(p)).length;
  const totalChambers = pharmacies.reduce(
    (sum, p) => sum + (p._count?.chambers || p.chambers?.length || 0),
    0
  );

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (verificationFilter === "verified" && !isVerified(pharmacy))
      return false;
    if (verificationFilter === "pending" && isVerified(pharmacy)) return false;
    return true;
  });

  if (loading && !pharmaciesData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Loading pharmacies...</p>
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
            Pharmacy Management
          </h2>
          <p className="text-slate-600 mt-2">
            Manage pharmacy registrations, verification, and business
            credentials
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
              <span>Add Pharmacy</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <Building2 className="h-4 w-4" />
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
              Total Pharmacies
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
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifiedPharmacies}
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
              {pendingPharmacies}
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
              Total Chambers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalChambers}
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
          <TabsTrigger value="all">All Pharmacies</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Pharmacies</CardTitle>
              <CardDescription>
                Complete list of registered pharmacies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search pharmacies by name, business name, or GSTIN..."
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
              </div>

              {/* Pharmacies Table */}
              <div className="border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading pharmacies...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Chambers</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPharmacies.map((pharmacy) => (
                        <TableRow key={pharmacy.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{pharmacy.name}</div>
                              <div className="text-sm text-slate-500">
                                {pharmacy.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{pharmacy.businessName}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span className="text-sm truncate max-w-32">
                                {pharmacy.address.split(",")[0]}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {pharmacy.gstin || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                isVerified(pharmacy) ? "default" : "secondary"
                              }
                            >
                              {isVerified(pharmacy) ? (
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
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {pharmacy._count?.chambers ||
                                pharmacy.chambers?.length ||
                                0}{" "}
                              chambers
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPharmacy(pharmacy)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit Pharmacy"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!isVerified(pharmacy) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => setVerifyingPharmacy(pharmacy)}
                                  title="Verify Pharmacy"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  handleDeletePharmacy(pharmacy.id)
                                }
                                title="Delete Pharmacy"
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
                    of {paginationData.total} pharmacies
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
              <CardTitle>Verified Pharmacies</CardTitle>
              <CardDescription>
                Pharmacies that have completed business verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pharmacies
                  .filter((p) => isVerified(p))
                  .map((pharmacy) => (
                    <Card
                      key={pharmacy.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">4.5</span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {pharmacy.name}
                        </h3>
                        <p className="text-slate-600 text-sm mb-2">
                          {pharmacy.businessName}
                        </p>
                        <div className="flex items-center space-x-1 mb-4">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <p className="text-slate-500 text-xs truncate">
                            {pharmacy.address.split(",")[0]}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>
                            {pharmacy._count?.chambers ||
                              pharmacy.chambers?.length ||
                              0}{" "}
                            chambers
                          </span>
                          <span>
                            {pharmacy._count?.appointments || 0} appointments
                          </span>
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
                Pharmacies awaiting business verification approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pharmacies
                  .filter((p) => !isVerified(p))
                  .map((pharmacy) => (
                    <Card key={pharmacy.id} className="border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {pharmacy.name}
                              </h3>
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-1">
                              {pharmacy.businessName}
                            </p>
                            <div className="flex items-center space-x-1 mb-1">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <p className="text-slate-500 text-sm">
                                {pharmacy.address.split(",")[0]}
                              </p>
                            </div>
                            <p className="text-slate-500 text-sm">
                              GSTIN: {pharmacy.gstin || "Not provided"}
                            </p>
                            <p className="text-slate-500 text-sm">
                              Submitted:{" "}
                              {new Date(
                                pharmacy.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPharmacy(pharmacy)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setVerifyingPharmacy(pharmacy)}
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

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Locations</CardTitle>
              <CardDescription>
                Geographic distribution of registered pharmacies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">
                    Interactive map view would be implemented here
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Showing {pharmacies.length} pharmacy locations across the
                    city
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {pharmacies.slice(0, 4).map((pharmacy) => (
                      <div
                        key={pharmacy.id}
                        className="text-left p-2 bg-white rounded border"
                      >
                        <p className="font-medium text-sm">{pharmacy.name}</p>
                        <p className="text-xs text-slate-500">
                          {pharmacy.address.split(",")[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedPharmacy && (
        <PharmacyDetailsModal
          pharmacy={selectedPharmacy}
          isOpen={!!selectedPharmacy}
          onClose={() => setSelectedPharmacy(null)}
        />
      )}

      <CreatePharmacyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPharmacyCreated={(newPharmacy) => {
          refetch();
          setIsCreateModalOpen(false);
          toast({
            title: "Success",
            description:
              "Pharmacy created successfully with auto-generated credentials",
          });
        }}
      />

      {verifyingPharmacy && (
        <VerifyPharmacyModal
          pharmacy={verifyingPharmacy}
          isOpen={!!verifyingPharmacy}
          onClose={() => setVerifyingPharmacy(null)}
          onVerified={(pharmacyId, verified, notes) => {
            handleVerifyPharmacy(pharmacyId, verified, notes);
          }}
        />
      )}
    </div>
  );
}
