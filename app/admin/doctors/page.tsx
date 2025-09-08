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
  FileText,
  UserCheck,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import { DoctorDetailsModal } from "@/components/admin/doctor-details-modal";
import { CreateDoctorModal } from "@/components/admin/create-doctor-modal";
import { VerifyDoctorModal } from "@/components/admin/verify-doctor-modal";
import { EditDoctorModal } from "@/components/admin/edit-doctor-modal";
import { useToast } from "@/hooks/use-toast";

interface Doctor {
  id: string;
  userId: string;
  name: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience: number;
  licenseNo: string;
  consultationFee: number;
  bio?: string;
  isVerified: boolean;
  verificationDate?: string;
  verificationNotes?: string;
  documents: any;
  createdAt: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  chambers: any[];
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [verifyingDoctor, setVerifyingDoctor] = useState<Doctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const { toast } = useToast();

  const fetchDoctors = async (
    page = 1,
    search = "",
    specialization = "all",
    verified = "all"
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(specialization !== "all" && { specialization }),
        ...(verified !== "all" && { verified }),
      });

      const response = await fetch(`/api/admin/doctors?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      setDoctors(data.doctors);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(1, searchTerm, specializationFilter, verificationFilter);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, specializationFilter, verificationFilter]);

  const handleVerifyDoctor = async (
    doctorId: string,
    verified: boolean,
    notes: string
  ) => {
    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verified, notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to verify doctor");
      }

      toast({
        title: "Success",
        description: `Doctor ${
          verified ? "verified" : "rejected"
        } successfully`,
      });

      fetchDoctors(
        pagination.page,
        searchTerm,
        specializationFilter,
        verificationFilter
      );
      setVerifyingDoctor(null);
    } catch (error) {
      console.error("Error verifying doctor:", error);
      toast({
        title: "Error",
        description: "Failed to verify doctor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDoctor = (updatedDoctor: any) => {
    // Refresh the doctors list after update
    fetchDoctors(
      pagination.page,
      searchTerm,
      specializationFilter,
      verificationFilter
    );
    setEditingDoctor(null);
    toast({
      title: "Success",
      description: "Doctor profile updated successfully",
    });
  };

  const handleDeleteDoctor = async (doctorId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this doctor? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete doctor");
      }

      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });

      fetchDoctors(
        pagination.page,
        searchTerm,
        specializationFilter,
        verificationFilter
      );
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete doctor",
        variant: "destructive",
      });
    }
  };

  const specializations = [...new Set(doctors.map((d) => d.specialization))];
  const verifiedDoctors = doctors.filter((d) => d.isVerified).length;
  const pendingDoctors = doctors.filter((d) => !d.isVerified).length;

  const getDoctorName = (doctor: Doctor) => `Dr. ${doctor.name}`;

  const filteredDoctors = doctors.filter((doctor) => {
    if (verificationFilter === "verified" && !doctor.isVerified) return false;
    if (verificationFilter === "pending" && doctor.isVerified) return false;
    return true;
  });

  const handleCreateDoctor = (newDoctor: any) => {
    // Refresh the doctors list after creation
    fetchDoctors(
      pagination.page,
      searchTerm,
      specializationFilter,
      verificationFilter
    );
    setIsCreateModalOpen(false);
    toast({
      title: "Success",
      description:
        "Doctor created successfully with auto-generated credentials",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Doctor Management
          </h2>
          <p className="text-slate-600 mt-2">
            Manage doctor profiles, verification, and credentials
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Doctor</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {pagination.total}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {verifiedDoctors}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingDoctors}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Specializations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {specializations.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Doctors</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Doctors</CardTitle>
              <CardDescription>
                Complete list of registered doctors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search doctors by name, specialization, or license..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={specializationFilter}
                  onValueChange={setSpecializationFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Doctors Table */}
              <div className="border rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading doctors...</span>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>License No.</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {getDoctorName(doctor)}
                              </div>
                              <div className="text-sm text-slate-500">
                                {doctor.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{doctor.specialization}</TableCell>
                          <TableCell>{doctor.experience} years</TableCell>
                          <TableCell className=" text-sm">
                            {doctor.licenseNo}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                doctor.isVerified ? "default" : "secondary"
                              }
                            >
                              {doctor.isVerified ? (
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
                          <TableCell>₹{doctor.consultationFee}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDoctor(doctor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingDoctor(doctor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {!doctor.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => setVerifyingDoctor(doctor)}
                                >
                                  <UserCheck className="h-4 w-4" />
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

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-slate-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} doctors
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchDoctors(
                          pagination.page - 1,
                          searchTerm,
                          specializationFilter,
                          verificationFilter
                        )
                      }
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        fetchDoctors(
                          pagination.page + 1,
                          searchTerm,
                          specializationFilter,
                          verificationFilter
                        )
                      }
                      disabled={pagination.page >= pagination.pages}
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
              <CardTitle>Verified Doctors</CardTitle>
              <CardDescription>
                Doctors who have completed verification process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors
                  .filter((d) => d.isVerified)
                  .map((doctor) => (
                    <Card
                      key={doctor.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                          <div className="text-sm font-medium">
                            ₹{doctor.consultationFee}
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {getDoctorName(doctor)}
                        </h3>
                        <p className="text-slate-600 text-sm mb-2">
                          {doctor.specialization}
                        </p>
                        <p className="text-slate-500 text-xs mb-4">
                          {doctor.experience} years experience
                        </p>
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span>{doctor.chambers.length} chambers</span>
                          <span>License: {doctor.licenseNumber}</span>
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
                Doctors awaiting verification approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors
                  .filter((d) => !d.isVerified)
                  .map((doctor) => (
                    <Card key={doctor.id} className="border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {getDoctorName(doctor)}
                              </h3>
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            </div>
                            <p className="text-slate-600 mb-1">
                              {doctor.specialization}
                            </p>
                            <p className="text-slate-500 text-sm">
                              License: {doctor.licenseNumber}
                            </p>
                            <p className="text-slate-500 text-sm">
                              Submitted:{" "}
                              {new Date(doctor.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDoctor(doctor)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setVerifyingDoctor(doctor)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
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
      </Tabs>

      {/* Modals */}
      {selectedDoctor && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          isOpen={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onEdit={() => {
            setEditingDoctor(selectedDoctor);
            setSelectedDoctor(null);
          }}
        />
      )}

      <CreateDoctorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDoctorCreated={handleCreateDoctor}
      />

      <EditDoctorModal
        doctor={editingDoctor}
        isOpen={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
        onDoctorUpdated={handleEditDoctor}
      />

      {verifyingDoctor && (
        <VerifyDoctorModal
          doctor={verifyingDoctor}
          isOpen={!!verifyingDoctor}
          onClose={() => setVerifyingDoctor(null)}
          onVerified={(doctorId, verified, notes) => {
            handleVerifyDoctor(doctorId, verified, notes);
          }}
        />
      )}
    </div>
  );
}
