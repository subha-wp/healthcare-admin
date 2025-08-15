// @ts-nocheck
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  FileText,
  DollarSign,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload } from "@/components/admin/document-upload";

interface EditDoctorModalProps {
  doctor: any;
  isOpen: boolean;
  onClose: () => void;
  onDoctorUpdated: (doctor: any) => void;
}

export function EditDoctorModal({
  doctor,
  isOpen,
  onClose,
  onDoctorUpdated,
}: EditDoctorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    about: "",
    address: "",
  });
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Initialize form data when doctor changes
  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        phone: doctor.phone || "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience?.toString() || "",
        consultationFee: doctor.consultationFee?.toString() || "",
        about: doctor.about || "",
        address: doctor.address || "",
      });
      setDocuments(doctor.documents ? Object.values(doctor.documents) : []);
    }
  }, [doctor]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";
    if (!formData.experience || Number.parseInt(formData.experience) < 0) {
      newErrors.experience = "Valid experience is required";
    }
    if (
      !formData.consultationFee ||
      Number.parseFloat(formData.consultationFee) <= 0
    ) {
      newErrors.consultationFee = "Valid consultation fee is required";
    }

    // Validate phone number format
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: Number.parseInt(formData.experience),
        consultationFee: Number.parseFloat(formData.consultationFee),
        about: formData.about,
        address: formData.address,
        documents: documents.reduce((acc, doc, index) => {
          acc[`document_${index}`] = doc;
          return acc;
        }, {}),
      };

      const response = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update doctor");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Doctor profile updated successfully",
      });

      onDoctorUpdated(result.doctor);
      onClose();
    } catch (error) {
      console.error("Error updating doctor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update doctor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        phone: doctor.phone || "",
        specialization: doctor.specialization || "",
        qualification: doctor.qualification || "",
        experience: doctor.experience?.toString() || "",
        consultationFee: doctor.consultationFee?.toString() || "",
        about: doctor.about || "",
        address: doctor.address || "",
      });
      setDocuments(doctor.documents ? Object.values(doctor.documents) : []);
    }
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Edit Doctor Profile</span>
            <Badge variant={doctor.isVerified ? "default" : "secondary"}>
              {doctor.isVerified ? "Verified" : "Pending"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update doctor information and professional details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. John Smith"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Medical Street, City, State - 400001"
                />
              </div>
              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) =>
                    setFormData({ ...formData, about: e.target.value })
                  }
                  placeholder="Brief description about the doctor's expertise and background..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Professional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="Cardiology"
                    className={errors.specialization ? "border-red-500" : ""}
                  />
                  {errors.specialization && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.specialization}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification *</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualification: e.target.value,
                      })
                    }
                    placeholder="MD, MBBS"
                    className={errors.qualification ? "border-red-500" : ""}
                  />
                  {errors.qualification && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.qualification}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years) *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder="10"
                    className={errors.experience ? "border-red-500" : ""}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.experience}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="consultationFee"
                    className="flex items-center space-x-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Consultation Fee (₹) *</span>
                  </Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="100"
                    max="10000"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultationFee: e.target.value,
                      })
                    }
                    placeholder="500"
                    className={errors.consultationFee ? "border-red-500" : ""}
                  />
                  {errors.consultationFee && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.consultationFee}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Read-only Professional Details */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Professional Credentials (Read-only)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  License number and Aadhaar number cannot be modified after
                  registration. Contact system administrator for changes to
                  these fields.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Medical License Number</Label>
                  <Input
                    value={doctor.licenseNo}
                    readOnly
                    className="bg-slate-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label>Aadhaar Number</Label>
                  <Input
                    value={doctor.aadhaarNo}
                    readOnly
                    className="bg-slate-100 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  value={doctor.user.email}
                  readOnly
                  className="bg-slate-100 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Email cannot be changed. Contact admin for email updates.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Management */}
          <DocumentUpload
            title="Professional Documents"
            description="Upload or update medical license and other professional documents"
            documents={documents}
            onDocumentsChange={setDocuments}
            folder="doctors/documents"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
          />

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
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Verified Doctor
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Verified on{" "}
                  {new Date(doctor.verificationDate).toLocaleDateString()}
                </p>
                {doctor.verificationNotes && (
                  <p className="text-sm text-green-600 mt-2">
                    Notes: {doctor.verificationNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
