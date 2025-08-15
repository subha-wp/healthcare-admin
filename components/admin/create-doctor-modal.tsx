"use client";

import type React from "react";
import { useState } from "react";
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
import { Key, Mail, User, Copy, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorCreated: (doctor: any) => void;
}

interface GeneratedCredentials {
  email: string;
  password: string;
}

export function CreateDoctorModal({
  isOpen,
  onClose,
  onDoctorCreated,
}: CreateDoctorModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    specialization: "",
    qualification: "",
    experience: "",
    licenseNumber: "",
    aadhaarNo: "",
    about: "",
    consultationFee: "0", // Changed default from "500" to "0"
  });
  const [generatedCredentials, setGeneratedCredentials] =
    useState<GeneratedCredentials | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";
    if (!formData.experience || Number.parseInt(formData.experience) < 0) {
      newErrors.experience = "Valid experience is required";
    }
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    if (!formData.aadhaarNo.trim())
      newErrors.aadhaarNo = "Aadhaar number is required";
    if (
      !formData.consultationFee ||
      Number.parseFloat(formData.consultationFee) < 0
    ) {
      newErrors.consultationFee =
        "Valid consultation fee is required (0 or more)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCredentials = () => {
    // Generate email from name
    const email = `${formData.firstName}.${formData.lastName}`
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".")
      .replace(/^dr\.?/, "dr.");
    const domain = "@bookmychamber.com";
    const generatedEmail = `dr.${email}${domain}`;

    const generatePassword = () => {
      // Get first name (capitalize first letter)
      const firstName =
        formData.firstName.charAt(0).toUpperCase() +
        formData.firstName.slice(1).toLowerCase();

      // Get last 6 digits of Aadhaar number (remove spaces and get last 6)
      const aadhaarClean = formData.aadhaarNo.replace(/\s/g, "");
      const last6Digits = aadhaarClean.slice(-6);

      // Create password: FirstName + Last6Digits + @
      // Example: John123456@ or Priya789012@
      return `${firstName}${last6Digits}@`;
    };

    return {
      email: generatedEmail,
      password: generatePassword(),
    };
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
      // Generate credentials first
      const credentials = generateCredentials();

      // Prepare data for API
      const doctorData = {
        email: credentials.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: Number.parseInt(formData.experience),
        licenseNumber: formData.licenseNumber,
        aadhaarNo: formData.aadhaarNo.replace(/\s/g, ""), // Remove spaces
        consultationFee: Number.parseFloat(formData.consultationFee),
        about: formData.about,
        documents: {}, // Empty documents object for now
      };

      // Call API to create doctor
      const response = await fetch("/api/admin/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create doctor");
      }

      const result = await response.json();

      // Set credentials for display
      setGeneratedCredentials({
        email: credentials.email,
        password: credentials.password,
      });

      toast({
        title: "Success",
        description:
          "Doctor created successfully with auto-generated credentials",
      });

      // Call the callback with the created doctor
      onDoctorCreated(result.doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create doctor",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      specialization: "",
      qualification: "",
      experience: "",
      licenseNumber: "",
      aadhaarNo: "",
      about: "",
      consultationFee: "0", // Changed reset value from "500" to "0"
    });
    setGeneratedCredentials(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Show credentials screen after successful creation
  if (generatedCredentials) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Doctor Created Successfully!</span>
            </DialogTitle>
            <DialogDescription>
              Auto-generated login credentials for Dr. {formData.firstName}{" "}
              {formData.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Please save these credentials securely. The doctor will use
                these to log into their account.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Login Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={generatedCredentials.email}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedCredentials.email)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Password</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={generatedCredentials.password}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedCredentials.password)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Doctor Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> Dr.{" "}
                    {formData.firstName} {formData.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Specialization:</span>{" "}
                    {formData.specialization}
                  </div>
                  <div>
                    <span className="font-medium">License No:</span>{" "}
                    {formData.licenseNumber}
                  </div>
                  <div>
                    <span className="font-medium">Experience:</span>{" "}
                    {formData.experience} years
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary">
                    <User className="h-3 w-3 mr-1" />
                    Pending Verification
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button
                onClick={() => {
                  const credentials = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`;
                  copyToClipboard(credentials);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Credentials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Doctor</DialogTitle>
          <DialogDescription>
            Add a new doctor to the system. Login credentials will be
            automatically generated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="John"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Smith"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.lastName}
                    </p>
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
                  <Label htmlFor="consultationFee">
                    Consultation Fee (₹) *
                  </Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0" // Changed minimum from "100" to "0"
                    max="10000"
                    value={formData.consultationFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultationFee: e.target.value,
                      })
                    }
                    placeholder="0" // Changed placeholder from "500" to "0"
                    className={errors.consultationFee ? "border-red-500" : ""}
                  />
                  {errors.consultationFee && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.consultationFee}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Medical Street, City, State - 400001"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
              <div>
                <Label htmlFor="about">About (Optional)</Label>
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

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">
                    Medical License Number *
                  </Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        licenseNumber: e.target.value,
                      })
                    }
                    placeholder="DOC123456"
                    className={errors.licenseNumber ? "border-red-500" : ""}
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.licenseNumber}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="aadhaarNo">Aadhaar Number *</Label>
                  <Input
                    id="aadhaarNo"
                    value={formData.aadhaarNo}
                    onChange={(e) =>
                      setFormData({ ...formData, aadhaarNo: e.target.value })
                    }
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className={errors.aadhaarNo ? "border-red-500" : ""}
                  />
                  {errors.aadhaarNo && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.aadhaarNo}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    12-digit Aadhaar number
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Login credentials (email and password) will be automatically
              generated based on the doctor's name and Aadhaar number. The
              doctor will receive these credentials to access their account.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
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
                  Creating Doctor...
                </>
              ) : (
                "Create Doctor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
