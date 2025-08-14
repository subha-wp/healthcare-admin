"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  Star,
  Users,
  Download,
  Globe,
} from "lucide-react"

interface PharmacyDetailsModalProps {
  pharmacy: any
  isOpen: boolean
  onClose: () => void
}

export function PharmacyDetailsModal({ pharmacy, isOpen, onClose }: PharmacyDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{pharmacy.name}</span>
            <Badge variant={pharmacy.isVerified ? "default" : "secondary"}>
              {pharmacy.isVerified ? (
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
          <DialogDescription>Complete pharmacy profile and business verification details</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{pharmacy.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{pharmacy.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span className="text-sm">{pharmacy.businessName}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>Address</span>
                  </h4>
                  <p className="text-sm text-slate-600">{pharmacy.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Latitude</h4>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">{pharmacy.location.lat}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Longitude</h4>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">{pharmacy.location.lng}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Registration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Business Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">GSTIN</h4>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">{pharmacy.gstin}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Trade License</h4>
                    <p className="text-sm font-mono bg-slate-100 p-2 rounded">{pharmacy.tradeLicense}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Business Documents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm">Trade License Certificate</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span className="text-sm">GSTIN Certificate</span>
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
            {pharmacy.isVerified && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Verified Pharmacy</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Verified on {new Date(pharmacy.verificationDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-green-600 mt-2">Business registration and documents have been validated</p>
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
                  <span className="font-semibold">{pharmacy.rating}/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Active Chambers</span>
                  </div>
                  <span className="font-semibold">{pharmacy.chambers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Total Appointments</span>
                  </div>
                  <span className="font-semibold">{pharmacy.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Registered</span>
                  </div>
                  <span className="text-sm">{new Date(pharmacy.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Map preview</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
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
                {!pharmacy.isVerified && (
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Pharmacy
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
  )
}
