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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const router = useRouter();

  const fetchBookings = async (): Promise<void> => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/queue");
      const data = await response.json();

      if (!response.ok) {
        setError("Failed to load bookings");
        return;
      }

      setBookings(data.data.bookings);
      setError("");
    } catch (err) {
      setError("Failed to load bookings");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, itemsPerPage]);

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

  // Apply filters
  let filteredBookings = bookings;

  // Status filter
  if (statusFilter !== "ALL") {
    filteredBookings = filteredBookings.filter((b) => b.status === statusFilter);
  }

  // Search filter (name, phone, booking number, slot number)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredBookings = filteredBookings.filter((b) => 
      b.name.toLowerCase().includes(query) ||
      (b.phone && b.phone.includes(query)) ||
      b.serialNumber.toString().includes(query) ||
      b.queuePosition.toString().includes(query)
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg break-words">
           Booking Management 
          </h1>
          <p className="text-purple-200 text-xs sm:text-sm md:text-base">Manage all bookings here</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={fetchBookings}
            disabled={refreshing}
            className="text-white hover:scale-110 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh bookings"
          >
            <svg 
              className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
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

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, phone, booking #, or slot #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-purple-200/60 focus:outline-none focus:border-purple-400 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-all cursor-pointer"
          >
            <option value="ALL" className="bg-gray-800">All Status</option>
            <option value="PENDING" className="bg-gray-800">Pending</option>
            <option value="COMPLETED" className="bg-gray-800">Completed</option>
          </select>

          {/* Rows per page */}
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-4 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-all cursor-pointer"
          >
            <option value={5} className="bg-gray-800">5 rows</option>
            <option value={10} className="bg-gray-800">10 rows</option>
            <option value={50} className="bg-gray-800">50 rows</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-purple-200">
          Showing {paginatedBookings.length} of {filteredBookings.length} bookings
        </div>
      </div>

      {/* All Bookings Table */}
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">📋</span>
          <span>All Bookings</span>
        </h2>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</p>
            <p className="text-white font-semibold text-base sm:text-lg md:text-xl">No bookings found</p>
            <p className="text-purple-200 mt-1 sm:mt-2 text-sm sm:text-base">
              {searchQuery || statusFilter !== "ALL" ? "Try adjusting your filters" : "All caught up!"}
            </p>
          </div>
        ) : (
          <>
            {/* Table View (All Devices) */}
            <div className="overflow-hidden rounded-xl border-2 border-white/20">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200">Slot #</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200">Book #</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200">Name</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200">Phone</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200 hidden md:table-cell">Date</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200">Time</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-purple-200">Status</th>
                      <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-purple-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paginatedBookings.map((booking) => {
                      const isPending = booking.status === "PENDING";
                      const isCompleted = booking.status === "COMPLETED";

                      return (
                        <tr
                          key={booking.id}
                          className={`transition-all hover:bg-white/5 ${
                            isCompleted ? "opacity-70" : ""
                          }`}
                        >
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <div className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-sm sm:text-base shadow-md ${
                              isCompleted
                                ? "bg-gray-600 text-white"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            }`}>
                              #{booking.queuePosition}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <span className="text-white font-medium text-xs sm:text-base">#{booking.serialNumber}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <span className="text-white font-semibold text-xs sm:text-base">{booking.name}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-purple-200 text-xs sm:text-sm">{booking.phone}</span>
                              <a
                                href={`tel:${booking.phone}`}
                                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
                                title={`Call ${booking.name}`}
                              >
                                📞
                              </a>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                            <span className="text-purple-200 text-xs">{formatDate(new Date(booking.slotTime))}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <span className="text-purple-200 text-xs sm:text-sm">{formatTime(new Date(booking.slotTime))}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-600/80 text-white rounded-lg font-semibold text-xs whitespace-nowrap">
                                ✓ <span className="hidden sm:inline">Done</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-500/30 border border-blue-400/50 text-blue-100 rounded-lg font-semibold text-xs whitespace-nowrap">
                                ⏳ <span className="hidden sm:inline">Wait</span>
                              </span>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-3 sm:py-4">
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                              {isPending && (
                                <button
                                  onClick={() => handleMarkComplete(booking.id, booking.name)}
                                  disabled={completeLoading === booking.id || deleteLoading === booking.id}
                                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                                  title="Mark as completed"
                                >
                                  {completeLoading === booking.id ? (
                                    <span className="animate-spin">⏳</span>
                                  ) : (
                                    <>✓<span className="hidden sm:inline ml-1">Done</span></>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(booking.id, booking.name)}
                                disabled={completeLoading === booking.id || deleteLoading === booking.id}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                                title="Delete booking"
                              >
                                {deleteLoading === booking.id ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  "🗑️"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-purple-200">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-sm"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-sm"
                  >
                    ← Prev
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                              : "bg-white/10 border-2 border-white/20 text-white hover:bg-white/20"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-sm"
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all text-sm"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
