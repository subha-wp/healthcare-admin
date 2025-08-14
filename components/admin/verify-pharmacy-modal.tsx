"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, FileText, Building2, AlertTriangle, MapPin } from "lucide-react"

interface VerifyPharmacyModalProps {
  pharmacy: any
  isOpen: boolean
  onClose: () => void
  onVerified: (pharmacyId: string) => void
}

export function VerifyPharmacyModal({ pharmacy, isOpen, onClose, onVerified }: VerifyPharmacyModalProps) {
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      onVerified(pharmacy.id)
      setIsVerifying(false)
      setVerificationNotes("")
    }, 1500)
  }

  const handleReject = () => {
    // Handle rejection logic here
    console.log("Pharmacy verification rejected:", pharmacy.id, verificationNotes)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Verify Pharmacy: {pharmacy.name}</span>
          </DialogTitle>
          <DialogDescription>Review pharmacy business credentials and approve or reject verification</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pharmacy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pharmacy Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {pharmacy.name}
                </div>
                <div>
                  <span className="font-medium">Business Name:</span> {pharmacy.businessName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {pharmacy.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {pharmacy.phone}
                </div>
                <div>
                  <span className="font-medium">GSTIN:</span> {pharmacy.gstin}
                </div>
                <div>
                  <span className="font-medium">Trade License:</span> {pharmacy.tradeLicense}
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">Address:</span>
                </div>
                <p className="text-sm text-slate-600">{pharmacy.address}</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="font-medium text-xs">Latitude:</span> {pharmacy.location.lat}
                  </div>
                  <div>
                    <span className="font-medium text-xs">Longitude:</span> {pharmacy.location.lng}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Trade License Certificate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PDF</Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">GSTIN Certificate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PDF</Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">GSTIN format validated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Trade license number verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Business address confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Contact information verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Location coordinates validated</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Add verification notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about the verification process..."
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Once verified, the pharmacy will be able to partner with doctors for chambers and accept appointments.
              Please ensure all business information is accurate before proceeding.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700 bg-transparent">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? (
                "Verifying..."
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Pharmacy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
