"use client";

import { BookingResponse } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";
import Link from "next/link";

interface BookingConfirmationProps {
  booking: BookingResponse;
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps): React.ReactElement {
  const slotTime = new Date(booking.slotTime);
  const bookingDate = new Date(booking.bookingDate);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-2xl">✓</div>
        <h2 className="text-xl font-bold text-green-800">Booking Confirmed!</h2>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Booking ID</p>
          <p className="font-mono text-gray-900">{booking.id}</p>
        </div>

        <div>
          <p className="text-gray-600">Queue Position</p>
          <p className="text-2xl font-bold text-blue-600">#{booking.queuePosition}</p>
        </div>

        <div>
          <p className="text-gray-600">Date & Time</p>
          <p className="font-semibold text-gray-900">
            {formatDate(bookingDate)} at {formatTime(slotTime)}
          </p>
        </div>

        <div>
          <p className="text-gray-600">Estimated Service Time</p>
          <p className="font-semibold text-gray-900">
            {formatTime(new Date(booking.estimatedTime))}
          </p>
        </div>

        <div>
          <p className="text-gray-600">Name</p>
          <p className="text-gray-900">{booking.name}</p>
        </div>

        <div>
          <p className="text-gray-600">Phone</p>
          <p className="text-gray-900">{booking.phone}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-green-200 space-y-2">
        {/* <Link
          href="/queue"
          className="block text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          View Live Queue
        </Link> */}
        {/* <Link
          href={`/status/${booking.id}`}
          className="block text-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          Track Your Booking
        </Link> */}
      </div>
    </div>
  );
}
