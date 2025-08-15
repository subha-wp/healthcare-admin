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
  Users,
  Loader2,
  CheckCircle,
  Info,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: any) => void;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  user: { email: string };
}

interface Chamber {
  id: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxSlots: number;
  fees: number;
  doctor: {
    id: string;
    name: string;
    specialization: string;
  };
  pharmacy: {
    id: string;
    name: string;
    address: string;
  };
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onAppointmentCreated,
}: CreateAppointmentModalProps) {
  const [formData, setFormData] = useState({
    patientId: "",
    chamberId: "",
    appointmentDate: undefined as Date | undefined,
    slotNumber: "",
    paymentMethod: "ONLINE",
    notes: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [availableSlots, setAvailableSlots] = useState<number[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingChambers, setLoadingChambers] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const selectedChamber = chambers.find((c) => c.id === formData.chamberId);

  // Fetch patients and chambers
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
      fetchChambers();
    }
  }, [isOpen]);

  // Fetch available slots when chamber and date are selected
  useEffect(() => {
    if (formData.chamberId && formData.appointmentDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.chamberId, formData.appointmentDate]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await fetch("/api/admin/patients");
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to load patients",
        variant: "destructive",
      });
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchChambers = async () => {
    try {
      setLoadingChambers(true);
      const response = await fetch("/api/admin/chambers/active");
      if (response.ok) {
        const data = await response.json();
        setChambers(data.chambers);
      }
    } catch (error) {
      console.error("Error fetching chambers:", error);
      toast({
        title: "Error",
        description: "Failed to load chambers",
        variant: "destructive",
      });
    } finally {
      setLoadingChambers(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await fetch(
        `/api/admin/chambers/${
          formData.chamberId
        }/slots?date=${formData.appointmentDate?.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getSlotTime = (slotNumber: number) => {
    if (!selectedChamber) return "";

    const startTime = new Date(`2000-01-01T${selectedChamber.startTime}:00`);
    const slotStart = new Date(
      startTime.getTime() +
        (slotNumber - 1) * selectedChamber.slotDuration * 60 * 1000
    );
    const slotEnd = new Date(
      slotStart.getTime() + selectedChamber.slotDuration * 60 * 1000
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

    if (!formData.patientId) newErrors.patientId = "Please select a patient";
    if (!formData.chamberId) newErrors.chamberId = "Please select a chamber";
    if (!formData.appointmentDate)
      newErrors.appointmentDate = "Please select a date";
    if (!formData.slotNumber) newErrors.slotNumber = "Please select a slot";

    // Validate appointment date is not in the past
    if (formData.appointmentDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.appointmentDate < today) {
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
      const appointmentData = {
        patientId: formData.patientId,
        chamberId: formData.chamberId,
        appointmentDate: formData.appointmentDate?.toISOString(),
        slotNumber: Number.parseInt(formData.slotNumber),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create appointment");
      }

      const result = await response.json();
      onAppointmentCreated(result.appointment);
      resetForm();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      chamberId: "",
      appointmentDate: undefined,
      slotNumber: "",
      paymentMethod: "ONLINE",
      notes: "",
    });
    setAvailableSlots([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for a patient with a doctor at a pharmacy
            chamber
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Patient Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="patientId">Select Patient *</Label>
                {loadingPatients ? (
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading patients...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, patientId: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.patientId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-slate-500">
                              {patient.phone} • {patient.user.email}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.patientId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.patientId}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chamber Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Chamber Selection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="chamberId">Select Chamber *</Label>
                {loadingChambers ? (
                  <div className="flex items-center space-x-2 p-2 border rounded">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading chambers...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.chamberId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, chamberId: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.chamberId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Choose a chamber" />
                    </SelectTrigger>
                    <SelectContent>
                      {chambers.map((chamber) => (
                        <SelectItem key={chamber.id} value={chamber.id}>
                          <div>
                            <div className="font-medium">
                              {chamber.doctor.name} at {chamber.pharmacy.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {chamber.doctor.specialization} • ₹{chamber.fees}{" "}
                              • {chamber.startTime}-{chamber.endTime}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.chamberId && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.chamberId}
                  </p>
                )}
              </div>

              {/* Selected Chamber Preview */}
              {selectedChamber && (
                <Card className="bg-blue-50 border-blue-200 mt-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Selected Chamber</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Doctor:</span>
                        <p className="font-medium">
                          {selectedChamber.doctor.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {selectedChamber.doctor.specialization}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Pharmacy:</span>
                        <p className="font-medium">
                          {selectedChamber.pharmacy.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {selectedChamber.pharmacy.address.split(",")[0]}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Session Time:</span>
                        <p className="font-medium">
                          {selectedChamber.startTime} -{" "}
                          {selectedChamber.endTime}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">
                          Consultation Fee:
                        </span>
                        <p className="font-medium text-lg">
                          ₹{selectedChamber.fees}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Date & Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Date & Time Selection</span>
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
                  <Label htmlFor="slotNumber">Available Time Slots *</Label>
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
                      disabled={!selectedChamber || !formData.appointmentDate}
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
                  {selectedChamber &&
                    formData.appointmentDate &&
                    availableSlots.length === 0 &&
                    !loadingSlots && (
                      <p className="text-sm text-orange-600 mt-1">
                        No available slots for this date
                      </p>
                    )}
                </div>
              </div>

              {/* Slot Availability Preview */}
              {selectedChamber && formData.appointmentDate && (
                <Card className="bg-slate-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Slot Availability</span>
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from(
                        { length: selectedChamber.maxSlots },
                        (_, i) => i + 1
                      ).map((slotNum) => (
                        <div
                          key={slotNum}
                          className={`p-2 text-center text-xs rounded border ${
                            availableSlots.includes(slotNum)
                              ? "bg-green-100 border-green-300 text-green-800"
                              : "bg-red-100 border-red-300 text-red-800"
                          }`}
                        >
                          <div className="font-medium">#{slotNum}</div>
                          <div>{getSlotTime(slotNum)}</div>
                          <div className="mt-1">
                            {availableSlots.includes(slotNum) ? (
                              <CheckCircle className="h-3 w-3 mx-auto" />
                            ) : (
                              <X className="h-3 w-3 mx-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {availableSlots.length} of {selectedChamber.maxSlots}{" "}
                      slots available
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Payment & Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Payment & Additional Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label>Consultation Fee</Label>
                  <div className="flex items-center space-x-2 p-2 border rounded bg-slate-50">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">
                      ₹{selectedChamber?.fees || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any special instructions or notes for the appointment..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Summary */}
          {selectedChamber &&
            formData.appointmentDate &&
            formData.slotNumber && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800">
                    Appointment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-700">Patient:</span>
                      <p className="font-medium">
                        {
                          patients.find((p) => p.id === formData.patientId)
                            ?.name
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Doctor:</span>
                      <p className="font-medium">
                        {selectedChamber.doctor.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Date:</span>
                      <p className="font-medium">
                        {format(formData.appointmentDate, "PPP")}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Time:</span>
                      <p className="font-medium">
                        {getSlotTime(Number.parseInt(formData.slotNumber))}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Location:</span>
                      <p className="font-medium">
                        {selectedChamber.pharmacy.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-700">Total Amount:</span>
                      <p className="font-medium text-lg">
                        ₹{selectedChamber.fees}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The appointment will be created in pending status. You can confirm
              it after creation. Payment status will be set to pending and can
              be updated when payment is received.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.patientId ||
                !formData.chamberId ||
                !formData.appointmentDate ||
                !formData.slotNumber
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
