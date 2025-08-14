"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Phone, MapPin, Calendar, Heart, GraduationCap, Building2, FileText } from "lucide-react"

interface UserDetailsModalProps {
  user: any
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  const renderPatientDetails = (patient: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{patient.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-slate-500" />
          <span className="text-sm">Blood Group: {patient.bloodGroup || "Not specified"}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{patient.address}</span>
        </div>
      </div>
    </div>
  )

  const renderDoctorDetails = (doctor: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{doctor.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{doctor.specialization}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{doctor.qualification}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{doctor.experience} years experience</span>
        </div>
      </div>
      <div className="pt-2 border-t">
        <p className="text-sm text-slate-600">License No: {doctor.licenseNo}</p>
      </div>
    </div>
  )

  const renderPharmacyDetails = (pharmacy: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{pharmacy.businessName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{pharmacy.phone}</span>
        </div>
        <div className="flex items-center space-x-2 col-span-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-sm">{pharmacy.address}</span>
        </div>
      </div>
      {pharmacy.gstin && (
        <div className="pt-2 border-t">
          <p className="text-sm text-slate-600">GSTIN: {pharmacy.gstin}</p>
        </div>
      )}
    </div>
  )

  const getUserDisplayName = () => {
    if (user.patient) return user.patient.name
    if (user.doctor) return user.doctor.name
    if (user.pharmacy) return user.pharmacy.name
    return user.email
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{getUserDisplayName()}</span>
          </DialogTitle>
          <DialogDescription>User details and profile information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Role:</span>
                  <Badge
                    variant={user.role === "PATIENT" ? "secondary" : user.role === "DOCTOR" ? "default" : "outline"}
                  >
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Joined:</span>
                  <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {user.role === "PATIENT" ? "Patient" : user.role === "DOCTOR" ? "Doctor" : "Pharmacy"} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.patient && renderPatientDetails(user.patient)}
              {user.doctor && renderDoctorDetails(user.doctor)}
              {user.pharmacy && renderPharmacyDetails(user.pharmacy)}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>Edit User</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
