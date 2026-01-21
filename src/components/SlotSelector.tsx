"use client";

import { useState, useEffect } from "react";
import { DaySlots, AvailableSlot } from "@/types";
import { formatDate, formatDateOnly } from "@/lib/utils";

interface SlotSelectorProps {
  onSlotSelect: (date: string, time: string) => void;
}

export default function SlotSelector({ onSlotSelect }: SlotSelectorProps): React.ReactElement {
  const [days, setDays] = useState<DaySlots[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchSlots = async (): Promise<void> => {
      try {
        const response = await fetch("/api/slots");
        const data = await response.json();

        if (!response.ok) {
          setError("Failed to load available slots");
          return;
        }

        // The API already returns dates in correct order (today first, tomorrow second)
        setDays(data.data);
        if (data.data.length > 0) {
          // Select today by default (first item)
          setSelectedDate(data.data[0].date);
        }
      } catch (err) {
        setError("Failed to load slots");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const currentDaySlots = days.find((d) => d.date === selectedDate);
  const slots = currentDaySlots?.slots || [];

  const handleTimeSelect = (time: string): void => {
    setSelectedTime(time);
    onSlotSelect(selectedDate, time);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
        <p className="text-white font-medium">Loading available slots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-xl">
        <p className="text-red-200 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span>📅</span>
          Select Date
        </label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {days.map((day, index) => {
            // Don't adjust dates - they're already correct from API
            const displayDate = new Date(day.date);
            
            const label = index === 0 ? "Today" : "Tomorrow";

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDate(day.date);
                  setSelectedTime("");
                }}
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all font-semibold shadow-md hover:shadow-xl transform hover:scale-105 ${
                  selectedDate === day.date
                    ? "border-purple-400 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm text-white scale-105"
                    : "border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-purple-400/50 hover:bg-white/20"
                }`}
              >
                <div className="text-sm sm:text-base font-bold">{label}</div>
                <div className="text-xs opacity-75 mt-0.5 sm:mt-1">{formatDate(displayDate)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
          <span>🕐</span>
          Select Time Slot
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto p-0.5 sm:p-1">
          {slots.map((slot: AvailableSlot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => handleTimeSelect(slot.time)}
              disabled={!slot.available}
              className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl border-2 transition-all text-xs sm:text-sm font-semibold shadow-md ${
                selectedTime === slot.time
                  ? "border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105 sm:scale-110"
                  : !slot.available
                  ? "border-white/10 bg-white/5 backdrop-blur-sm text-white/40 cursor-not-allowed opacity-50"
                  : "border-white/30 bg-white/10 backdrop-blur-sm text-white hover:border-purple-400/50 hover:shadow-lg hover:scale-105 hover:bg-white/20"
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">{slot.time}</div>
              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${
                selectedTime === slot.time
                  ? "text-white/90"
                  : !slot.available
                  ? "text-red-300 font-semibold"
                  : "text-green-300 font-semibold"
              }`}>
                {!slot.available ? "🔒" : "✓"}
                <span className="hidden sm:inline ml-1">{!slot.available ? "Booked" : "Available"}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-purple-400/30 rounded-xl sm:rounded-2xl shadow-lg animate-float">
          <p className="text-xs sm:text-sm text-purple-200 font-semibold mb-1 sm:mb-2 flex items-center gap-2">
            <span>✓</span>
            Selected Slot
          </p>
          <p className="text-base sm:text-lg md:text-xl font-bold text-white break-words">
            {formatDate(new Date(selectedDate))} at {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
}
