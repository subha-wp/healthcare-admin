"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Building2, User, AlertTriangle } from "lucide-react"

interface VerifyChamberModalProps {
  chamber: any
  isOpen: boolean
  onClose: () => void
  onVerified: (chamberId: string) => void
}

export function VerifyChamberModal({ chamber, isOpen, onClose, onVerified }: VerifyChamberModalProps) {
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const getWeekDayDisplay = (weekNumber: string, weekDay: string) => {
    const weekMap = {
      FIRST: "1st",
      SECOND: "2nd",
      THIRD: "3rd",
      FOURTH: "4th",
      LAST: "Last",
    }
    return `${weekMap[weekNumber]} ${weekDay.charAt(0) + weekDay.slice(1).toLowerCase()}`
  }

  const handleVerify = async () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      onVerified(chamber.id)
      setIsVerifying(false)
      setVerificationNotes("")
    }, 1500)
  }

  const handleReject = () => {
    // Handle rejection logic here
    console.log("Chamber verification rejected:", chamber.id, verificationNotes)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Verify Chamber Partnership</span>
          </DialogTitle>
          <DialogDescription>Review chamber details and approve or reject the partnership</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Partnership Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partnership Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>Doctor Information</span>
                  </h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium">{chamber.doctor.name}</p>
                    <p className="text-sm text-slate-600">{chamber.doctor.specialization}</p>
                    <Badge variant="default" className="mt-2 text-xs">
                      Verified Doctor
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-green-500" />
                    <span>Pharmacy Information</span>
                  </h4>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium">{chamber.pharmacy.name}</p>
                    <p className="text-sm text-slate-600">{chamber.pharmacy.address}</p>
                    <Badge variant="default" className="mt-2 text-xs">
                      Verified Pharmacy
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Pricing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Schedule:</span>{" "}
                  {getWeekDayDisplay(chamber.weekNumber, chamber.weekDay)}
                </div>
                <div>
                  <span className="font-medium">Time:</span> {chamber.startTime} - {chamber.endTime}
                </div>
                <div>
                  <span className="font-medium">Consultation Fees:</span> ₹{chamber.fees}
                </div>
                <div>
                  <span className="font-medium">Slot Duration:</span> {chamber.slotDuration} minutes
                </div>
                <div>
                  <span className="font-medium">Maximum Slots:</span> {chamber.maxSlots} slots per session
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> {new Date(chamber.createdAt).toLocaleDateString()}
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
                  <span className="text-sm">Doctor verification status confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Pharmacy verification status confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Schedule timing is reasonable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Consultation fees are appropriate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Slot configuration is valid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">No scheduling conflicts detected</span>
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
                  placeholder="Add any notes about the verification process or special conditions..."
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Once verified, this chamber will be active and patients will be able to book appointments. The doctor and
              pharmacy will be able to manage their schedules and accept bookings.
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
                  Verify Chamber
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
