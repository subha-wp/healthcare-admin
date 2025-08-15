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
import { useToast } from "@/hooks/use-toast";
import {
  Key,
  Mail,
  Building2,
  Copy,
  CheckCircle,
  MapPin,
  Loader2,
} from "lucide-react";

interface CreatePharmacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPharmacyCreated: (pharmacy: any) => void;
}

export function CreatePharmacyModal({
  isOpen,
  onClose,
  onPharmacyCreated,
}: CreatePharmacyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    address: "",
    gstin: "",
    tradeLicense: "",
    latitude: "",
    longitude: "",
  });
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Pharmacy name is required";
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    // Validate phone number format
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    // Validate GSTIN format if provided
    if (formData.gstin) {
      const gstinRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(formData.gstin)) {
        newErrors.gstin = "Invalid GSTIN format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateCredentials = () => {
    // Generate email from pharmacy name
    const email = formData.name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".")
      .replace(/pharmacy$/, "");
    const generatedEmail = `${email}.pharmacy@healthcareapp.com`;

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
      // Prepare data for API
      const pharmacyData = {
        name: formData.name,
        businessName: formData.businessName,
        phone: formData.phone,
        address: formData.address,
        gstin: formData.gstin,
        tradeLicense: formData.tradeLicense,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      // Call API to create pharmacy
      const response = await fetch("/api/admin/pharmacies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pharmacyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create pharmacy");
      }

      const result = await response.json();

      // Set credentials for display
      setGeneratedCredentials(result.credentials);

      toast({
        title: "Success",
        description:
          "Pharmacy created successfully with auto-generated credentials",
      });

      // Call the callback with the created pharmacy
      onPharmacyCreated(result.pharmacy);
    } catch (error) {
      console.error("Error creating pharmacy:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create pharmacy",
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
      name: "",
      businessName: "",
      phone: "",
      address: "",
      gstin: "",
      tradeLicense: "",
      latitude: "",
      longitude: "",
    });
    setGeneratedCredentials(null);
    setErrors({});
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
              <span>Pharmacy Created Successfully!</span>
            </DialogTitle>
            <DialogDescription>
              Auto-generated login credentials for {formData.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Please save these credentials securely. The pharmacy will use
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
                <CardTitle className="text-lg">Pharmacy Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.name}
                  </div>
                  <div>
                    <span className="font-medium">Business Name:</span>{" "}
                    {formData.businessName}
                  </div>
                  <div>
                    <span className="font-medium">GSTIN:</span> {formData.gstin}
                  </div>
                  <div>
                    <span className="font-medium">Trade License:</span>{" "}
                    {formData.tradeLicense}
                  </div>
                </div>
                <div className="mt-4">
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
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
          <DialogTitle>Create New Pharmacy</DialogTitle>
          <DialogDescription>
            Add a new pharmacy to the system. Login credentials will be
            automatically generated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Pharmacy Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="MedPlus Pharmacy"
                    className={errors.name ? "border-red-500" : ""}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    placeholder="MedPlus Healthcare Pvt Ltd"
                    className={errors.businessName ? "border-red-500" : ""}
                    required
                  />
                  {errors.businessName && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.businessName}
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
                    required
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
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
                  placeholder="123 Health Street, Medical District, City - 400001"
                  className={errors.address ? "border-red-500" : ""}
                  required
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gstin">GSTIN (Optional)</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) =>
                      setFormData({ ...formData, gstin: e.target.value })
                    }
                    placeholder="27AABCU9603R1ZX"
                    className={errors.gstin ? "border-red-500" : ""}
                  />
                  {errors.gstin && (
                    <p className="text-sm text-red-500 mt-1">{errors.gstin}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="tradeLicense">
                    Trade License Number (Optional)
                  </Label>
                  <Input
                    id="tradeLicense"
                    value={formData.tradeLicense}
                    onChange={(e) =>
                      setFormData({ ...formData, tradeLicense: e.target.value })
                    }
                    placeholder="TL123456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location Coordinates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    placeholder="19.0760"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    placeholder="72.8777"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Optional: Provide GPS coordinates for accurate location mapping
              </p>
            </CardContent>
          </Card>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Login credentials (email and password) will be automatically
              generated based on the pharmacy name. The pharmacy will receive
              these credentials to access their account.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Pharmacy...
                </>
              ) : (
                "Create Pharmacy"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
