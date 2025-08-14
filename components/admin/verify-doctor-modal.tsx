"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, FileText, User, AlertTriangle } from "lucide-react"

interface VerifyDoctorModalProps {
  doctor: any
  isOpen: boolean
  onClose: () => void
  onVerified: (doctorId: string) => void
}

export function VerifyDoctorModal({ doctor, isOpen, onClose, onVerified }: VerifyDoctorModalProps) {
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      onVerified(doctor.id)
      setIsVerifying(false)
      setVerificationNotes("")
    }, 1500)
  }

  const handleReject = () => {
    // Handle rejection logic here
    console.log("Doctor verification rejected:", doctor.id, verificationNotes)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Verify Doctor: {doctor.name}</span>
          </DialogTitle>
          <DialogDescription>Review doctor credentials and approve or reject verification</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Doctor Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {doctor.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {doctor.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {doctor.phone}
                </div>
                <div>
                  <span className="font-medium">Specialization:</span> {doctor.specialization}
                </div>
                <div>
                  <span className="font-medium">Qualification:</span> {doctor.qualification}
                </div>
                <div>
                  <span className="font-medium">Experience:</span> {doctor.experience} years
                </div>
                <div>
                  <span className="font-medium">License No:</span> {doctor.licenseNo}
                </div>
                <div>
                  <span className="font-medium">Aadhaar No:</span> {doctor.aadhaarNo}
                </div>
              </div>
              {doctor.about && (
                <div className="mt-4">
                  <span className="font-medium">About:</span>
                  <p className="text-sm text-slate-600 mt-1">{doctor.about}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Medical License</span>
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
                    <span className="text-sm font-medium">Aadhaar Card</span>
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
                  <span className="text-sm">Medical license number verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Aadhaar number format valid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Professional qualifications reviewed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Contact information verified</span>
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
              Once verified, the doctor will be able to create chambers and accept appointments. Please ensure all
              information is accurate before proceeding.
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
                  Verify Doctor
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
