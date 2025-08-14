"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: (user: any) => void
}

export function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    // Patient fields
    patientName: "",
    patientPhone: "",
    patientAddress: "",
    dateOfBirth: "",
    bloodGroup: "",
    // Doctor fields
    doctorName: "",
    doctorPhone: "",
    specialization: "",
    qualification: "",
    experience: "",
    licenseNo: "",
    aadhaarNo: "",
    about: "",
    // Pharmacy fields
    pharmacyName: "",
    businessName: "",
    pharmacyPhone: "",
    pharmacyAddress: "",
    gstin: "",
    tradeLicense: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Create user object based on role
    const newUser = {
      id: Date.now().toString(),
      email: formData.email,
      role: formData.role,
      createdAt: new Date().toISOString(),
      avatarUrl: null,
    }

    // Add role-specific data
    if (formData.role === "PATIENT") {
      newUser.patient = {
        name: formData.patientName,
        phone: formData.patientPhone,
        address: formData.patientAddress,
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
      }
    } else if (formData.role === "DOCTOR") {
      newUser.doctor = {
        name: formData.doctorName,
        phone: formData.doctorPhone,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: Number.parseInt(formData.experience),
        licenseNo: formData.licenseNo,
        aadhaarNo: formData.aadhaarNo,
        about: formData.about,
      }
    } else if (formData.role === "PHARMACY") {
      newUser.pharmacy = {
        name: formData.pharmacyName,
        businessName: formData.businessName,
        phone: formData.pharmacyPhone,
        address: formData.pharmacyAddress,
        gstin: formData.gstin,
        tradeLicense: formData.tradeLicense,
      }
    }

    onUserCreated(newUser)

    // Reset form
    setFormData({
      email: "",
      password: "",
      role: "",
      patientName: "",
      patientPhone: "",
      patientAddress: "",
      dateOfBirth: "",
      bloodGroup: "",
      doctorName: "",
      doctorPhone: "",
      specialization: "",
      qualification: "",
      experience: "",
      licenseNo: "",
      aadhaarNo: "",
      about: "",
      pharmacyName: "",
      businessName: "",
      pharmacyPhone: "",
      pharmacyAddress: "",
      gstin: "",
      tradeLicense: "",
    })
  }

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "PATIENT":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientName">Full Name</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="patientPhone">Phone Number</Label>
                  <Input
                    id="patientPhone"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup}
                    onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="patientAddress">Address</Label>
                <Textarea
                  id="patientAddress"
                  value={formData.patientAddress}
                  onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )

      case "DOCTOR":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="doctorName">Full Name</Label>
                  <Input
                    id="doctorName"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="doctorPhone">Phone Number</Label>
                  <Input
                    id="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNo">License Number</Label>
                  <Input
                    id="licenseNo"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="aadhaarNo">Aadhaar Number</Label>
                <Input
                  id="aadhaarNo"
                  value={formData.aadhaarNo}
                  onChange={(e) => setFormData({ ...formData, aadhaarNo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Brief description about the doctor..."
                />
              </div>
            </CardContent>
          </Card>
        )

      case "PHARMACY":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pharmacy Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    value={formData.pharmacyName}
                    onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pharmacyPhone">Phone Number</Label>
                  <Input
                    id="pharmacyPhone"
                    value={formData.pharmacyPhone}
                    onChange={(e) => setFormData({ ...formData, pharmacyPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tradeLicense">Trade License</Label>
                <Input
                  id="tradeLicense"
                  value={formData.tradeLicense}
                  onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pharmacyAddress">Address</Label>
                <Textarea
                  id="pharmacyAddress"
                  value={formData.pharmacyAddress}
                  onChange={(e) => setFormData({ ...formData, pharmacyAddress: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to the system with their role-specific information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">User Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PATIENT">Patient</SelectItem>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="PHARMACY">Pharmacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Role-specific fields */}
          {renderRoleSpecificFields()}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
