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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building2,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  Edit,
  X,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDetailsModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (appointmentId: string, status: string) => void;
  onPaymentUpdate: (appointmentId: string, paymentStatus: string) => void;
  onEdit: () => void;
}

export function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onStatusUpdate,
  onPaymentUpdate,
  onEdit,
}: AppointmentDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const { toast } = useToast();

  const getSlotTime = () => {
    const startTime = new Date(
      `2000-01-01T${appointment.chamber.startTime}:00`
    );
    const slotStart = new Date(
      startTime.getTime() +
        (appointment.slotNumber - 1) *
          appointment.chamber.slotDuration *
          60 *
          1000
    );
    const slotEnd = new Date(
      slotStart.getTime() + appointment.chamber.slotDuration * 60 * 1000
    );

    return `${slotStart.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} - ${slotEnd.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    } as const;

    const icons = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      COMPLETED: CheckCircle,
      CANCELLED: X,
    };

    const Icon = icons[status as keyof typeof icons];

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    } as const;

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(appointment.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentChange = async (newPaymentStatus: string) => {
    setIsUpdatingPayment(true);
    try {
      await onPaymentUpdate(appointment.id, newPaymentStatus);
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const canUpdateStatus = () => {
    return !["COMPLETED", "CANCELLED"].includes(appointment.status);
  };

  const canUpdatePayment = () => {
    return appointment.paymentStatus !== "REFUNDED";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Appointment Details</span>
            <Badge className="font-mono text-xs">
              #{appointment.id.slice(-8)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete appointment information and management options
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Appointment Overview</span>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    {getPaymentBadge(appointment.paymentStatus)}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Date:</span>
                      <p className="font-medium">
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Time:</span>
                      <p className="font-medium">{getSlotTime()}</p>
                      <p className="text-xs text-slate-400">
                        Slot #{appointment.slotNumber} (
                        {appointment.chamber.slotDuration} min)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Amount:</span>
                      <p className="font-medium text-lg">
                        ₹{appointment.amount}
                      </p>
                      <p className="text-xs text-slate-400">
                        {appointment.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-slate-500" />
                    <div>
                      <span className="text-sm text-slate-500">Created:</span>
                      <p className="font-medium">
                        {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span>Patient Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    {appointment.patient.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-slate-500" />
                      <span>{appointment.patient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-slate-500" />
                      <span>{appointment.patient.user.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Stethoscope className="h-4 w-4 text-green-500" />
                  <span>Doctor Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    {appointment.doctor.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Specialization:</span>
                      <p className="font-medium">
                        {appointment.doctor.specialization}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-slate-500" />
                      <span>{appointment.doctor.user.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pharmacy Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <span>Pharmacy Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">
                    {appointment.pharmacy.name}
                  </h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{appointment.pharmacy.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-slate-500" />
                      <span>{appointment.pharmacy.user.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Record */}
            {appointment.medicalRecord && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Medical Record</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-slate-500">
                          Diagnosis:
                        </span>
                        <p className="font-medium">
                          {appointment.medicalRecord.diagnosis}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-slate-500">
                          Prescription:
                        </span>
                        <p className="font-medium">
                          {appointment.medicalRecord.prescription}
                        </p>
                      </div>
                      {appointment.medicalRecord.notes && (
                        <div>
                          <span className="text-sm text-slate-500">Notes:</span>
                          <p className="text-sm text-slate-600">
                            {appointment.medicalRecord.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Appointment
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Medical Record
                </Button>
                <Button className="w-full bg-transparent" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Patient
                </Button>
                {appointment.status !== "CANCELLED" &&
                  appointment.status !== "COMPLETED" && (
                    <Button
                      className="w-full bg-transparent text-red-600 hover:text-red-700"
                      variant="outline"
                      onClick={() =>
                        onStatusUpdate(appointment.id, "CANCELLED")
                      }
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  )}
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Appointment Status
                  </label>
                  <Select
                    value={appointment.status}
                    onValueChange={handleStatusChange}
                    disabled={
                      !canUpdateStatus() ||
                      isUpdatingStatus ||
                      isUpdatingPayment
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {!canUpdateStatus() && (
                    <p className="text-xs text-slate-500 mt-1">
                      Status cannot be changed for{" "}
                      {appointment.status.toLowerCase()} appointments
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Payment Status
                  </label>
                  <Select
                    value={appointment.paymentStatus}
                    onValueChange={handlePaymentChange}
                    disabled={
                      !canUpdatePayment() ||
                      isUpdatingStatus ||
                      isUpdatingPayment
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  {!canUpdatePayment() && (
                    <p className="text-xs text-slate-500 mt-1">
                      Payment status cannot be changed for refunded payments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Appointment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="text-sm">
                      <p className="font-medium">Appointment Created</p>
                      <p className="text-slate-500">
                        {new Date(appointment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {appointment.status === "CONFIRMED" && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div className="text-sm">
                        <p className="font-medium">Confirmed</p>
                        <p className="text-slate-500">Ready for consultation</p>
                      </div>
                    </div>
                  )}
                  {appointment.status === "COMPLETED" && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <div className="text-sm">
                        <p className="font-medium">Consultation Completed</p>
                        <p className="text-slate-500">
                          Medical record available
                        </p>
                      </div>
                    </div>
                  )}
                  {appointment.status === "CANCELLED" && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <div className="text-sm">
                        <p className="font-medium">Appointment Cancelled</p>
                        <p className="text-slate-500">
                          {appointment.paymentStatus === "REFUNDED"
                            ? "Payment refunded"
                            : "Refund pending"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chamber Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chamber Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Chamber Fees:</span>
                      <p className="font-medium">₹{appointment.chamber.fees}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Session Duration:</span>
                      <p className="font-medium">
                        {appointment.chamber.startTime} -{" "}
                        {appointment.chamber.endTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Slot Duration:</span>
                      <p className="font-medium">
                        {appointment.chamber.slotDuration} minutes
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Chamber ID:</span>
                      <p className="font-medium font-mono text-xs">
                        {appointment.chamber.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="mb-2">
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="mb-2">
                    {getPaymentBadge(appointment.paymentStatus)}
                  </div>
                  <p className="text-xs text-slate-500">
                    Last updated:{" "}
                    {new Date(
                      appointment.updatedAt || appointment.createdAt
                    ).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Consultation Fee</span>
                  <span className="font-medium">₹{appointment.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Method</span>
                  <Badge variant="outline">{appointment.paymentMethod}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Status</span>
                  {getPaymentBadge(appointment.paymentStatus)}
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium">
                  <span>Total Amount</span>
                  <span className="text-lg">₹{appointment.amount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {appointment.status === "PENDING" && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Appointment requires confirmation
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {appointment.paymentStatus === "PENDING" && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-orange-800">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Payment pending: ₹{appointment.amount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Appointment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
