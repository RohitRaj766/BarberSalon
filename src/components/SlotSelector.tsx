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
    return <div className="text-center py-8">Loading available slots...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>📅</span>
          Select Date
        </label>
        <div className="grid grid-cols-2 gap-3">
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
                className={`p-4 rounded-xl border-2 transition-all font-medium shadow-sm hover:shadow-md ${
                  selectedDate === day.date
                    ? "border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 shadow-md"
                    : "border-gray-200 bg-white text-gray-700 hover:border-purple-300"
                }`}
              >
                <div className="text-base font-bold">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{formatDate(displayDate)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span>🕐</span>
          Select Time Slot
        </label>
        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
          {slots.map((slot: AvailableSlot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => handleTimeSelect(slot.time)}
              disabled={!slot.available}
              className={`p-3 rounded-xl border-2 transition-all text-sm font-medium shadow-sm ${
                selectedTime === slot.time
                  ? "border-purple-600 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105"
                  : !slot.available
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:shadow-md hover:scale-105"
              }`}
            >
              <div className="font-bold">{slot.time}</div>
              <div className={`text-xs mt-1 ${
                selectedTime === slot.time
                  ? "text-white/90"
                  : !slot.available
                  ? "text-red-500 font-semibold"
                  : "text-green-600 font-semibold"
              }`}>
                {!slot.available ? "🔒 Booked" : "✓ Available"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedDate && selectedTime && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm">
          <p className="text-sm text-purple-600 font-semibold mb-1">✓ Selected Slot</p>
          <p className="text-lg font-bold text-purple-900">
            {formatDate(new Date(selectedDate))} at {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
}
