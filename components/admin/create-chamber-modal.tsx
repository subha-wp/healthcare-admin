"use client";

import type React from "react";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  Users,
  Info,
} from "lucide-react";

interface CreateChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChamberCreated: (chamber: any) => void;
}

// Mock data for doctors and pharmacies - replace with actual API calls
const mockDoctors = [
  {
    id: "doc1",
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    isVerified: true,
  },
  {
    id: "doc2",
    name: "Dr. Michael Chen",
    specialization: "Neurology",
    isVerified: true,
  },
  {
    id: "doc3",
    name: "Dr. Emily Davis",
    specialization: "Pediatrics",
    isVerified: false,
  },
];

const mockPharmacies = [
  {
    id: "pharm1",
    name: "MedPlus Pharmacy",
    address: "123 Health Street",
    isVerified: true,
  },
  {
    id: "pharm2",
    name: "Apollo Pharmacy",
    address: "456 Wellness Avenue",
    isVerified: true,
  },
  {
    id: "pharm3",
    name: "HealthCare Pharmacy",
    address: "789 Medical Plaza",
    isVerified: false,
  },
];

export function CreateChamberModal({
  isOpen,
  onClose,
  onChamberCreated,
}: CreateChamberModalProps) {
  const [formData, setFormData] = useState({
    doctorId: "",
    pharmacyId: "",
    weekNumber: "",
    weekDay: "",
    startTime: "",
    endTime: "",
    fees: "",
    slotDuration: "30",
    maxSlots: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDoctor = mockDoctors.find((d) => d.id === formData.doctorId);
  const selectedPharmacy = mockPharmacies.find(
    (p) => p.id === formData.pharmacyId
  );

  const verifiedDoctors = mockDoctors.filter((d) => d.isVerified);
  const verifiedPharmacies = mockPharmacies.filter((p) => p.isVerified);

  const calculateMaxSlots = () => {
    if (formData.startTime && formData.endTime && formData.slotDuration) {
      const start = new Date(`2000-01-01 ${formData.startTime}`);
      const end = new Date(`2000-01-01 ${formData.endTime}`);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      const maxPossibleSlots = Math.floor(
        durationMinutes / Number.parseInt(formData.slotDuration)
      );
      return maxPossibleSlots;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newChamber = {
      id: Date.now().toString(),
      doctorId: formData.doctorId,
      pharmacyId: formData.pharmacyId,
      doctor: {
        name: selectedDoctor?.name || "",
        specialization: selectedDoctor?.specialization || "",
      },
      pharmacy: {
        name: selectedPharmacy?.name || "",
        address: selectedPharmacy?.address || "",
      },
      weekNumber: formData.weekNumber,
      weekDay: formData.weekDay,
      startTime: formData.startTime,
      endTime: formData.endTime,
      fees: Number.parseFloat(formData.fees),
      slotDuration: Number.parseInt(formData.slotDuration),
      maxSlots: Number.parseInt(formData.maxSlots),
      isActive: true,
      isVerified: false,
      verificationDate: null,
      verificationNotes: null,
      totalAppointments: 0,
      revenue: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      onChamberCreated(newChamber);
      setIsSubmitting(false);
      resetForm();
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      doctorId: "",
      pharmacyId: "",
      weekNumber: "",
      weekDay: "",
      startTime: "",
      endTime: "",
      fees: "",
      slotDuration: "30",
      maxSlots: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chamber</DialogTitle>
          <DialogDescription>
            Set up a new doctor-pharmacy partnership with schedule and pricing
            details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partnership Selection */}
          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Partnership Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="doctorId"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Select Doctor</span>
                  </Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, doctorId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a verified doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {verifiedDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-sm text-slate-500">
                              {doctor.specialization}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="pharmacyId"
                    className="flex items-center space-x-2"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Select Pharmacy</span>
                  </Label>
                  <Select
                    value={formData.pharmacyId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, pharmacyId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a verified pharmacy" />
                    </SelectTrigger>
                    <SelectContent>
                      {verifiedPharmacies.map((pharmacy) => (
                        <SelectItem key={pharmacy.id} value={pharmacy.id}>
                          <div>
                            <div className="font-medium">{pharmacy.name}</div>
                            <div className="text-sm text-slate-500">
                              {pharmacy.address}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekNumber">Week of Month</Label>
                  <Select
                    value={formData.weekNumber}
                    onValueChange={(value) =>
                      setFormData({ ...formData, weekNumber: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIRST">1st Week</SelectItem>
                      <SelectItem value="SECOND">2nd Week</SelectItem>
                      <SelectItem value="THIRD">3rd Week</SelectItem>
                      <SelectItem value="FOURTH">4th Week</SelectItem>
                      <SelectItem value="LAST">Last Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weekDay">Day of Week</Label>
                  <Select
                    value={formData.weekDay}
                    onValueChange={(value) =>
                      setFormData({ ...formData, weekDay: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONDAY">Monday</SelectItem>
                      <SelectItem value="TUESDAY">Tuesday</SelectItem>
                      <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                      <SelectItem value="THURSDAY">Thursday</SelectItem>
                      <SelectItem value="FRIDAY">Friday</SelectItem>
                      <SelectItem value="SATURDAY">Saturday</SelectItem>
                      <SelectItem value="SUNDAY">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Capacity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Pricing & Capacity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fees">Consultation Fees (₹)</Label>
                  <Input
                    id="fees"
                    type="number"
                    value={formData.fees}
                    onChange={(e) =>
                      setFormData({ ...formData, fees: e.target.value })
                    }
                    placeholder="500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                  <Select
                    value={formData.slotDuration}
                    onValueChange={(value) =>
                      setFormData({ ...formData, slotDuration: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="maxSlots"
                    className="flex items-center space-x-2"
                  >
                    <Users className="h-4 w-4" />
                    <span>Max Slots</span>
                  </Label>
                  <Input
                    id="maxSlots"
                    type="number"
                    value={formData.maxSlots}
                    onChange={(e) =>
                      setFormData({ ...formData, maxSlots: e.target.value })
                    }
                    placeholder={calculateMaxSlots().toString()}
                    max={calculateMaxSlots()}
                    required
                  />
                  {calculateMaxSlots() > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Maximum possible: {calculateMaxSlots()} slots
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The chamber will be created in pending status and require admin
              verification before becoming active. Both doctor and pharmacy must
              be verified to create a chamber.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !formData.doctorId || !formData.pharmacyId
              }
            >
              {isSubmitting ? "Creating Chamber..." : "Create Chamber"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
