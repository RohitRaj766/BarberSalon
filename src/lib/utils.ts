import { SLOT_DURATION_MINUTES, OPENING_HOUR } from "./constants";

export function calculateEstimatedTime(
  queuePosition: number,
  baseDate: Date = new Date()
): Date {
  const estimatedTime = new Date(baseDate);
  estimatedTime.setUTCHours(OPENING_HOUR, 0, 0, 0);
  estimatedTime.setUTCMinutes(estimatedTime.getUTCMinutes() + queuePosition * SLOT_DURATION_MINUTES);
  return estimatedTime;
}

export function formatTime(date: Date): string {
  // Extract time components directly from UTC
  const dateStr = date.toISOString(); // "2026-02-04T14:18:00.000Z"
  const timePart = dateStr.split('T')[1].substring(0, 5); // "14:18"
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatDate(date: Date): string {
  // Extract date components directly from UTC
  const dateStr = date.toISOString(); // "2026-02-04T14:18:00.000Z"
  const datePart = dateStr.split('T')[0]; // "2026-02-04"
  const [year, month, day] = datePart.split('-').map(Number);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${monthNames[month - 1]} ${day}, ${year}`;
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
  current.setUTCHours(OPENING_HOUR, 0, 0, 0);

  const endTime = new Date(date);
  endTime.setUTCHours(OPENING_HOUR + 12, 0, 0, 0); // 8 PM

  while (current < endTime) {
    const hours = String(current.getUTCHours()).padStart(2, "0");
    const minutes = String(current.getUTCMinutes()).padStart(2, "0");
    slots.push(`${hours}:${minutes}`);
    current.setUTCMinutes(current.getUTCMinutes() + SLOT_DURATION_MINUTES);
  }

  return slots;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getUTCDate() === today.getUTCDate() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCFullYear() === today.getUTCFullYear()
  );
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return (
    date.getUTCDate() === tomorrow.getUTCDate() &&
    date.getUTCMonth() === tomorrow.getUTCMonth() &&
    date.getUTCFullYear() === tomorrow.getUTCFullYear()
  );
}

export function isValidBookingDate(date: Date): boolean {
  return isToday(date) || isTomorrow(date);
}

/**
 * Get current time in UTC
 */
export function getCurrentTimeUTC(): Date {
  return new Date();
}

/**
 * Get today's date at midnight in UTC
 */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Get tomorrow's date at midnight in UTC
 */
export function getTomorrowUTC(): Date {
  const today = getTodayUTC();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow;
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
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const totalMinutesFromOpening = (hours - OPENING_HOUR) * 60 + minutes;
  const slotNumber = Math.floor(totalMinutesFromOpening / SLOT_DURATION_MINUTES) + 1;
  return slotNumber;
}
