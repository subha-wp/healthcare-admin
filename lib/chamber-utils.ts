// Utility functions for chamber scheduling and management

export interface ChamberSchedule {
  scheduleType: "WEEKLY_RECURRING" | "MONTHLY_SPECIFIC";
  weekDay: string;
  weekNumbers?: string[];
  isRecurring: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

export function getScheduleDisplay(chamber: any): string {
  if (!chamber.weekDay) return "Not configured";

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
    // Backward compatibility for old format
    const weekMap = {
      FIRST: "1st",
      SECOND: "2nd",
      THIRD: "3rd",
      FOURTH: "4th",
      LAST: "Last",
    };
    return `${weekMap[chamber.weekNumber as keyof typeof weekMap]} ${dayName}`;
  }

  return "Custom schedule";
}

export function getScheduleTypeDisplay(chamber: any): string {
  if (chamber.scheduleType === "WEEKLY_RECURRING" || chamber.isRecurring) {
    return "Weekly Recurring";
  } else if (chamber.scheduleType === "MONTHLY_SPECIFIC") {
    return "Monthly Specific";
  }
  return "Legacy Format";
}

export function getScheduleFrequency(chamber: any): number {
  if (chamber.scheduleType === "WEEKLY_RECURRING" || chamber.isRecurring) {
    return 4; // Approximately 4 sessions per month
  } else if (
    chamber.scheduleType === "MONTHLY_SPECIFIC" &&
    chamber.weekNumbers?.length > 0
  ) {
    return chamber.weekNumbers.length; // Exact number of sessions per month
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

  if (chamber.scheduleType === "WEEKLY_RECURRING" || chamber.isRecurring) {
    // Weekly recurring - find next occurrences of the weekday
    const targetDay = getWeekDayNumber(chamber.weekDay);

    for (let i = 0; i < count * 7; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() + i);

      if (checkDate.getDay() === targetDay && dates.length < count) {
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
        const weekDate = getWeekDateInMonth(
          checkMonth,
          weekNumber,
          chamber.weekDay
        );
        if (weekDate >= fromDate && dates.length < count) {
          dates.push(weekDate);
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

  if (!chamber.weekDay) {
    errors.push("Week day is required");
  }

  if (
    chamber.scheduleType === "MONTHLY_SPECIFIC" &&
    (!chamber.weekNumbers || chamber.weekNumbers.length === 0)
  ) {
    errors.push("Week numbers are required for monthly specific schedule");
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
  }

  return errors;
}
