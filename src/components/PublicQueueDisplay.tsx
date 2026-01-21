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
    return <div className="text-center py-8">Loading queue...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
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
        <div className="flex gap-2 overflow-x-auto pb-2">
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
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedDate === date
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div>{label}</div>
                <div className="text-xs opacity-75">{formatDate(displayDate)}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Current Service Info */}
      {currentBooking && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="text-sm opacity-90 font-medium">🔥 Currently Serving</div>
          <div className="text-5xl font-bold">#{currentBooking.serialNumber}</div>
          <div className="text-xl font-semibold">{currentBooking.name}</div>
          <div className="flex items-center gap-4 text-sm opacity-90 pt-2 border-t border-white/20">
            <span className="flex items-center gap-1">
              🕐 {formatTime(new Date(currentBooking.slotTime))}
            </span>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Queue for {selectedDate === actualTodayStr ? "Today" : selectedDate === actualTomorrowStr ? "Tomorrow" : formatDate(new Date(selectedDate))}
        </h3>

        {dateBookings.length === 0 ? (
          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl text-center border-2 border-gray-200">
            <p className="text-6xl mb-3">🎉</p>
            <p className="text-gray-600 font-medium">No bookings for this date</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to book!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dateBookings.map((booking, index) => {
              const isNext = index === 0 && booking.status === "PENDING";
              const isPast = booking.status === "COMPLETED";

              return (
                <div
                  key={booking.id}
                  className={`p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md ${
                    isNext
                      ? "border-green-400 bg-gradient-to-r from-green-50 to-green-100 shadow-md"
                      : isPast
                      ? "border-gray-300 bg-gray-50 opacity-60"
                      : "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`px-3 py-1 rounded-lg font-bold text-xl shadow-sm ${
                          isNext
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            : isPast
                            ? "bg-gray-400 text-white"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        }`}>
                          #{booking.serialNumber}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{booking.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-1 justify-end">
                        🕐 {formatTime(new Date(booking.slotTime))}
                      </p>
                      <p className="text-xs mt-2">
                        {isPast ? (
                          <span className="px-2 py-1 bg-green-600 text-white rounded-full font-medium text-xs">
                            ✓ Completed
                          </span>
                        ) : isNext ? (
                          <span className="px-2 py-1 bg-green-500 text-white rounded-full font-medium text-xs animate-pulse">
                            🔥 Now Serving
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium text-xs">
                            ⏳ Waiting
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Wait time estimate */}
                  {/* {!isPast && booking.status === "PENDING" && !isNext && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        ⏰ Estimated time: <span className="font-semibold">{formatTime(new Date(booking.estimatedTime))}</span>
                      </p>
                    </div>
                  )} */}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-blue-600 font-medium mb-1">⏳ In Queue</p>
          <p className="text-4xl font-bold text-blue-700">
            {dateBookings.filter((b) => b.status === "PENDING").length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-green-600 font-medium mb-1">✓ Completed</p>
          <p className="text-4xl font-bold text-green-700">
            {dateBookings.filter((b) => b.status === "COMPLETED").length}
          </p>
        </div>
      </div>
    </div>
  );
}
