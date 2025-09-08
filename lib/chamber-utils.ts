// @ts-nocheck

export interface ChamberSchedule {
  scheduleType: "WEEKLY_RECURRING" | "MONTHLY_SPECIFIC";
  weekDays: string[];
  weekNumbers?: string[];
  isRecurring: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export function getScheduleDisplay(chamber: any): string {
  // Handle new weekDays array format
  if (chamber.weekDays && chamber.weekDays.length > 0) {
    const dayNames = chamber.weekDays.map(
      (day: string) => day.charAt(0) + day.slice(1).toLowerCase()
    );

    if (
      chamber.scheduleType === "WEEKLY_RECURRING" ||
      chamber.scheduleType === "MULTI_WEEKLY" ||
      chamber.isRecurring
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
      chamber.scheduleType === "MONTHLY_SPECIFIC" &&
      chamber.weekNumbers?.length > 0
    ) {
      const weekMap = {
        FIRST: "1st",
        SECOND: "2nd",
        THIRD: "3rd",
        FOURTH: "4th",
        LAST: "Last",
      };
      const weekDescriptions = chamber.weekNumbers.map(
        (w: string) => weekMap[w as keyof typeof weekMap]
      );
      if (dayNames.length === 1) {
        return `${weekDescriptions.join(" & ")} ${dayNames[0]} of every month`;
      } else {
        return `${weekDescriptions.join(" & ")} ${dayNames.join(
          " & "
        )} of every month`;
      }
    }
  }

  // Backward compatibility for old weekDay field
  if (chamber.weekDay) {
    // Backward compatibility for old weekDay field
    const dayName =
      chamber.weekDay.charAt(0) + chamber.weekDay.slice(1).toLowerCase();

    if (chamber.scheduleType === "WEEKLY_RECURRING" || chamber.isRecurring) {
      return `Every ${dayName}`;
    } else if (
      chamber.scheduleType === "MONTHLY_SPECIFIC" &&
      chamber.weekNumbers?.length > 0
    ) {
      const weekMap = {
        FIRST: "1st",
        SECOND: "2nd",
        THIRD: "3rd",
        FOURTH: "4th",
        LAST: "Last",
      };
      const weekDescriptions = chamber.weekNumbers.map(
        (w: string) => weekMap[w as keyof typeof weekMap]
      );
      return `${weekDescriptions.join(" & ")} ${dayName} of every month`;
    } else if (chamber.weekNumber) {
      // Handle old weekNumber format
      const weekMap = {
        FIRST: "1st",
        SECOND: "2nd",
        THIRD: "3rd",
        FOURTH: "4th",
        LAST: "Last",
      };
      return `${
        weekMap[chamber.weekNumber as keyof typeof weekMap]
      } ${dayName}`;
    }
  }

  return "Not configured";
}

export function getScheduleTypeDisplay(chamber: any): string {
  if (chamber.scheduleType === "WEEKLY_RECURRING" || chamber.isRecurring) {
    return "Weekly Recurring";
  } else if (chamber.scheduleType === "MULTI_WEEKLY") {
    return "Multi-Weekly";
  } else if (chamber.scheduleType === "MONTHLY_SPECIFIC") {
    return "Monthly Specific";
  }
  return "Legacy Format";
}

export function getScheduleFrequency(chamber: any): number {
  if (chamber.scheduleType === "WEEKLY_RECURRING" || chamber.isRecurring) {
    const daysCount = chamber.weekDays?.length || (chamber.weekDay ? 1 : 0);
    return daysCount * 4; // Approximately 4 sessions per month per day
  } else if (chamber.scheduleType === "MULTI_WEEKLY") {
    const daysCount = chamber.weekDays?.length || 0;
    return daysCount * 4; // Multiple days per week
  } else if (
    chamber.scheduleType === "MONTHLY_SPECIFIC" &&
    chamber.weekNumbers?.length > 0
  ) {
    const daysCount = chamber.weekDays?.length || (chamber.weekDay ? 1 : 0);
    return chamber.weekNumbers.length * daysCount; // Exact number of sessions per month
  } else if (chamber.weekNumber) {
    return 1; // Legacy format - once per month
  }
  return 1;
}

export function calculateMonthlyRevenue(chamber: any): number {
  const sessionRevenue = (chamber.maxSlots || 0) * (chamber.fees || 0);
  const frequency = getScheduleFrequency(chamber);
  return sessionRevenue * frequency;
}

export function getNextAppointmentDates(
  chamber: any,
  fromDate: Date = new Date(),
  count: number = 5
): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(fromDate);
  const weekDays =
    chamber.weekDays || (chamber.weekDay ? [chamber.weekDay] : []);

