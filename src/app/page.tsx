"use client";

import { useState } from "react";
import BookingForm from "@/components/BookingForm";
import BookingConfirmation from "@/components/BookingConfirmation";
import { BookingResponse } from "@/types";
import Link from "next/link";

export default function Home(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-36 sm:w-56 md:w-72 h-36 sm:h-56 md:h-72 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-md mx-auto py-6 sm:py-8 md:py-12 relative z-10">
        {/* Header with animated gradient */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 animate-float">
          <div className="inline-block mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
              <span className="text-4xl sm:text-5xl md:text-6xl">✂️</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-2xl px-4">
            Chotu Salon
          </h1>
          <p className="text-white/90 text-base sm:text-lg md:text-xl font-medium px-4">Book your haircut appointment</p>
        </div>

        {/* Main card with glassmorphism effect */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-white/20 hover:border-white/30 transition-all duration-300">
          <BookingFormWrapper />
        </div>

        {/* View Queue button */}
        <div className="text-center space-y-3 px-4">
          <Link
            href="/queue"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white/20 backdrop-blur-md text-white rounded-xl sm:rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 border border-white/30 text-sm sm:text-base"
          >
            <span className="text-lg sm:text-xl">👥</span>
            <span>View Live Queue</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function BookingFormWrapper(): React.ReactElement {
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  if (booking) {
    return <BookingConfirmation booking={booking} />;
  }

  return <BookingForm onSuccess={setBooking} />;
}
