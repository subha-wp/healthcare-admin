"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Building2,
  User,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerifyChamberModalProps {
  chamber: any;
  isOpen: boolean;
  onClose: () => void;
  onVerified: (chamberId: string, verified: boolean, notes: string) => void;
}

export function VerifyChamberModal({
  chamber,
  isOpen,
  onClose,
  onVerified,
}: VerifyChamberModalProps) {
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  const getWeekDayDisplay = (weekNumber: string, weekDay: string) => {
    const weekMap = {
      FIRST: "1st",
      SECOND: "2nd",
      THIRD: "3rd",
      FOURTH: "4th",
      LAST: "Last",
    };
    return `${weekMap[weekNumber as keyof typeof weekMap]} ${
      weekDay.charAt(0) + weekDay.slice(1).toLowerCase()
    }`;
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await onVerified(chamber.id, true, verificationNotes);
      toast({
        title: "Success",
        description: "Chamber verified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify chamber",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!verificationNotes.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide rejection notes",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    try {
      await onVerified(chamber.id, false, verificationNotes);
      toast({
        title: "Success",
        description: "Chamber verification rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject chamber",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Verify Chamber Partnership</span>
          </DialogTitle>
          <DialogDescription>
            Review chamber details and approve or reject the partnership
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Partnership Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partnership Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>Doctor Information</span>
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-lg">{chamber.doctor.name}</p>
                    <p className="text-sm text-slate-600 mb-2">
                      {chamber.doctor.specialization}
                    </p>
                    <p className="text-xs text-slate-500">
                      {chamber.doctor.user.email}
                    </p>
                    <Badge variant="default" className="mt-2 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Doctor
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-green-500" />
                    <span>Pharmacy Information</span>
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="font-medium text-lg">
                      {chamber.pharmacy.name}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      {chamber.pharmacy.address}
                    </p>
                    <p className="text-xs text-slate-500">
                      {chamber.pharmacy.user.email}
                    </p>
                    <Badge variant="default" className="mt-2 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
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
              <CardTitle className="text-lg">
                Schedule & Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Schedule:</span>
                      <p className="font-medium">
                        {getWeekDayDisplay(chamber.weekNumber, chamber.weekDay)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Time:</span>
                      <p className="font-medium">
                        {chamber.startTime} - {chamber.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Capacity:</span>
                      <p className="font-medium">
                        {chamber.maxSlots} slots × {chamber.slotDuration}{" "}
                        minutes
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">
                        Consultation Fees:
                      </span>
                      <p className="font-medium text-lg">₹{chamber.fees}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-sm text-slate-500">
                      Potential Daily Revenue:
                    </span>
                    <p className="font-medium text-lg">
                      ₹{(chamber.maxSlots * chamber.fees).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Submitted:</span>
                    <p className="font-medium">
                      {new Date(chamber.createdAt).toLocaleDateString()}
                    </p>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Doctor verification status confirmed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Pharmacy verification status confirmed
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Schedule timing is reasonable
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Consultation fees are appropriate
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Slot configuration is valid</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      No scheduling conflicts detected
                    </span>
                  </div>
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
                <Label htmlFor="notes">
                  Add verification notes (required for rejection)
                </Label>
                <Textarea
                  id="notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add any notes about the verification process, special conditions, or reasons for rejection..."
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Once verified, this chamber will be active and patients will be
              able to book appointments. The doctor and pharmacy will be able to
              manage their schedules and accept bookings.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isVerifying || isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isRejecting || isVerifying}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying || isRejecting}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
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
  );
}
