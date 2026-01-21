"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingResponse } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";

export default function AdminDashboard(): React.ReactElement {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [completeLoading, setCompleteLoading] = useState<string>("");
  const [deleteLoading, setDeleteLoading] = useState<string>("");
  const router = useRouter();

  const fetchBookings = async (): Promise<void> => {
    try {
      const response = await fetch("/api/queue");
      const data = await response.json();

      if (!response.ok) {
        setError("Failed to load bookings");
        return;
      }

      setBookings(data.data.bookings);
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchBookings, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkComplete = async (id: string, name: string): Promise<void> => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Mark "${name}" as completed?\n\nThis will move the booking to the completed list.`
    );
    
    if (!confirmed) return;

    setCompleteLoading(id);
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (response.ok) {
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCompleteLoading("");
    }
  };

  const handleDelete = async (id: string, name: string): Promise<void> => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Delete booking for "${name}"?\n\nThis action cannot be undone!`
    );
    
    if (!confirmed) return;

    setDeleteLoading(id);
    try {
      const response = await fetch(`/api/booking/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading("");
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg break-words">
            Welcome Chotu !
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm md:text-base">Manage all bookings here</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <span className="flex items-center gap-1 sm:gap-2">
            <span>🚪</span>
            <span className="hidden sm:inline">Logout</span>
          </span>
        </button>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/50 backdrop-blur-sm rounded-lg sm:rounded-xl">
          <p className="text-xs sm:text-sm text-red-200 flex items-center gap-2">
            <span>❌</span>
            <span className="break-words">{error}</span>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border-2 border-blue-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <p className="text-xs sm:text-sm text-blue-200 font-semibold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
            <span>⏳</span>
            Pending
          </p>
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{pendingBookings.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border-2 border-green-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <p className="text-xs sm:text-sm text-green-200 font-semibold mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
            <span>✓</span>
            Completed
          </p>
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">{completedBookings.length}</p>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">⏳</span>
          <span>Pending Bookings</span>
        </h2>

        {pendingBookings.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</p>
            <p className="text-white font-semibold text-base sm:text-lg md:text-xl">No pending bookings</p>
            <p className="text-purple-200 mt-1 sm:mt-2 text-sm sm:text-base">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-1 sm:pr-2">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-3 sm:p-4 md:p-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl hover:border-purple-400/50 transition-all shadow-md hover:shadow-xl transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl font-bold text-base sm:text-lg md:text-xl shadow-lg flex-shrink-0">
                        #{booking.queuePosition}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm sm:text-base md:text-lg truncate">{booking.name}</p>
                        <p className="text-xs sm:text-sm text-purple-200 flex items-center gap-1 truncate">
                          <span>📱</span>
                          {booking.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-purple-200 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span className="whitespace-nowrap">{formatDate(new Date(booking.slotTime))}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>🕐</span>
                        <span className="whitespace-nowrap">{formatTime(new Date(booking.slotTime))}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleMarkComplete(booking.id, booking.name)}
                      disabled={completeLoading === booking.id || deleteLoading === booking.id}
                      className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      {completeLoading === booking.id ? (
                        <span className="flex items-center justify-center gap-1">
                          <span className="animate-spin">⏳</span>
                          <span className="hidden sm:inline">...</span>
                        </span>
                      ) : (
                        <>
                          <span>✓</span>
                          <span className="hidden sm:inline ml-1">Done</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id, booking.name)}
                      disabled={completeLoading === booking.id || deleteLoading === booking.id}
                      className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    >
                      {deleteLoading === booking.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        "🗑️"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Bookings */}
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">✅</span>
          <span>Completed Bookings</span>
        </h2>

        {completedBookings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-4xl sm:text-5xl mb-2 sm:mb-3">📋</p>
            <p className="text-purple-200 text-sm sm:text-base">No completed bookings yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto pr-1 sm:pr-2">
            {completedBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-3 sm:p-4 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-400/30 rounded-lg sm:rounded-xl hover:border-green-400/50 transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md flex-shrink-0">
                    #{booking.queuePosition}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm sm:text-base truncate">{booking.name}</p>
                    <p className="text-xs text-green-200 flex items-center gap-1 truncate">
                      <span>📱</span>
                      {booking.phone}
                    </p>
                  </div>
                  <span className="text-green-400 text-xl sm:text-2xl flex-shrink-0">✓</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
