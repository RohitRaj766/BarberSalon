"use client";

import { useEffect, useState } from "react";
import { BookingResponse } from "@/types";
import { formatTime, formatDate, formatDateOnly } from "@/lib/utils";

interface QueueDisplayProps {
  bookingId: string;
}

export default function QueueDisplay({ bookingId }: QueueDisplayProps): React.ReactElement {
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [queue, setQueue] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const [bookingRes, queueRes] = await Promise.all([
          fetch(`/api/booking/${bookingId}`),
          fetch("/api/queue"),
        ]);

        if (!bookingRes.ok) {
          setError("Booking not found");
          return;
        }

        const bookingData = await bookingRes.json();
        const queueData = await queueRes.json();

        setBooking(bookingData.data);
        setQueue(queueData.data.bookings);
      } catch (err) {
        setError("Failed to load queue information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
        <p className="text-white font-medium">Loading queue information...</p>
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

  if (!booking) {
    return (
      <div className="p-6 bg-yellow-500/20 border border-yellow-500/50 backdrop-blur-sm rounded-2xl">
        <p className="text-yellow-200 flex items-center gap-2 justify-center">
          <span className="text-2xl">⚠️</span>
          Booking not found
        </p>
      </div>
    );
  }

  const bookingDate = new Date(booking.bookingDate);
  const dateBookings = queue.filter(
    (b) => formatDateOnly(new Date(b.bookingDate)) === formatDateOnly(bookingDate)
  );
  const currentPosition = dateBookings.findIndex((b) => b.id === bookingId) + 1;
  const peopleAhead = currentPosition - 1;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border-2 border-blue-400/30 rounded-2xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📍</span>
          Your Queue Status
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">Queue Position</p>
            <p className="text-4xl font-bold text-white">#{booking.queuePosition}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-orange-200 mb-1">People Ahead</p>
            <p className="text-4xl font-bold text-white">{peopleAhead}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1 flex items-center gap-1">
              <span>🕐</span>
              Your Slot Time
            </p>
            <p className="text-xl font-semibold text-white">
              {formatTime(new Date(booking.slotTime))}
            </p>
          </div>
        </div>

        {booking.status === "COMPLETED" && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-400/50 backdrop-blur-sm rounded-xl">
            <p className="text-green-200 font-semibold flex items-center gap-2">
              <span className="text-xl">✓</span>
              Your appointment has been completed
            </p>
          </div>
        )}

        {booking.status === "CANCELLED" && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-400/50 backdrop-blur-sm rounded-xl">
            <p className="text-red-200 font-semibold flex items-center gap-2">
              <span className="text-xl">✗</span>
              Your appointment has been cancelled
            </p>
          </div>
        )}
      </div>

      {/* Queue List */}
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📋</span>
          Queue for {formatDate(bookingDate)}
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {dateBookings.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                item.id === bookingId
                  ? "bg-blue-500/30 border-2 border-blue-400/50 shadow-lg scale-105"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`font-bold text-xl w-12 text-center px-3 py-1 rounded-lg ${
                  item.id === bookingId
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white"
                }`}>
                  #{item.queuePosition}
                </div>
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-blue-200">{formatTime(new Date(item.slotTime))}</p>
                </div>
              </div>
              <div className="text-xs font-semibold">
                {item.status === "COMPLETED" && (
                  <span className="px-3 py-1.5 bg-green-500/30 border border-green-400/50 text-green-200 rounded-lg">
                    ✓ Done
                  </span>
                )}
                {item.status === "PENDING" && (
                  <span className="px-3 py-1.5 bg-yellow-500/30 border border-yellow-400/50 text-yellow-200 rounded-lg">
                    ⏳ Waiting
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
