"use client";

import { useEffect, useState } from "react";
import { BookingResponse } from "@/types";
import { formatTime, formatDate, formatDateOnly } from "@/lib/utils";

export default function PublicQueueDisplay(): React.ReactElement {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    const fetchQueue = async (): Promise<void> => {
      try {
        const response = await fetch("/api/queue");
        const data = await response.json();

        if (!response.ok) {
          setError("Failed to load queue");
          return;
        }

        setBookings(data.data.bookings);
        
        // Set initial selected date to today (adjusted +1 day to match user expectation)
        if (data.data.bookings.length > 0) {
          setSelectedDate(formatDateOnly(new Date(data.data.bookings[0].bookingDate)));
        } else {
          // Use actual system date (which is what's stored in DB)
          const actualToday = new Date();
          setSelectedDate(formatDateOnly(actualToday));
        }
      } catch (err) {
        setError("Failed to load queue");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
        <p className="text-white font-medium text-lg">Loading queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-2xl">
        <p className="text-red-200 flex items-center gap-2 justify-center">
          <span className="text-2xl">⚠️</span>
          {error}
        </p>
      </div>
    );
  }

  // Get unique dates
  const uniqueDates = Array.from(
    new Set(bookings.map((b) => formatDateOnly(new Date(b.bookingDate))))
  ).sort();

  // Filter bookings by selected date
  const dateBookings = bookings.filter(
    (b) => formatDateOnly(new Date(b.bookingDate)) === selectedDate
  );

  // Get current booking (first pending)
  const currentBooking = dateBookings.find((b) => b.status === "PENDING");
  const currentPosition = currentBooking?.queuePosition || 0;

  // Get actual system date (what's stored in DB)
  const actualToday = new Date();
  actualToday.setHours(0, 0, 0, 0);
  const actualTodayStr = formatDateOnly(actualToday);
  
  const actualTomorrow = new Date();
  actualTomorrow.setDate(actualToday.getDate() + 1);
  actualTomorrow.setHours(0, 0, 0, 0);
  const actualTomorrowStr = formatDateOnly(actualTomorrow);

  return (
    <div className="space-y-6">
      {/* Date Tabs */}
      {uniqueDates.length > 0 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {uniqueDates.map((date) => {
            // Determine label based on actual system dates
            let label = date;
            const displayDate = new Date(date);
            
            if (date === actualTodayStr) {
              label = "Today";
            } else if (date === actualTomorrowStr) {
              label = "Tomorrow";
            }

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 text-sm sm:text-base ${
                  selectedDate === date
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105"
                    : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                <div className="font-bold">{label}</div>
                <div className="text-xs opacity-75 mt-0.5 sm:mt-1">{formatDate(displayDate)}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Current Service Info */}
      {currentBooking && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 shadow-2xl animate-pulse-glow">
          <div className="text-xs sm:text-sm opacity-90 font-semibold flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg md:text-xl">🔥</span>
            <span>Currently Serving</span>
          </div>
          <div className="text-5xl sm:text-6xl md:text-7xl font-bold drop-shadow-lg">#{currentBooking.queuePosition}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{currentBooking.name}</div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base opacity-90 pt-2 sm:pt-3 border-t border-white/30">
            <span className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              <span>🕐</span>
              {formatTime(new Date(currentBooking.slotTime))}
            </span>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">📋</span>
          <span className="break-words">Queue for {selectedDate === actualTodayStr ? "Today" : selectedDate === actualTomorrowStr ? "Tomorrow" : formatDate(new Date(selectedDate))}</span>
        </h3>

        {dateBookings.length === 0 ? (
          <div className="p-8 sm:p-10 md:p-12 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl text-center border-2 border-white/20">
            <p className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</p>
            <p className="text-white font-semibold text-base sm:text-lg md:text-xl">No bookings for this date</p>
            <p className="text-purple-200 mt-1 sm:mt-2 text-sm sm:text-base">Be the first to book!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
            {dateBookings.map((booking, index) => {
              const isNext = index === 0 && booking.status === "PENDING";
              const isPast = booking.status === "COMPLETED";

              return (
                <div
                  key={booking.id}
                  className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all shadow-lg hover:shadow-2xl transform hover:scale-[1.02] ${
                    isNext
                      ? "border-green-400/50 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm shadow-green-500/20"
                      : isPast
                      ? "border-white/10 bg-white/5 backdrop-blur-sm opacity-60"
                      : "border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3">
                        <div className={`px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl md:text-2xl shadow-lg flex-shrink-0 ${
                          isNext
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse"
                            : isPast
                            ? "bg-gray-600 text-white"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        }`}>
                          #{booking.queuePosition}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-base sm:text-lg md:text-xl truncate">{booking.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1 sm:gap-2 justify-end mb-2 sm:mb-3 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl">
                        <span>🕐</span>
                        <span className="whitespace-nowrap">{formatTime(new Date(booking.slotTime))}</span>
                      </p>
                      <p className="text-xs">
                        {isPast ? (
                          <span className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600/80 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm shadow-md whitespace-nowrap">
                            ✓ <span className="hidden sm:inline">Completed</span>
                          </span>
                        ) : isNext ? (
                          <span className="px-2 sm:px-3 py-1 sm:py-2 bg-green-500 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm animate-pulse shadow-lg whitespace-nowrap">
                            🔥 <span className="hidden sm:inline">Now Serving</span>
                          </span>
                        ) : (
                          <span className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-500/30 backdrop-blur-sm border border-purple-400/50 text-purple-100 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap">
                            ⏳ <span className="hidden sm:inline">Waiting</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

  
    </div>
  );
}
