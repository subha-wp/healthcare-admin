"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Mail, Building2, Copy, CheckCircle, MapPin } from "lucide-react"

interface CreatePharmacyModalProps {
  isOpen: boolean
  onClose: () => void
  onPharmacyCreated: (pharmacy: any) => void
}

export function CreatePharmacyModal({ isOpen, onClose, onPharmacyCreated }: CreatePharmacyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    address: "",
    gstin: "",
    tradeLicense: "",
    latitude: "",
    longitude: "",
  })
  const [generatedCredentials, setGeneratedCredentials] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateCredentials = () => {
    // Generate email from pharmacy name
    const email = formData.name
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .replace(/\s+/g, ".")
      .replace(/pharmacy$/, "")
    const domain = "@healthcareapp.com"
    const generatedEmail = email + ".pharmacy" + domain

    // Generate secure password
    const generatePassword = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
      let password = ""
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return password
    }

    return {
      email: generatedEmail,
      password: generatePassword(),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Generate credentials
    const credentials = generateCredentials()
    setGeneratedCredentials(credentials)

    // Create pharmacy object
    const newPharmacy = {
      id: Date.now().toString(),
      userId: `user_${Date.now()}`,
      name: formData.name,
      businessName: formData.businessName,
      email: credentials.email,
      phone: formData.phone,
      address: formData.address,
      location: {
        lat: Number.parseFloat(formData.latitude) || 0,
        lng: Number.parseFloat(formData.longitude) || 0,
      },
      gstin: formData.gstin,
      tradeLicense: formData.tradeLicense,
      isVerified: false,
      verificationDate: null,
      avatarUrl: null,
      documents: {
        tradeLicense: null,
        gstin: null,
      },
      chambers: 0,
      totalAppointments: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
    }

    // Simulate API call
    setTimeout(() => {
      onPharmacyCreated(newPharmacy)
      setIsSubmitting(false)
    }, 1000)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

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
    })
    setGeneratedCredentials(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (generatedCredentials) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Pharmacy Created Successfully!</span>
            </DialogTitle>
            <DialogDescription>Auto-generated login credentials for {formData.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Please save these credentials securely. The pharmacy will use these to log into their account.
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
                    <Input value={generatedCredentials.email} readOnly className="font-mono" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedCredentials.email)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Password</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={generatedCredentials.password} readOnly className="font-mono" />
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedCredentials.password)}>
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
                    <span className="font-medium">Business Name:</span> {formData.businessName}
                  </div>
                  <div>
                    <span className="font-medium">GSTIN:</span> {formData.gstin}
                  </div>
                  <div>
                    <span className="font-medium">Trade License:</span> {formData.tradeLicense}
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
                  const credentials = `Email: ${generatedCredentials.email}\nPassword: ${generatedCredentials.password}`
                  copyToClipboard(credentials)
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Credentials
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Pharmacy</DialogTitle>
          <DialogDescription>
            Add a new pharmacy to the system. Login credentials will be automatically generated.
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
                  <Label htmlFor="name">Pharmacy Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="MedPlus Pharmacy"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="MedPlus Healthcare Pvt Ltd"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Health Street, Medical District, City - 400001"
                  required
                />
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
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="27AABCU9603R1ZX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tradeLicense">Trade License Number</Label>
                  <Input
                    id="tradeLicense"
                    value={formData.tradeLicense}
                    onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                    placeholder="TL123456789"
                    required
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
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="72.8777"
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500">Optional: Provide GPS coordinates for accurate location mapping</p>
            </CardContent>
          </Card>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Login credentials (email and password) will be automatically generated based on the pharmacy name. The
              pharmacy will receive these credentials to access their account.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Pharmacy..." : "Create Pharmacy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
