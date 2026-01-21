export type BookingStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: string;
  serialNumber: number;
  name: string;
  phone: string;
  queuePosition: number;
  bookingDate: Date;
  slotTime: Date;
  estimatedTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingResponse {
  id: string;
  serialNumber: number;
  name: string;
  phone?: string; // Optional - only shown to admin
  queuePosition: number;
  bookingDate: string;
  slotTime: string;
  estimatedTime: string;
  status: BookingStatus;
  createdAt: string;
}

export interface QueueResponse {
  bookings: BookingResponse[];
  totalCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface BookingRequest {
  name: string;
  phone: string;
  bookingDate: string;
  slotTime: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  bookedCount: number;
}

export interface DaySlots {
  date: string;
  slots: AvailableSlot[];
}
