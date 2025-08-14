//@ts-nocheck
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
import { Key, Mail, User, Copy, CheckCircle } from "lucide-react";

interface CreateDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorCreated: (doctor: any) => void;
}

export function CreateDoctorModal({
  isOpen,
  onClose,
  onDoctorCreated,
}: CreateDoctorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    licenseNo: "",
    aadhaarNo: "",
    about: "",
  });
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateCredentials = () => {
    // Generate email from name
    const email = formData.name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".")
      .replace(/^dr\.?/, "dr.");
    const domain = "@healthcareapp.com";
    const generatedEmail = email + domain;

    // Generate secure password
    const generatePassword = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    return {
      email: generatedEmail,
      password: generatePassword(),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate credentials
    const credentials = generateCredentials();
    setGeneratedCredentials(credentials);

    // Create doctor object
    const newDoctor = {
      id: Date.now().toString(),
      userId: `user_${Date.now()}`,
      name: formData.name,
      email: credentials.email,
      phone: formData.phone,
      specialization: formData.specialization,
      qualification: formData.qualification,
      experience: Number.parseInt(formData.experience),
      licenseNo: formData.licenseNo,
      aadhaarNo: formData.aadhaarNo,
      about: formData.about,
      isVerified: false,
      verificationDate: null,
      avatarUrl: null,
      documents: {
        license: null,
        aadhaar: null,
      },
      chambers: 0,
      totalAppointments: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      onDoctorCreated(newDoctor);
      setIsSubmitting(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      specialization: "",
      qualification: "",
      experience: "",
      licenseNo: "",
      aadhaarNo: "",
      about: "",
    });
    setGeneratedCredentials(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
              Auto-generated login credentials for {formData.name}
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
                    <span className="font-medium">Name:</span> {formData.name}
                  </div>
                  <div>
                    <span className="font-medium">Specialization:</span>{" "}
                    {formData.specialization}
                  </div>
                  <div>
                    <span className="font-medium">License No:</span>{" "}
                    {formData.licenseNo}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                  placeholder="MD, MBBS"
                  required
                />
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNo">Medical License Number</Label>
                  <Input
                    id="licenseNo"
                    value={formData.licenseNo}
                    onChange={(e) =>
                      setFormData({ ...formData, licenseNo: e.target.value })
                    }
                    placeholder="DOC123456"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarNo">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNo"
                    value={formData.aadhaarNo}
                    onChange={(e) =>
                      setFormData({ ...formData, aadhaarNo: e.target.value })
                    }
                    placeholder="1234-5678-9012"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Login credentials (email and password) will be automatically
              generated based on the doctor's name. The doctor will receive
              these credentials to access their account.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Doctor..." : "Create Doctor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
