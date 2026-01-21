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
    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-2 border-green-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-xl animate-float">
      <div className="flex items-center gap-2 sm:gap-3 justify-center">
        <div className="text-4xl sm:text-5xl animate-bounce">✓</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Booking Confirmed!</h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
          <p className="text-xs sm:text-sm text-green-200 mb-1">Booking ID</p>
          <p className="font-mono text-white text-sm sm:text-base md:text-lg font-semibold break-all">{booking.id}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
          <p className="text-xs sm:text-sm text-green-200 mb-1 sm:mb-2">Queue Position</p>
          <p className="text-4xl sm:text-5xl font-bold text-white">#{booking.queuePosition}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <p className="text-xs sm:text-sm text-green-200 mb-1 flex items-center gap-1">
              <span>📅</span>
              Date
            </p>
            <p className="font-semibold text-white text-xs sm:text-sm break-words">{formatDate(bookingDate)}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <p className="text-xs sm:text-sm text-green-200 mb-1 flex items-center gap-1">
              <span>🕐</span>
              Time
            </p>
            <p className="font-semibold text-white text-xs sm:text-sm">{formatTime(slotTime)}</p>
          </div>
        </div>

   

        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <p className="text-xs sm:text-sm text-green-200 mb-1 flex items-center gap-1">
              <span>👤</span>
              Name
            </p>
            <p className="text-white font-medium text-xs sm:text-sm break-words">{booking.name}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
            <p className="text-xs sm:text-sm text-green-200 mb-1 flex items-center gap-1">
              <span>📱</span>
              Phone
            </p>
            <p className="text-white font-medium text-xs sm:text-sm break-all">{booking.phone}</p>
          </div>
        </div>
      </div>

      <div className="pt-3 sm:pt-4 border-t border-green-400/30">
        <p className="text-center text-green-200 text-xs sm:text-sm">
          🎉 Your slot has been successfully booked!
        </p>
      </div>
    </div>
  );
}