  if (
    chamber.scheduleType === "WEEKLY_RECURRING" ||
    chamber.scheduleType === "MULTI_WEEKLY" ||
    chamber.isRecurring
  ) {
    // Weekly recurring - find next occurrences of the weekday
    const targetDays = weekDays.map((day: string) => getWeekDayNumber(day));

    for (let i = 0; i < count * 7; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() + i);

      if (targetDays.includes(checkDate.getDay()) && dates.length < count) {
        dates.push(new Date(checkDate));
      }
    }
  } else if (
    chamber.scheduleType === "MONTHLY_SPECIFIC" &&
    chamber.weekNumbers?.length > 0
  ) {
    // Monthly specific - find specific weeks of each month
    for (
      let monthOffset = 0;
      monthOffset < 6 && dates.length < count;
      monthOffset++
    ) {
      const checkMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + monthOffset,
        1
      );

      for (const weekNumber of chamber.weekNumbers) {
        for (const weekDay of weekDays) {
          const weekDate = getWeekDateInMonth(checkMonth, weekNumber, weekDay);
          if (weekDate >= fromDate && dates.length < count) {
            dates.push(weekDate);
          }
        }
      }
    }
    dates.sort((a, b) => a.getTime() - b.getTime());
  }

  return dates.slice(0, count);
}

function getWeekDayNumber(weekDay: string): number {
  const dayMap = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };
  return dayMap[weekDay as keyof typeof dayMap] || 0;
}

function getWeekDateInMonth(
  monthStart: Date,
  weekNumber: string,
  weekDay: string
): Date {
  const targetDay = getWeekDayNumber(weekDay);
  const firstDay = new Date(monthStart);

  if (weekNumber === "LAST") {
    // Find last occurrence of the weekday in the month
    const lastDay = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0
    );
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(lastDay);
      checkDate.setDate(lastDay.getDate() - i);
      if (checkDate.getDay() === targetDay) {
        return checkDate;
      }
    }
  } else {
    // Find specific week occurrence
    const weekNumbers = { FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4 };
    const weekNum = weekNumbers[weekNumber as keyof typeof weekNumbers] || 1;

    // Find first occurrence of the weekday
    let firstOccurrence = new Date(firstDay);
    while (firstOccurrence.getDay() !== targetDay) {
      firstOccurrence.setDate(firstOccurrence.getDate() + 1);
    }

    // Add weeks to get to the desired occurrence
    const targetDate = new Date(firstOccurrence);
    targetDate.setDate(firstOccurrence.getDate() + (weekNum - 1) * 7);

    // Ensure it's still in the same month
    if (targetDate.getMonth() === monthStart.getMonth()) {
      return targetDate;
    }
  }

  return monthStart; // Fallback
}

export function validateChamberSchedule(chamber: ChamberSchedule): string[] {
  const errors: string[] = [];

  if (!chamber.scheduleType) {
    errors.push("Schedule type is required");
  }

  if (!chamber.weekDays || chamber.weekDays.length === 0) {
    errors.push("At least one week day is required");
  }

  if (
    chamber.scheduleType === "MONTHLY_SPECIFIC" &&
    (!chamber.weekNumbers || chamber.weekNumbers.length === 0)
  ) {
    errors.push("Week numbers are required for monthly specific schedule");
  }

  // Validate multiple days don't conflict
  if (chamber.weekDays && chamber.weekDays.length > 1) {
    const uniqueDays = new Set(chamber.weekDays);
    if (uniqueDays.size !== chamber.weekDays.length) {
      errors.push("Duplicate week days are not allowed");
    }
  }
  
  if (!chamber.startTime || !chamber.endTime) {
    errors.push("Start and end times are required");
  }

  if (chamber.startTime && chamber.endTime) {
    const start = new Date(`2000-01-01T${chamber.startTime}:00`);
    const end = new Date(`2000-01-01T${chamber.endTime}:00`);
    if (end <= start) {
      errors.push("End time must be after start time");
    }
    
    // Validate minimum session duration (at least 30 minutes)
    const sessionDurationMs = end.getTime() - start.getTime();
    const sessionDurationMinutes = sessionDurationMs / (1000 * 60);
    
    if (sessionDurationMinutes < 30) {
      errors.push("Chamber session must be at least 30 minutes long");
    }
  }

  return errors;
}

export function checkTimeConflict(
  newStart: string,
  newEnd: string,
  existingStart: string,
  existingEnd: string
): boolean {
  const newStartTime = new Date(`2000-01-01T${newStart}:00`);
  const newEndTime = new Date(`2000-01-01T${newEnd}:00`);
  const existingStartTime = new Date(`2000-01-01T${existingStart}:00`);
  const existingEndTime = new Date(`2000-01-01T${existingEnd}:00`);

  // Check if times overlap
  return (
    (newStartTime < existingEndTime && newEndTime > existingStartTime) ||
    (existingStartTime < newEndTime && existingEndTime > newStartTime)
  );
}

export function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  
  return `${start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

export function getDoctorChamberSummary(chambers: any[]): string {
  if (!chambers || chambers.length === 0) return "No chambers";
  
  const chambersByDay = chambers.reduce((acc, chamber) => {
    const days = chamber.weekDays || (chamber.weekDay ? [chamber.weekDay] : []);
    days.forEach((day: string) => {
      if (!acc[day]) acc[day] = [];
      acc[day].push(chamber);
    });
    return acc;
  }, {});
  
  const summary = Object.entries(chambersByDay).map(([day, daysChambers]: [string, any[]]) => {
    const dayName = day.charAt(0) + day.slice(1).toLowerCase();
    const timeSlots = daysChambers.map(c => `${c.startTime}-${c.endTime}`).join(', ');
    return `${dayName}: ${timeSlots}`;
  });
  
  return summary.join('; ');
}
