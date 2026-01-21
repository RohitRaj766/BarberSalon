"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingResponse } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";

export default function AdminDashboard(): React.ReactElement {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string>("");
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

  const handleMarkComplete = async (id: string): Promise<void> => {
    setActionLoading(id);
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
      setActionLoading("");
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    setActionLoading(id);
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
      setActionLoading("");
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage all bookings</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span>❌</span>
            {error}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-blue-600 font-medium mb-1">⏳ Pending</p>
          <p className="text-4xl font-bold text-blue-700">{pendingBookings.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-green-600 font-medium mb-1">✓ Completed</p>
          <p className="text-4xl font-bold text-green-700">{completedBookings.length}</p>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⏳</span>
          Pending Bookings
        </h2>

        {pendingBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🎉</p>
            <p className="text-gray-500 font-medium">No pending bookings</p>
            <p className="text-sm text-gray-400 mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg shadow-sm">
                        #{booking.serialNumber}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{booking.name}</p>
                        <p className="text-sm text-gray-500">📱 {booking.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        📅 {formatDate(new Date(booking.estimatedTime))}
                      </span>
                      <span className="flex items-center gap-1">
                        🕐 {formatTime(new Date(booking.estimatedTime))}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMarkComplete(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-sm hover:shadow-md"
                    >
                      {actionLoading === booking.id ? "⏳" : "✓ Done"}
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-sm hover:shadow-md"
                    >
                      {actionLoading === booking.id ? "⏳" : "🗑️ Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Bookings */}
      <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">✅</span>
          Completed Bookings
        </h2>

        {completedBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-gray-500 text-sm">No completed bookings yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {completedBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="px-2 py-1 bg-green-600 text-white rounded-lg font-bold text-sm">
                    #{booking.serialNumber}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{booking.name}</p>
                    <p className="text-xs text-gray-600">📱 {booking.phone}</p>
                  </div>
                  <span className="text-green-600 text-xl">✓</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
