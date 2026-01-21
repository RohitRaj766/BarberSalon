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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {step === "details" ? (
        <>
          <div className="space-y-3 sm:space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-white mb-2">
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
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 ${
                  nameError
                    ? "border-red-400 bg-red-500/20 text-white placeholder-red-200"
                    : "border-white/30 bg-white/10 text-white placeholder-white/50 focus:bg-white/20"
                } backdrop-blur-sm`}
              />
              {nameError && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-200 flex items-center gap-1 bg-red-500/20 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  <span>⚠️</span>
                  <span className="break-words">{nameError}</span>
                </p>
              )}
              <p className="mt-1.5 sm:mt-2 text-xs text-white/70">Only letters and spaces allowed</p>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-white mb-2">
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
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 ${
                  phoneError
                    ? "border-red-400 bg-red-500/20 text-white placeholder-red-200"
                    : "border-white/30 bg-white/10 text-white placeholder-white/50 focus:bg-white/20"
                } backdrop-blur-sm`}
              />
              {phoneError && (
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-200 flex items-center gap-1 bg-red-500/20 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  <span>⚠️</span>
                  <span className="break-words">{phoneError}</span>
                </p>
              )}
              <p className="mt-1.5 sm:mt-2 text-xs text-white/70">
                {phone.length}/10 digits {phone.length === 10 && "✓"}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-red-200 flex items-center gap-2">
                <span>❌</span>
                <span className="break-words">{error}</span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !phone || !!nameError || !!phoneError}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Loading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="hidden sm:inline">Next: Select Time Slot</span>
                <span className="sm:hidden">Next Step</span>
                <span>→</span>
              </span>
            )}
          </button>
        </>
      ) : (
        <>
          <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border-2 border-purple-400/30 shadow-lg">
            <p className="text-xs sm:text-sm text-purple-200 mb-1 sm:mb-2">Booking for</p>
            <p className="font-bold text-white text-base sm:text-lg md:text-xl break-words">{name}</p>
            <p className="text-xs sm:text-sm text-purple-200 flex items-center gap-1 mt-1">
              <span>📱</span>
              {phone}
            </p>
          </div>

          <SlotSelector onSlotSelect={handleSlotSelect} />

          {error && (
            <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-lg sm:rounded-xl">
              <p className="text-xs sm:text-sm text-red-200 flex items-center gap-2">
                <span>❌</span>
                <span className="break-words">{error}</span>
              </p>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setError("");
              }}
              className="flex-1 px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm sm:text-base border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="flex items-center justify-center gap-1 sm:gap-2">
                <span>←</span>
                <span className="hidden sm:inline">Back</span>
              </span>
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className="flex-1 px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span className="hidden sm:inline">Booking...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1 sm:gap-2">
                  <span>✓</span>
                  <span className="hidden sm:inline">Confirm Booking</span>
                  <span className="sm:hidden">Confirm</span>
                </span>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
