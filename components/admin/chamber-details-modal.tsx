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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Activity,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

interface ChamberDetailsModalProps {
  chamber: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (chamber: any) => void;
  onDelete?: (chamberId: string) => void;
}

export function ChamberDetailsModal({
  chamber,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ChamberDetailsModalProps) {
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

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    } as const;

    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const utilizationRate =
    chamber.maxSlots > 0
      ? Math.round((chamber.totalAppointments / chamber.maxSlots) * 100)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
            Complete chamber partnership and performance details
          </DialogDescription>
        </DialogHeader>

        <div className="gap-6">
          {/* Left Column - Main Info */}
          <div className=" space-y-6">
            {/* Partnership Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partnership Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span>Doctor</span>
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-medium text-lg">
                        {chamber.doctor.name}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        {chamber.doctor.specialization}
                      </p>
                      <p className="text-xs text-slate-500">
                        {chamber.doctor.user.email}
                      </p>
                      <Badge variant="default" className="mt-2 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-green-500" />
                      <span>Pharmacy</span>
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium text-lg">
                        {chamber.pharmacy.name}
                      </p>
                      <div className="flex items-center space-x-1 mb-2">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <p className="text-sm text-slate-600">
                          {chamber.pharmacy.address}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {chamber.pharmacy.user.email}
                      </p>
                      <Badge variant="default" className="mt-2 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Schedule & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
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
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Fees:</span>
                      <p className="font-medium text-lg">₹{chamber.fees}</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">
                      Slot Duration:
                    </span>
                    <p className="font-medium">
                      {chamber.slotDuration} minutes
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Max Slots:</span>
                    <p className="font-medium">
                      {chamber.maxSlots} per session
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Created:</span>
                    <p className="font-medium">
                      {new Date(chamber.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {chamber.appointments && chamber.appointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chamber.appointments
                        .slice(0, 5)
                        .map((appointment: any) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {appointment.patient?.name || "N/A"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  #{appointment.id.slice(-6)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                appointment.appointmentDate ||
                                  appointment.createdAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell>₹{appointment.amount}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No appointments yet</p>
                    <p className="text-sm mt-2">
                      Appointments will appear here once patients start booking
                    </p>
                  </div>
                )}
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
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
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
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-semibold">
                    {chamber.completedAppointments || 0}
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
                  <span className="font-semibold">
                    {chamber.rating > 0 ? chamber.rating.toFixed(1) : "N/A"}/5.0
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Utilization Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Utilization Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Slot Utilization</span>
                    <span>{utilizationRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    Average slots booked:{" "}
                    {Math.round(chamber.maxSlots * (utilizationRate / 100))}/
                    {chamber.maxSlots}
                  </p>
                  <p>
                    Revenue per session: ₹
                    {(
                      chamber.fees *
                      Math.round(chamber.maxSlots * (utilizationRate / 100))
                    ).toLocaleString()}
                  </p>
                  <p>
                    Completion rate:{" "}
                    {chamber.totalAppointments > 0
                      ? Math.round(
                          (chamber.completedAppointments /
                            chamber.totalAppointments) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={() => onEdit?.(chamber)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Chamber
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Appointments
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  Performance Report
                </Button>
                {!chamber.isVerified && (
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Chamber
                  </Button>
                )}
                <Separator />
                <Button
                  className="w-full bg-transparent text-red-600 hover:text-red-700"
                  variant="outline"
                  onClick={() => onDelete?.(chamber.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Chamber
                </Button>
              </CardContent>
            </Card>

            {/* Chamber Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chamber Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verification Status</span>
                  <Badge variant={chamber.isVerified ? "default" : "secondary"}>
                    {chamber.isVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Status</span>
                  <Badge variant={chamber.isActive ? "outline" : "secondary"}>
                    {chamber.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created</span>
                  <span className="text-sm">
                    {new Date(chamber.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {chamber.verificationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verified</span>
                    <span className="text-sm">
                      {new Date(chamber.verificationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Performance */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {chamber.totalAppointments}
                  </div>
                  <div className="text-sm text-blue-700">
                    Total Appointments
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{chamber.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700">
                    Revenue Generated
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {chamber.rating > 0 ? chamber.rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-sm text-yellow-700">Average Rating</div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schedule Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="text-center">
                    <div className="font-medium text-lg">
                      {getWeekDayDisplay(chamber.weekNumber, chamber.weekDay)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {chamber.startTime} - {chamber.endTime}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {chamber.maxSlots} slots × {chamber.slotDuration} minutes
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="font-medium">Duration</div>
                    <div>
                      {Math.floor(
                        (new Date(
                          `2000-01-01T${chamber.endTime}:00`
                        ).getTime() -
                          new Date(
                            `2000-01-01T${chamber.startTime}:00`
                          ).getTime()) /
                          (1000 * 60)
                      )}{" "}
                      min
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-100 rounded">
                    <div className="font-medium">Capacity</div>
                    <div>{chamber.maxSlots} patients</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(chamber)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Chamber
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
