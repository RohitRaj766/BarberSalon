import { SLOT_DURATION_MINUTES, OPENING_HOUR } from "./constants";

export function calculateEstimatedTime(
  queuePosition: number,
  baseDate: Date = new Date()
): Date {
  const estimatedTime = new Date(baseDate);
  estimatedTime.setHours(OPENING_HOUR, 0, 0, 0);
  estimatedTime.setMinutes(estimatedTime.getMinutes() + queuePosition * SLOT_DURATION_MINUTES);
  return estimatedTime;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function validatePhoneNumber(phone: string): boolean {
  // Exactly 10 digits, no other characters
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

export function validateName(name: string): boolean {
  // Only letters and spaces, 2-50 characters
  const nameRegex = /^[A-Za-z\s]{2,50}$/;
  return nameRegex.test(name.trim());
}

export function getAvailableSlots(date: Date): string[] {
  const slots: string[] = [];
  const current = new Date(date);
  current.setHours(OPENING_HOUR, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(OPENING_HOUR + 12, 0, 0, 0); // 8 PM

  while (current < endTime) {
    const hours = String(current.getHours()).padStart(2, "0");
    const minutes = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + SLOT_DURATION_MINUTES);
  }

  return slots;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

export function isValidBookingDate(date: Date): boolean {
  return isToday(date) || isTomorrow(date);
}

/**
 * Get current time in IST (India Standard Time)
 * IST is UTC+5:30
 * Returns a Date object representing the current IST time
 */
export function getCurrentTimeIST(): Date {
  const now = new Date();
  // Get IST time string
  const istString = now.toLocaleString('en-US', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse: "02/04/2026, 19:30:45" format
  const [datePart, timePart] = istString.split(', ');
  const [month, day, year] = datePart.split('/').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);
  
  // Create date in local timezone with IST values
  return new Date(year, month - 1, day, hour, minute, second);
}

/**
 * Get today's date at midnight in IST
 */
export function getTodayIST(): Date {
  const now = getCurrentTimeIST();
  // Create new date at midnight using the IST date components
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Get tomorrow's date at midnight in IST
 */
export function getTomorrowIST(): Date {
  const today = getTodayIST();
  // Add 1 day
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0);
}

/**
 * Convert a date to IST timezone
 */
export function toIST(date: Date): Date {
  const istString = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(istString);
}

/**
 * Calculate slot number based on time
 * Slot 1 = 08:00, Slot 2 = 08:18, Slot 3 = 08:36, etc.
 */
export function getSlotNumber(slotTime: string): number {
  const [hours, minutes] = slotTime.split(':').map(Number);
  const totalMinutesFromOpening = (hours - OPENING_HOUR) * 60 + minutes;
  const slotNumber = Math.floor(totalMinutesFromOpening / SLOT_DURATION_MINUTES) + 1;
  return slotNumber;
}

/**
 * Get slot number from a Date object
 */
export function getSlotNumberFromDate(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutesFromOpening = (hours - OPENING_HOUR) * 60 + minutes;
  const slotNumber = Math.floor(totalMinutesFromOpening / SLOT_DURATION_MINUTES) + 1;
  return slotNumber;
}
