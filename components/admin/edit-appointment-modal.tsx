"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  Building2,
  DollarSign,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface EditAppointmentModalProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentUpdated: (appointment: any) => void;
}

export function EditAppointmentModal({
  appointment,
  isOpen,
  onClose,
  onAppointmentUpdated,
}: EditAppointmentModalProps) {
  const [formData, setFormData] = useState({
    appointmentDate: undefined as Date | undefined,
    slotNumber: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    notes: "",
  });
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        appointmentDate: new Date(appointment.appointmentDate),
        slotNumber: appointment.slotNumber.toString(),
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        notes: appointment.notes || "",
      });
    }
  }, [appointment]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (appointment && formData.appointmentDate) {
      fetchAvailableSlots();
    }
  }, [appointment, formData.appointmentDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await fetch(
        `/api/admin/chambers/${
          appointment.chamberId
        }/slots?date=${formData.appointmentDate?.toISOString()}&excludeAppointment=${
          appointment.id
        }`
      );
      if (response.ok) {
        const data = await response.json();
        // Include current slot in available slots
        const currentSlot = appointment.slotNumber;
        const allSlots = [...data.availableSlots, currentSlot].sort(
          (a, b) => a - b
        );
        setAvailableSlots(allSlots);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([appointment.slotNumber]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getSlotTime = (slotNumber: number) => {
    const startTime = new Date(
      `2000-01-01T${appointment.chamber.startTime}:00`
    );
    const slotStart = new Date(
      startTime.getTime() +
        (slotNumber - 1) * appointment.chamber.slotDuration * 60 * 1000
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.appointmentDate)
      newErrors.appointmentDate = "Please select a date";
    if (!formData.slotNumber) newErrors.slotNumber = "Please select a slot";
    if (!formData.status) newErrors.status = "Please select a status";
    if (!formData.paymentStatus)
      newErrors.paymentStatus = "Please select payment status";

    // Validate appointment date is not in the past (unless it's today)
    if (formData.appointmentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.appointmentDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.appointmentDate = "Cannot schedule appointments in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData = {
        appointmentDate: formData.appointmentDate?.toISOString(),
        slotNumber: Number.parseInt(formData.slotNumber),
        status: formData.status,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await fetch(
        `/api/admin/appointments/${appointment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update appointment");
      }

      const result = await response.json();
      onAppointmentUpdated(result.appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (appointment) {
      setFormData({
        appointmentDate: new Date(appointment.appointmentDate),
        slotNumber: appointment.slotNumber.toString(),
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        notes: appointment.notes || "",
      });
    }
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  const canEditDateTime = () => {
    return !["COMPLETED", "CANCELLED"].includes(appointment.status);
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Edit Appointment</span>
            <Badge className="font-mono text-xs">
              #{appointment.id.slice(-8)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update appointment details, status, and payment information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Appointment Info (Read-only) */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">
                Current Appointment (Read-only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Patient:</span>
                  <p className="font-medium">{appointment.patient.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Doctor:</span>
                  <p className="font-medium">{appointment.doctor.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Pharmacy:</span>
                  <p className="font-medium">{appointment.pharmacy.name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Original Date:</span>
                  <p className="font-medium">
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Date & Time</span>
                {!canEditDateTime() && (
                  <Badge variant="secondary">Read-only</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Appointment Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !formData.appointmentDate
                            ? "text-muted-foreground"
                            : ""
                        } ${errors.appointmentDate ? "border-red-500" : ""}`}
                        disabled={!canEditDateTime()}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.appointmentDate ? (
                          format(formData.appointmentDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.appointmentDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, appointmentDate: date })
                        }
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.appointmentDate && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.appointmentDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slotNumber">Time Slot *</Label>
                  {loadingSlots ? (
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading slots...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.slotNumber}
                      onValueChange={(value) =>
                        setFormData({ ...formData, slotNumber: value })
                      }
                      disabled={!canEditDateTime()}
                    >
                      <SelectTrigger
                        className={errors.slotNumber ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((slotNumber) => (
                          <SelectItem
                            key={slotNumber}
                            value={slotNumber.toString()}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>Slot #{slotNumber}</span>
                              <span className="text-sm text-slate-500 ml-4">
                                {getSlotTime(slotNumber)}
                              </span>
                              {slotNumber === appointment.slotNumber && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Current
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.slotNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.slotNumber}
                    </p>
                  )}
                </div>
              </div>

              {!canEditDateTime() && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Date and time cannot be changed for{" "}
                    {appointment.status.toLowerCase()} appointments.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Appointment Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.status ? "border-red-500" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentStatus">Payment Status *</Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentStatus: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.paymentStatus ? "border-red-500" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.paymentStatus && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.paymentStatus}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online Payment</SelectItem>
                      <SelectItem value="CASH">Cash Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status Preview */}
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm text-slate-500">New Status:</span>
                  <div className="mt-1">{getStatusBadge(formData.status)}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Payment:</span>
                  <div className="mt-1">
                    <Badge
                      className={
                        formData.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : formData.paymentStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {formData.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="notes">Update Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add any notes about the appointment changes..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Warning for status changes */}
          {(formData.status !== appointment.status ||
            formData.paymentStatus !== appointment.paymentStatus) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to change the appointment status. This may trigger
                notifications to the patient and doctor. Please ensure the
                changes are accurate.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Appointment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
