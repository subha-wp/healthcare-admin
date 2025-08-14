// @ts-nocheck
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  MapPin,
  Star,
  TrendingUp,
} from "lucide-react";

interface ChamberDetailsModalProps {
  chamber: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ChamberDetailsModal({
  chamber,
  isOpen,
  onClose,
}: ChamberDetailsModalProps) {
  const getWeekDayDisplay = (weekNumber: string, weekDay: string) => {
    const weekMap = {
      FIRST: "1st",
      SECOND: "2nd",
      THIRD: "3rd",
      FOURTH: "4th",
      LAST: "Last",
    };
    return `${weekMap[weekNumber]} ${
      weekDay.charAt(0) + weekDay.slice(1).toLowerCase()
    }`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Chamber Details</span>
            <Badge variant={chamber.isVerified ? "default" : "secondary"}>
              {chamber.isVerified ? (
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
            <Badge variant={chamber.isActive ? "outline" : "secondary"}>
              {chamber.isActive ? "Active" : "Inactive"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete chamber partnership and schedule details
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Partnership Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partnership Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Doctor</span>
                    </h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="font-medium">{chamber.doctor.name}</p>
                      <p className="text-sm text-slate-600">
                        {chamber.doctor.specialization}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Pharmacy</span>
                    </h4>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="font-medium">{chamber.pharmacy.name}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <p className="text-sm text-slate-600">
                          {chamber.pharmacy.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule & Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      <span className="text-sm text-slate-500">Max Slots:</span>
                      <p className="font-medium">{chamber.maxSlots} slots</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">
                        Slot Duration:
                      </span>
                      <p className="font-medium">
                        {chamber.slotDuration} minutes
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <div>
                    <span className="text-sm text-slate-500">
                      Consultation Fees:
                    </span>
                    <p className="font-medium text-lg">₹{chamber.fees}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            {chamber.isVerified && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Verified Chamber
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    Verified on{" "}
                    {new Date(chamber.verificationDate).toLocaleDateString()}
                  </p>
                  {chamber.verificationNotes && (
                    <p className="text-sm text-green-600 mt-2">
                      Notes: {chamber.verificationNotes}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Performance Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Total Appointments</span>
                  </div>
                  <span className="font-semibold">
                    {chamber.totalAppointments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Revenue Generated</span>
                  </div>
                  <span className="font-semibold">
                    ₹{chamber.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="font-semibold">{chamber.rating}/5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-sm">
                    {new Date(chamber.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Capacity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capacity Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Utilization Rate</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <p>
                    Average {Math.round(chamber.maxSlots * 0.75)} slots booked
                    per session
                  </p>
                  <p className="mt-1">Peak booking time: 10:00 AM - 11:00 AM</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-transparent" variant="outline">
                  Edit Schedule
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  View Appointments
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  Update Fees
                </Button>
                {!chamber.isVerified && (
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Chamber
                  </Button>
                )}
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => {
                    // Toggle active status
                  }}
                >
                  {chamber.isActive ? "Deactivate" : "Activate"} Chamber
                </Button>
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
  );
}
