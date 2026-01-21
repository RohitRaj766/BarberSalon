export const SLOT_DURATION_MINUTES = 18;
export const OPENING_HOUR = 8; // 8 AM
export const CLOSING_HOUR = 20; // 8 PM

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Calculate total slots per day
export const TOTAL_SLOTS_PER_DAY = Math.floor((CLOSING_HOUR - OPENING_HOUR) * 60 / SLOT_DURATION_MINUTES);
