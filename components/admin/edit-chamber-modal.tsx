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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  User,
  Calendar,
  DollarSign,
  Users,
  Save,
  Loader2,
  AlertTriangle,
  Repeat,
  CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditChamberModalProps {
  chamber: any;
  isOpen: boolean;
  onClose: () => void;
  onChamberUpdated: (chamber: any) => void;
}

export function EditChamberModal({
  chamber,
  isOpen,
  onClose,
  onChamberUpdated,
}: EditChamberModalProps) {
  const [formData, setFormData] = useState({
    scheduleType: "",
    weekDay: "",
    weekNumbers: [] as string[],
    isRecurring: true,
    startTime: "",
    endTime: "",
    fees: "",
    slotDuration: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Initialize form data when chamber changes
  useEffect(() => {
    if (chamber) {
      setFormData({
        scheduleType: chamber.scheduleType || "WEEKLY_RECURRING",
        weekDay: chamber.weekDay || "",
        weekNumbers: chamber.weekNumbers || [],
        isRecurring: chamber.isRecurring ?? true,
        startTime: chamber.startTime || "",
        endTime: chamber.endTime || "",
        fees: chamber.fees?.toString() || "",
        slotDuration: chamber.slotDuration?.toString() || "",
        isActive: chamber.isActive ?? true,
      });
    }
  }, [chamber]);

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
    if (!formData.slotDuration)
      newErrors.slotDuration = "Slot duration is required";

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
      const updateData = {
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
        isActive: formData.isActive,
      };

      const response = await fetch(`/api/admin/chambers/${chamber.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update chamber");
      }

      const result = await response.json();
      onChamberUpdated(result.chamber);
    } catch (error) {
      console.error("Error updating chamber:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update chamber",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (chamber) {
      setFormData({
        scheduleType: chamber.scheduleType || "WEEKLY_RECURRING",
        weekDay: chamber.weekDay || "",
        weekNumbers: chamber.weekNumbers || [],
        isRecurring: chamber.isRecurring ?? true,
        startTime: chamber.startTime || "",
        endTime: chamber.endTime || "",
        fees: chamber.fees?.toString() || "",
        slotDuration: chamber.slotDuration?.toString() || "",
        isActive: chamber.isActive ?? true,
      });
    }
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

  if (!chamber) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Edit Chamber</span>
            <Badge variant={chamber.isVerified ? "default" : "secondary"}>
              {chamber.isVerified ? "Verified" : "Pending"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Update chamber schedule, pricing, and status with enhanced
            scheduling options
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partnership Info (Read-only) */}
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">
                Partnership Information (Read-only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Doctor</h4>
                  <p className="text-sm">{chamber.doctor.name}</p>
                  <p className="text-xs text-slate-500">
                    {chamber.doctor.specialization}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Pharmacy</h4>
                  <p className="text-sm">{chamber.pharmacy.name}</p>
                  <p className="text-xs text-slate-500">
                    {chamber.pharmacy.address.split(",")[0]}
                  </p>
                </div>
              </div>
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
                </div>
              )}

              {/* Schedule Preview */}
              {getScheduleDescription() && (
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-800">
                        Updated Schedule
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

          {/* Pricing & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Pricing & Settings</span>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Chamber is active</Label>
              </div>

              {/* Enhanced Capacity Calculation */}
              {calculateMaxSlots() > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Updated Capacity & Revenue
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Max Slots:</span>
                        <br />
                        <span className="font-medium">
                          {calculateMaxSlots()} slots
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700">
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
                      <div>
                        <span className="text-blue-700">Status:</span>
                        <br />
                        <Badge
                          variant={formData.isActive ? "default" : "secondary"}
                        >
                          {formData.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {/* Monthly Revenue for Monthly Specific */}
                    {formData.scheduleType === "MONTHLY_SPECIFIC" &&
                      formData.weekNumbers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-300">
                          <span className="text-blue-700">
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
                          <span className="text-xs text-blue-600 ml-1">
                            ({formData.weekNumbers.length} sessions/month)
                          </span>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Warning for verified chambers */}
          {chamber.isVerified && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This chamber is verified and may have existing appointments.
                Changes to schedule or pricing may affect future bookings.
                Consider notifying patients of any changes.
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
            <Button
              type="submit"
              disabled={isSubmitting || calculateMaxSlots() <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Chamber...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Chamber
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
