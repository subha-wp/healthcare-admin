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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  Users,
  Info,
  CheckCircle,
  Clock,
  Repeat,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChamberCreated: (chamber: any) => void;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  user: { email: string };
}

interface Pharmacy {
  id: string;
  name: string;
  businessName: string;
  address: string;
  user: { email: string };
}

export function CreateChamberModal({
  isOpen,
  onClose,
  onChamberCreated,
}: CreateChamberModalProps) {
  const [formData, setFormData] = useState({
    doctorId: "",
    pharmacyId: "",
    scheduleType: "",
    weekDay: "",
    weekNumbers: [] as string[],
    isRecurring: true,
    startTime: "",
    endTime: "",
    fees: "",
    slotDuration: "30",
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);
  const selectedPharmacy = pharmacies.find((p) => p.id === formData.pharmacyId);

  // Fetch verified doctors and pharmacies
  useEffect(() => {
    if (isOpen) {
      fetchVerifiedDoctors();
      fetchVerifiedPharmacies();
    }
  }, [isOpen]);

  const fetchVerifiedDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await fetch("/api/admin/doctors/verified");
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchVerifiedPharmacies = async () => {
    try {
      setLoadingPharmacies(true);
      const response = await fetch("/api/admin/pharmacies/verified");
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data.pharmacies);
      }
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      toast({
        title: "Error",
        description: "Failed to load pharmacies",
        variant: "destructive",
      });
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const calculateMaxSlots = () => {
    if (formData.startTime && formData.endTime && formData.slotDuration) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(`2000-01-01T${formData.endTime}:00`);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      const maxPossibleSlots = Math.floor(
        durationMinutes / Number.parseInt(formData.slotDuration)
      );
      return maxPossibleSlots > 0 ? maxPossibleSlots : 0;
    }
    return 0;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.doctorId) newErrors.doctorId = "Please select a doctor";
    if (!formData.pharmacyId) newErrors.pharmacyId = "Please select a pharmacy";
    if (!formData.scheduleType)
      newErrors.scheduleType = "Please select schedule type";
    if (!formData.weekDay) newErrors.weekDay = "Please select week day";

    if (
      formData.scheduleType === "MONTHLY_SPECIFIC" &&
      formData.weekNumbers.length === 0
    ) {
      newErrors.weekNumbers =
        "Please select at least one week number for monthly schedule";
    }

    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.fees) newErrors.fees = "Consultation fees are required";

    // Validate time range
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`);
      const end = new Date(`2000-01-01T${formData.endTime}:00`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Validate fees
    if (formData.fees && Number.parseFloat(formData.fees) <= 0) {
      newErrors.fees = "Fees must be greater than 0";
    }

    const maxSlots = calculateMaxSlots();
    if (maxSlots <= 0) {
      newErrors.slotDuration = "Invalid time range or slot duration";
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
      const chamberData = {
        doctorId: formData.doctorId,
        pharmacyId: formData.pharmacyId,
        scheduleType: formData.scheduleType,
        weekDay: formData.weekDay,
        weekNumbers:
          formData.scheduleType === "MONTHLY_SPECIFIC"
            ? formData.weekNumbers
            : [],
        isRecurring: formData.scheduleType === "WEEKLY_RECURRING",
        startTime: formData.startTime,
        endTime: formData.endTime,
        slotDuration: Number.parseInt(formData.slotDuration),
        fees: Number.parseFloat(formData.fees),
      };

      const response = await fetch("/api/admin/chambers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chamberData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create chamber");
      }

      const result = await response.json();
      onChamberCreated(result.chamber);
      resetForm();
    } catch (error) {
      console.error("Error creating chamber:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create chamber",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: "",
      pharmacyId: "",
      scheduleType: "",
      weekDay: "",
      weekNumbers: [],
      isRecurring: true,
      startTime: "",
      endTime: "",
      fees: "",
      slotDuration: "30",
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Auto-fill fees when doctor is selected
  useEffect(() => {
    if (selectedDoctor && !formData.fees) {
      setFormData((prev) => ({
        ...prev,
        fees: selectedDoctor.consultationFee.toString(),
      }));
    }
  }, [selectedDoctor, formData.fees]);

  // Reset week numbers when schedule type changes
  useEffect(() => {
    if (formData.scheduleType === "WEEKLY_RECURRING") {
      setFormData((prev) => ({ ...prev, weekNumbers: [], isRecurring: true }));
    } else if (formData.scheduleType === "MONTHLY_SPECIFIC") {
      setFormData((prev) => ({ ...prev, isRecurring: false }));
    }
  }, [formData.scheduleType]);

  const handleWeekNumberToggle = (weekNumber: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      weekNumbers: checked
        ? [...prev.weekNumbers, weekNumber]
        : prev.weekNumbers.filter((w) => w !== weekNumber),
    }));
  };

  const getScheduleDescription = () => {
    if (!formData.scheduleType || !formData.weekDay) return "";

    const dayName =
      formData.weekDay.charAt(0) + formData.weekDay.slice(1).toLowerCase();

    if (formData.scheduleType === "WEEKLY_RECURRING") {
      return `Every ${dayName}`;
    } else if (
      formData.scheduleType === "MONTHLY_SPECIFIC" &&
      formData.weekNumbers.length > 0
    ) {
      const weekMap = {
        FIRST: "1st",
        SECOND: "2nd",
        THIRD: "3rd",
        FOURTH: "4th",
        LAST: "Last",
      };
      const weekDescriptions = formData.weekNumbers.map(
        (w) => weekMap[w as keyof typeof weekMap]
      );
      return `${weekDescriptions.join(" and ")} ${dayName} of every month`;
    }

    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chamber</DialogTitle>
          <DialogDescription>
            Set up a new doctor-pharmacy partnership with flexible scheduling
            options
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partnership Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partnership Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="doctorId"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Select Doctor *</span>
                  </Label>
                  {loadingDoctors ? (
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading doctors...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.doctorId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, doctorId: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.doctorId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Choose a verified doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{doctor.name}</div>
                                <div className="text-sm text-slate-500">
                                  {doctor.specialization}
                                </div>
                              </div>
                              <Badge variant="default" className="ml-2">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.doctorId && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.doctorId}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="pharmacyId"
                    className="flex items-center space-x-2"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Select Pharmacy *</span>
                  </Label>
                  {loadingPharmacies ? (
                    <div className="flex items-center space-x-2 p-2 border rounded">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Loading pharmacies...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.pharmacyId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, pharmacyId: value })
                      }
                    >
                      <SelectTrigger
                        className={errors.pharmacyId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Choose a verified pharmacy" />
                      </SelectTrigger>
                      <SelectContent>
                        {pharmacies.map((pharmacy) => (
                          <SelectItem key={pharmacy.id} value={pharmacy.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">
                                  {pharmacy.name}
                                </div>
                                <div className="text-sm text-slate-500 truncate max-w-48">
                                  {pharmacy.address.split(",")[0]}
                                </div>
                              </div>
                              <Badge variant="default" className="ml-2">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.pharmacyId && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.pharmacyId}
                    </p>
                  )}
                </div>
              </div>

              {/* Selected Partnership Preview */}
              {selectedDoctor && selectedPharmacy && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Selected Partnership</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Doctor:</span>{" "}
                        {selectedDoctor.name}
                        <br />
                        <span className="text-slate-600">
                          {selectedDoctor.specialization}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Pharmacy:</span>{" "}
                        {selectedPharmacy.name}
                        <br />
                        <span className="text-slate-600">
                          {selectedPharmacy.address.split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Schedule Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Schedule Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Schedule Type Selection */}
              <div>
                <Label htmlFor="scheduleType">Schedule Type *</Label>
                <Select
                  value={formData.scheduleType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, scheduleType: value })
                  }
                >
                  <SelectTrigger
                    className={errors.scheduleType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Choose schedule pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY_RECURRING">
                      <div className="flex items-center space-x-2">
                        <Repeat className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Weekly Recurring</div>
                          <div className="text-xs text-slate-500">
                            Every Monday, Every Sunday, etc.
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="MONTHLY_SPECIFIC">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Monthly Specific</div>
                          <div className="text-xs text-slate-500">
                            2nd & 4th Sunday, 1st & 3rd Friday, etc.
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.scheduleType && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.scheduleType}
                  </p>
                )}
              </div>

              {/* Day Selection */}
              <div>
                <Label htmlFor="weekDay">Day of Week *</Label>
                <Select
                  value={formData.weekDay}
                  onValueChange={(value) =>
                    setFormData({ ...formData, weekDay: value })
                  }
                >
                  <SelectTrigger
                    className={errors.weekDay ? "border-red-500" : ""}
                  >
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
                {errors.weekDay && (
                  <p className="text-sm text-red-500 mt-1">{errors.weekDay}</p>
                )}
              </div>

              {/* Week Numbers Selection for Monthly Specific */}
              {formData.scheduleType === "MONTHLY_SPECIFIC" && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Select Week Numbers *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "FIRST", label: "1st Week" },
                      { value: "SECOND", label: "2nd Week" },
                      { value: "THIRD", label: "3rd Week" },
                      { value: "FOURTH", label: "4th Week" },
                      { value: "LAST", label: "Last Week" },
                    ].map((week) => (
                      <div
                        key={week.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={week.value}
                          checked={formData.weekNumbers.includes(week.value)}
                          onCheckedChange={(checked) =>
                            handleWeekNumberToggle(
                              week.value,
                              checked as boolean
                            )
                          }
                        />
                        <Label htmlFor={week.value} className="text-sm">
                          {week.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.weekNumbers && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.weekNumbers}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Select multiple weeks for patterns like "2nd and 4th Sunday"
                  </p>
                </div>
              )}

              {/* Schedule Preview */}
              {getScheduleDescription() && (
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-800">
                        Schedule Preview
                      </span>
                    </div>
                    <p className="text-indigo-700 font-medium">
                      {getScheduleDescription()}
                    </p>
                    {formData.startTime && formData.endTime && (
                      <p className="text-sm text-indigo-600 mt-1">
                        {formData.startTime} - {formData.endTime}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Time Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className={errors.startTime ? "border-red-500" : ""}
                    required
                  />
                  {errors.startTime && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className={errors.endTime ? "border-red-500" : ""}
                    required
                  />
                  {errors.endTime && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.endTime}
                    </p>
                  )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fees">Consultation Fees (₹) *</Label>
                  <Input
                    id="fees"
                    type="number"
                    min="100"
                    max="10000"
                    value={formData.fees}
                    onChange={(e) =>
                      setFormData({ ...formData, fees: e.target.value })
                    }
                    placeholder="500"
                    className={errors.fees ? "border-red-500" : ""}
                    required
                  />
                  {errors.fees && (
                    <p className="text-sm text-red-500 mt-1">{errors.fees}</p>
                  )}
                  {selectedDoctor && (
                    <p className="text-xs text-slate-500 mt-1">
                      Doctor's default fee: ₹{selectedDoctor.consultationFee}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="slotDuration">
                    Slot Duration (minutes) *
                  </Label>
                  <Select
                    value={formData.slotDuration}
                    onValueChange={(value) =>
                      setFormData({ ...formData, slotDuration: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.slotDuration ? "border-red-500" : ""}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.slotDuration && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.slotDuration}
                    </p>
                  )}
                </div>
              </div>

              {/* Capacity Calculation */}
              {calculateMaxSlots() > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">
                        Capacity Calculation
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-700">Total Duration:</span>
                        <br />
                        <span className="font-medium">
                          {formData.startTime && formData.endTime
                            ? Math.floor(
                                (new Date(
                                  `2000-01-01T${formData.endTime}:00`
                                ).getTime() -
                                  new Date(
                                    `2000-01-01T${formData.startTime}:00`
                                  ).getTime()) /
                                  (1000 * 60)
                              )
                            : 0}{" "}
                          minutes
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700">Max Slots:</span>
                        <br />
                        <span className="font-medium">
                          {calculateMaxSlots()} slots
                        </span>
                      </div>
                      <div>
                        <span className="text-green-700">
                          Revenue per Session:
                        </span>
                        <br />
                        <span className="font-medium">
                          ₹
                          {(
                            calculateMaxSlots() *
                            Number.parseFloat(formData.fees || "0")
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {formData.scheduleType === "MONTHLY_SPECIFIC" &&
                      formData.weekNumbers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-green-300">
                          <span className="text-green-700">
                            Monthly Revenue Potential:
                          </span>
                          <br />
                          <span className="font-medium text-lg">
                            ₹
                            {(
                              calculateMaxSlots() *
                              Number.parseFloat(formData.fees || "0") *
                              formData.weekNumbers.length
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-green-600 ml-1">
                            ({formData.weekNumbers.length} sessions/month)
                          </span>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Schedule Examples */}
          {formData.scheduleType && (
            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg">Schedule Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {formData.scheduleType === "WEEKLY_RECURRING" && (
                    <>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-medium text-blue-600">
                          Weekly Recurring Examples:
                        </div>
                        <ul className="mt-2 space-y-1 text-slate-600">
                          <li>• Every Monday (weekly)</li>
                          <li>• Every Sunday (weekly)</li>
                          <li>• Every Friday (weekly)</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-medium text-green-600">
                          Your Selection:
                        </div>
                        <p className="mt-2 text-slate-700">
                          {getScheduleDescription() ||
                            "Configure schedule above"}
                        </p>
                      </div>
                    </>
                  )}
                  {formData.scheduleType === "MONTHLY_SPECIFIC" && (
                    <>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-medium text-purple-600">
                          Monthly Specific Examples:
                        </div>
                        <ul className="mt-2 space-y-1 text-slate-600">
                          <li>• 2nd and 4th Sunday</li>
                          <li>• 1st and 3rd Friday</li>
                          <li>• 2nd and Last Monday</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <div className="font-medium text-green-600">
                          Your Selection:
                        </div>
                        <p className="mt-2 text-slate-700">
                          {getScheduleDescription() ||
                            "Configure schedule above"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The chamber will be created in pending status and require admin
              verification before becoming active. Both doctor and pharmacy must
              be verified to create a chamber. The new scheduling system
              supports flexible recurring patterns for better appointment
              management.
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
                !formData.doctorId ||
                !formData.pharmacyId ||
                !formData.scheduleType ||
                !formData.weekDay ||
                (formData.scheduleType === "MONTHLY_SPECIFIC" &&
                  formData.weekNumbers.length === 0) ||
                calculateMaxSlots() <= 0
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Chamber...
                </>
              ) : (
                "Create Chamber"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
