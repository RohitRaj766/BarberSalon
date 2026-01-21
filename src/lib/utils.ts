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
