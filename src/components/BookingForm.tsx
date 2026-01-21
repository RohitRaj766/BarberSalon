"use client";

import { useState } from "react";
import { BookingRequest, BookingResponse } from "@/types";
import SlotSelector from "./SlotSelector";

interface BookingFormProps {
  onSuccess: (booking: BookingResponse) => void;
}

export default function BookingForm({ onSuccess }: BookingFormProps): React.ReactElement {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<"details" | "slots">("details");
  const [nameError, setNameError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");

  const handleSlotSelect = (date: string, time: string): void => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const validateName = (value: string): boolean => {
    // Only allow alphabets and spaces
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (!nameRegex.test(value)) {
      setNameError("Name can only contain letters and spaces");
      return false;
    }
    if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    if (value.trim().length > 50) {
      setNameError("Name must be less than 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validatePhone = (value: string): boolean => {
    // Only allow exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!value) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(value)) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Only allow letters and spaces
    const filtered = value.replace(/[^A-Za-z\s]/g, "");
    setName(filtered);
    if (filtered) validateName(filtered);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Only allow digits and max 10
    const filtered = value.replace(/\D/g, "").slice(0, 10);
    setPhone(filtered);
    if (filtered) validatePhone(filtered);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (step === "details") {
      const isNameValid = validateName(name);
      const isPhoneValid = validatePhone(phone);

      if (!isNameValid || !isPhoneValid) {
        return;
      }

      setStep("slots");
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time");
      return;
    }

    setLoading(true);

    try {
      const payload: BookingRequest = {
        name: name.trim(),
        phone,
        bookingDate: selectedDate,
        slotTime: selectedTime,
      };

      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to book appointment");
        return;
      }

      onSuccess(data.data);
      setName("");
      setPhone("");
      setSelectedDate("");
      setSelectedTime("");
      setStep("details");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {step === "details" ? (
        <>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-2">
                  <span>👤</span>
                  Full Name
                </span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="John Doe"
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  nameError
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {nameError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Only letters and spaces allowed</p>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                <span className="inline-flex items-center gap-2">
                  <span>📱</span>
                  Phone Number
                </span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                required
                maxLength={10}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                  phoneError
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50 focus:bg-white"
                }`}
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span>
                  {phoneError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {phone.length}/10 digits {phone.length === 10 && "✓"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <span>❌</span>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !phone || !!nameError || !!phoneError}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Loading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Next: Select Time Slot
                <span>→</span>
              </span>
            )}
          </button>
        </>
      ) : (
        <>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Booking for</p>
            <p className="font-bold text-gray-900 text-lg">{name}</p>
            <p className="text-sm text-gray-600">{phone}</p>
          </div>

          <SlotSelector onSlotSelect={handleSlotSelect} />

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <span>❌</span>
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setError("");
              }}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              <span className="flex items-center justify-center gap-2">
                <span>←</span>
                Back
              </span>
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Booking...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>✓</span>
                  Confirm Booking
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
