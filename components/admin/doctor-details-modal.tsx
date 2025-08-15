"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Building2,
  Users,
  Download,
} from "lucide-react";

interface DoctorDetailsModalProps {
  doctor: any;
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorDetailsModal({
  doctor,
  isOpen,
  onClose,
}: DoctorDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{doctor.name}</span>
            <Badge variant={doctor.isVerified ? "default" : "secondary"}>
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
          </DialogTitle>
          <DialogDescription>
            Complete doctor profile and verification details
          </DialogDescription>
        </DialogHeader>

        <div className=" gap-6">
          {/* Left Column - Basic Info */}
          <div className=" space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{doctor.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{doctor.specialization}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">
                      {doctor.experience} years experience
                    </span>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Qualification</h4>
                  <p className="text-sm text-slate-600">
                    {doctor.qualification}
                  </p>
                </div>
                {doctor.about && (
                  <div>
                    <h4 className="font-medium mb-2">About</h4>
                    <p className="text-sm text-slate-600">{doctor.about}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">License Number</h4>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">
                      {doctor.licenseNo}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Aadhaar Number</h4>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">
                      {doctor.aadhaarNo}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm">Medical License</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm">Aadhaar Card</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            {doctor.isVerified && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Verified Doctor
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Verified on{" "}
                    {new Date(doctor.verificationDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-semibold">{doctor.rating}/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Chambers</span>
                  </div>
                  <span className="font-semibold">{doctor.chambers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Total Appointments</span>
                  </div>
                  <span className="font-semibold">
                    {doctor.totalAppointments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Joined</span>
                  </div>
                  <span className="text-sm">
                    {new Date(doctor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-transparent" variant="outline">
                  Edit Profile
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  View Chambers
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  View Appointments
                </Button>
                {!doctor.isVerified && (
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Doctor
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
