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
    return <div className="text-center py-8">Loading queue information...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
  }

  if (!booking) {
    return <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">Booking not found</div>;
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-4">Your Queue Status</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Queue Position</p>
            <p className="text-3xl font-bold text-blue-600">#{booking.queuePosition}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">People Ahead</p>
            <p className="text-3xl font-bold text-orange-600">{peopleAhead}</p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-600">Your Slot Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatTime(new Date(booking.slotTime))}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-600">Estimated Service Time</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatTime(new Date(booking.estimatedTime))}
            </p>
          </div>
        </div>

        {booking.status === "COMPLETED" && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded text-sm font-medium">
            ✓ Your appointment has been completed
          </div>
        )}

        {booking.status === "CANCELLED" && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
            ✗ Your appointment has been cancelled
          </div>
        )}
      </div>

      {/* Queue List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Queue for {formatDate(bookingDate)}
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dateBookings.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                item.id === bookingId
                  ? "bg-blue-100 border border-blue-300"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="font-bold text-lg w-8 text-center">#{item.queuePosition}</div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatTime(new Date(item.slotTime))}</p>
                </div>
              </div>
              <div className="text-xs font-medium">
                {item.status === "COMPLETED" && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Done</span>
                )}
                {item.status === "PENDING" && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Waiting</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
