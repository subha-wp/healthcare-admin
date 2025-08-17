"use client";

import { CardDescription } from "@/components/ui/card";

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
import { Loader2, Search } from "lucide-react";
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
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  consultationFee: number;
  isVerified: boolean;
  user: { email: string };
}

interface Pharmacy {
  id: string;
  name: string;
  businessName: string;
  address: string;
  isVerified: boolean;
  user: { email: string };
}

export function CreateChamberModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateChamberModalProps) {
  const [formData, setFormData] = useState({
    doctorId: "",
    pharmacyId: "",
    scheduleType: "",
    weekDays: [] as string[],
    weekNumbers: [] as string[],
    isRecurring: true,
    startTime: "",
    endTime: "",
    fees: "",
    slotDuration: "30",
  });

  // Search states
  const [doctorSearch, setDoctorSearch] = useState("");
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const [doctorSearched, setDoctorSearched] = useState(false);
  const [pharmacySearched, setPharmacySearched] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const selectedDoctor = doctors.find((d) => d.id === formData.doctorId);
  const selectedPharmacy = pharmacies.find((p) => p.id === formData.pharmacyId);

  // Search doctors with debounce
  useEffect(() => {
    if (doctorSearch.length >= 2) {
      const timer = setTimeout(() => {
        searchDoctors(doctorSearch);
      }, 500);
      return () => clearTimeout(timer);
    } else if (doctorSearch.length === 0) {
      setDoctors([]);
      setDoctorSearched(false);
    }
  }, [doctorSearch]);

  // Search pharmacies with debounce
  useEffect(() => {
    if (pharmacySearch.length >= 2) {
      const timer = setTimeout(() => {
        searchPharmacies(pharmacySearch);
      }, 500);
      return () => clearTimeout(timer);
    } else if (pharmacySearch.length === 0) {
      setPharmacies([]);
      setPharmacySearched(false);
    }
  }, [pharmacySearch]);

  const searchDoctors = async (searchTerm: string) => {
    try {
      setLoadingDoctors(true);
      const response = await fetch(
        `/api/admin/doctors/search?q=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.doctors);
        setDoctorSearched(true);
      }
    } catch (error) {
      console.error("Error searching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to search doctors",
        variant: "destructive",
      });
    } finally {
      setLoadingDoctors(false);
    }
  };

  const searchPharmacies = async (searchTerm: string) => {
    try {
      setLoadingPharmacies(true);
      const response = await fetch(
        `/api/admin/pharmacies/search?q=${encodeURIComponent(searchTerm)}`
      );
      if (response.ok) {
        const data = await response.json();
        setPharmacies(data.pharmacies);
        setPharmacySearched(true);
      }
    } catch (error) {
      console.error("Error searching pharmacies:", error);
      toast({
        title: "Error",
        description: "Failed to search pharmacies",
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
    if (!formData.weekDays || formData.weekDays.length === 0)
      newErrors.weekDays = "Please select at least one week day";

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
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/chambers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
        toast({
          title: "Success",
          description: "Chamber created successfully!",
        });
      } else {
        throw new Error("Failed to create chamber");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chamber. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Auto-fill fees when doctor is selected
  useEffect(() => {
    if (
      selectedDoctor &&
      selectedDoctor.consultationFee > 0 &&
      !formData.fees
    ) {
      setFormData((prev) => ({
        ...prev,
        fees: selectedDoctor.consultationFee.toString(),
      }));
    }
  }, [selectedDoctor, formData.fees]);

  // Reset week numbers when schedule type changes
  useEffect(() => {
    if (
      formData.scheduleType === "WEEKLY_RECURRING" ||
      formData.scheduleType === "MULTI_WEEKLY"
    ) {
      setFormData((prev) => ({ ...prev, weekNumbers: [], isRecurring: true }));
    } else if (formData.scheduleType === "MONTHLY_SPECIFIC") {
      setFormData((prev) => ({ ...prev, isRecurring: false }));
    }
  }, [formData.scheduleType]);

  const handleWeekDayToggle = (weekDay: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      weekDays: checked
        ? [...prev.weekDays, weekDay]
        : prev.weekDays.filter((d) => d !== weekDay),
    }));
  };

  const handleWeekNumberToggle = (weekNumber: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      weekNumbers: checked
        ? [...prev.weekNumbers, weekNumber]
        : prev.weekNumbers.filter((w) => w !== weekNumber),
    }));
  };

  const getScheduleDescription = () => {
    if (
      !formData.scheduleType ||
      !formData.weekDays ||
      formData.weekDays.length === 0
    )
      return "";

    const dayNames = formData.weekDays.map(
      (day: string) => day.charAt(0) + day.slice(1).toLowerCase()
    );

    if (
      formData.scheduleType === "WEEKLY_RECURRING" ||
      formData.scheduleType === "MULTI_WEEKLY"
    ) {
      if (dayNames.length === 1) {
        return `Every ${dayNames[0]}`;
      } else if (dayNames.length === 2) {
        return `Every ${dayNames[0]} & ${dayNames[1]}`;
      } else {
        return `Every ${dayNames.slice(0, -1).join(", ")} & ${
          dayNames[dayNames.length - 1]
        }`;
      }
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
      if (dayNames.length === 1) {
        return `${weekDescriptions.join(" and ")} ${
          dayNames[0]
        } of every month`;
      } else {
        return `${weekDescriptions.join(" and ")} ${dayNames.join(
          " & "
        )} of every month`;
      }
    }

    return "";
  };

  const getDoctorStatusBadge = (doctor: Doctor) => {
    return doctor.isVerified ? (
      <Badge variant="default" className="text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getPharmacyStatusBadge = (pharmacy: Pharmacy) => {
    return pharmacy.isVerified ? (
      <Badge variant="default" className="text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge variant="secondary" className="text-xs">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const resetForm = () => {
    setFormData({
      doctorId: "",
      pharmacyId: "",
      scheduleType: "",
      weekDays: [],
      weekNumbers: [],
      isRecurring: true,
      startTime: "",
      endTime: "",
      fees: "",
      slotDuration: "30",
    });
    setDoctorSearch("");
    setPharmacySearch("");
    setDoctors([]);
    setPharmacies([]);
    setDoctorSearched(false);
    setPharmacySearched(false);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Chamber</DialogTitle>
          <DialogDescription>
            Set up a new doctor-pharmacy partnership with flexible scheduling
            options. Both verified and non-verified doctors/pharmacies can
            create chambers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partnership Selection with Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partnership Selection</CardTitle>
              <CardDescription>
                Search and select doctor and pharmacy for the chamber
                partnership
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Doctor Search and Selection */}
              <div className="space-y-3">
                <Label
                  htmlFor="doctorSearch"
                  className="flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span>Search & Select Doctor *</span>
                </Label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="doctorSearch"
                    placeholder="Search doctors by name, specialization, or email..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loadingDoctors && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Searching doctors...</span>
                  </div>
                )}

                {doctorSearched && doctors.length === 0 && !loadingDoctors && (
                  <div className="p-3 border rounded-lg bg-slate-50">
                    <p className="text-sm text-slate-600">
                      No doctors found. Try a different search term.
                    </p>
                  </div>
                )}

                {doctors.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.doctorId === doctor.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, doctorId: doctor.id })
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-sm text-slate-600">
                              {doctor.specialization}
                            </div>
                            <div className="text-xs text-slate-500">
                              {doctor.user.email}
                            </div>
                            {doctor.consultationFee > 0 && (
                              <div className="text-xs text-slate-500">
                                Default fee: ₹{doctor.consultationFee}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {getDoctorStatusBadge(doctor)}
                            {formData.doctorId === doctor.id && (
                              <Badge variant="outline" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.doctorId && (
                  <p className="text-sm text-red-500">{errors.doctorId}</p>
                )}
              </div>

              {/* Pharmacy Search and Selection */}
              <div className="space-y-3">
                <Label
                  htmlFor="pharmacySearch"
                  className="flex items-center space-x-2"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Search & Select Pharmacy *</span>
                </Label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    id="pharmacySearch"
                    placeholder="Search pharmacies by name, business name, or address..."
                    value={pharmacySearch}
                    onChange={(e) => setPharmacySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loadingPharmacies && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Searching pharmacies...</span>
                  </div>
                )}

                {pharmacySearched &&
                  pharmacies.length === 0 &&
                  !loadingPharmacies && (
                    <div className="p-3 border rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-600">
                        No pharmacies found. Try a different search term.
                      </p>
                    </div>
                  )}

                {pharmacies.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                    {pharmacies.map((pharmacy) => (
                      <div
                        key={pharmacy.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.pharmacyId === pharmacy.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, pharmacyId: pharmacy.id })
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{pharmacy.name}</div>
                            <div className="text-sm text-slate-600">
                              {pharmacy.businessName}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-64">
                              {pharmacy.address}
                            </div>
                            <div className="text-xs text-slate-500">
                              {pharmacy.user.email}
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {getPharmacyStatusBadge(pharmacy)}
                            {formData.pharmacyId === pharmacy.id && (
                              <Badge variant="outline" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.pharmacyId && (
                  <p className="text-sm text-red-500">{errors.pharmacyId}</p>
                )}
              </div>

              {/* Selected Partnership Preview */}
              {selectedDoctor && selectedPharmacy && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>Selected Partnership</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Doctor:</span>{" "}
                        {selectedDoctor.name}
                        <br />
                        <span className="text-slate-600">
                          {selectedDoctor.specialization}
                        </span>
                        <br />
                        <div className="mt-1">
                          {getDoctorStatusBadge(selectedDoctor)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Pharmacy:</span>{" "}
                        {selectedPharmacy.name}
                        <br />
                        <span className="text-slate-600">
                          {selectedPharmacy.address.split(",")[0]}
                        </span>
                        <br />
                        <div className="mt-1">
                          {getPharmacyStatusBadge(selectedPharmacy)}
                        </div>
                      </div>
                    </div>

                    {/* Warning for non-verified partners */}
                    {(!selectedDoctor.isVerified ||
                      !selectedPharmacy.isVerified) && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {!selectedDoctor.isVerified &&
                          !selectedPharmacy.isVerified
                            ? "Both doctor and pharmacy are not verified. The chamber will require admin verification before becoming active."
                            : !selectedDoctor.isVerified
                            ? "The selected doctor is not verified. The chamber will require admin verification before becoming active."
                            : "The selected pharmacy is not verified. The chamber will require admin verification before becoming active."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Search Instructions */}
              {!doctorSearched && !pharmacySearched && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Start typing in the search fields above to find doctors and
                    pharmacies. You need to type at least 2 characters to begin
                    searching. Both verified and non-verified partners can be
                    selected.
                  </AlertDescription>
                </Alert>
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
                            Single day: Every Monday, Every Sunday, etc.
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="MULTI_WEEKLY">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Multi-Weekly</div>
                          <div className="text-xs text-slate-500">
                            Multiple days: Every Sunday & Friday, etc.
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
                <Label className="text-sm font-medium mb-3 block">
                  Days of Week *
                  {formData.scheduleType === "WEEKLY_RECURRING" && (
                    <span className="text-xs text-slate-500 ml-2">
                      (Select one day)
                    </span>
                  )}
                  {formData.scheduleType === "MULTI_WEEKLY" && (
                    <span className="text-xs text-slate-500 ml-2">
                      (Select multiple days)
                    </span>
                  )}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "MONDAY", label: "Monday" },
                    { value: "TUESDAY", label: "Tuesday" },
                    { value: "WEDNESDAY", label: "Wednesday" },
                    { value: "THURSDAY", label: "Thursday" },
                    { value: "FRIDAY", label: "Friday" },
                    { value: "SATURDAY", label: "Saturday" },
                    { value: "SUNDAY", label: "Sunday" },
                  ].map((day) => (
                    <div
                      key={day.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={day.value}
                        checked={formData.weekDays.includes(day.value)}
                        onCheckedChange={(checked) =>
                          handleWeekDayToggle(day.value, checked as boolean)
                        }
                        disabled={
                          formData.scheduleType === "WEEKLY_RECURRING" &&
                          formData.weekDays.length >= 1 &&
                          !formData.weekDays.includes(day.value)
                        }
                      />
                      <Label htmlFor={day.value} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {errors.weekDays && (
                  <p className="text-sm text-red-500 mt-1">{errors.weekDays}</p>
                )}
                {formData.scheduleType === "WEEKLY_RECURRING" &&
                  formData.weekDays.length > 1 && (
                    <p className="text-sm text-orange-600 mt-1">
                      Weekly Recurring allows only one day. Use Multi-Weekly for
                      multiple days.
                    </p>
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
                    min="0"
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
                  {selectedDoctor && selectedDoctor.consultationFee > 0 && (
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
                              formData.weekNumbers.length *
                              formData.weekDays.length
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-green-600 ml-1">
                            (
                            {formData.weekNumbers.length *
                              formData.weekDays.length}{" "}
                            sessions/month)
                          </span>
                        </div>
                      )}

                    {/* Multi-Weekly Revenue Calculation */}
                    {formData.scheduleType === "MULTI_WEEKLY" &&
                      formData.weekDays.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-green-300">
                          <span className="text-green-700">
                            Weekly Revenue Potential:
                          </span>
                          <br />
                          <span className="font-medium text-lg">
                            ₹
                            {(
                              calculateMaxSlots() *
                              Number.parseFloat(formData.fees || "0") *
                              formData.weekDays.length
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-green-600 ml-1">
                            ({formData.weekDays.length} sessions/week)
                          </span>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enhanced chamber scheduling now supports:
              <br />• <strong>Weekly Recurring:</strong> Single day per week
              (e.g., Every Monday)
              <br />• <strong>Multi-Weekly:</strong> Multiple days per week
              (e.g., Every Sunday & Friday)
              <br />• <strong>Monthly Specific:</strong> Specific weeks and days
              (e.g., 2nd & 4th Sunday)
              <br />
              Both verified and non-verified partners can create chambers.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.doctorId ||
                !formData.pharmacyId ||
                !formData.scheduleType ||
                !formData.weekDays.length ||
                (formData.scheduleType === "MONTHLY_SPECIFIC" &&
                  formData.weekNumbers.length === 0) ||
                (formData.scheduleType === "WEEKLY_RECURRING" &&
                  formData.weekDays.length > 1) ||
                calculateMaxSlots() <= 0
              }
            >
              {isLoading ? (
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
