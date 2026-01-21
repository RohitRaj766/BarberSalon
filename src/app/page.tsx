"use client";

import { useState } from "react";
import BookingForm from "@/components/BookingForm";
import BookingConfirmation from "@/components/BookingConfirmation";
import { BookingResponse } from "@/types";
import Link from "next/link";

export default function Home(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-md mx-auto py-8">
        {/* Header with animated gradient */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl">✂️</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Barber Shop
          </h1>
          <p className="text-white/90 text-lg">Book your haircut appointment</p>
        </div>

        {/* Main card with glassmorphism effect */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-6 mb-4 border border-white/20">
          <BookingFormWrapper />
        </div>

        {/* View Queue button */}
        <div className="text-center space-y-2">
          <Link
            href="/queue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-medium hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>👥</span>
            View Live Queue
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
