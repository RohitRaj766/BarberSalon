"use client";

import { useEffect, useState } from "react";
import { BookingResponse } from "@/types";
import { formatTime, formatDate, formatDateOnly } from "@/lib/utils";

export default function PublicQueueDisplay(): React.ReactElement {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

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
        
        // Set initial selected date to today in UTC
        const now = new Date();
        const year = now.getUTCFullYear();
        const month = String(now.getUTCMonth() + 1).padStart(2, '0');
        const day = String(now.getUTCDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        setSelectedDate(todayStr);
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, selectedDate]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin text-6xl mb-4">⏳</div>
        <p className="text-white font-medium text-lg">Loading queue...</p>
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

  // Get actual dates in UTC
  const now = new Date();
  
  // Create today and tomorrow at midnight UTC
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  
  // Get timestamps for comparison
  const todayTimestamp = todayUTC.getTime();
  const tomorrowTimestamp = tomorrowUTC.getTime();
  const dayAfterTimestamp = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2)).getTime();
  
  // Format as YYYY-MM-DD for display
  const actualTodayStr = formatDateOnly(todayUTC);
  const actualTomorrowStr = formatDateOnly(tomorrowUTC);

  // Filter bookings to ONLY show today and tomorrow using timestamps
  const filteredBookings = bookings.filter((b) => {
    const bookingTimestamp = new Date(b.bookingDate).getTime();
    return bookingTimestamp >= todayTimestamp && bookingTimestamp < dayAfterTimestamp;
  });

  // Get unique dates from filtered bookings using timestamps
  const uniqueDateTimestamps = new Set<number>();
  filteredBookings.forEach(b => {
    const bookingDate = new Date(b.bookingDate);
    const midnight = new Date(Date.UTC(bookingDate.getUTCFullYear(), bookingDate.getUTCMonth(), bookingDate.getUTCDate()));
    uniqueDateTimestamps.add(midnight.getTime());
  });
  
  const validDates: string[] = [];
  uniqueDateTimestamps.forEach(timestamp => {
    const date = new Date(timestamp);
    validDates.push(formatDateOnly(date));
  });
  validDates.sort();

  // Always ensure today and tomorrow are in the tabs (even if no bookings)
  if (!validDates.includes(actualTodayStr)) {
    validDates.unshift(actualTodayStr);
  }
  if (!validDates.includes(actualTomorrowStr)) {
    validDates.push(actualTomorrowStr);
  }
  validDates.sort();

  // Filter bookings by selected date using timestamps
  const [selYear, selMonth, selDay] = selectedDate.split('-').map(Number);
  const selectedMidnight = new Date(Date.UTC(selYear, selMonth - 1, selDay));
  const selectedTimestamp = selectedMidnight.getTime();
  const selectedNextDay = selectedTimestamp + (24 * 60 * 60 * 1000);
  
  let dateBookings = filteredBookings.filter((b) => {
    const bookingTimestamp = new Date(b.bookingDate).getTime();
    return bookingTimestamp >= selectedTimestamp && bookingTimestamp < selectedNextDay;
  });

  // Apply status filter
  if (statusFilter !== "ALL") {
    dateBookings = dateBookings.filter((b) => b.status === statusFilter);
  }

  // Apply search filter (name, booking number, slot number)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    dateBookings = dateBookings.filter((b) => 
      b.name.toLowerCase().includes(query) ||
      b.serialNumber.toString().includes(query) ||
      b.queuePosition.toString().includes(query)
    );
  }

  // Pagination
  const totalPages = Math.ceil(dateBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = dateBookings.slice(startIndex, endIndex);

  // Get current booking (first pending)
  const currentBooking = dateBookings.find((b) => b.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Date Tabs */}
      {validDates.length > 0 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {validDates.map((date) => {
            // Determine label based on IST dates
            let label = date;
            
            // Parse date string as YYYY-MM-DD without timezone conversion
            const [y, m, d] = date.split('-').map(Number);
            const displayDate = new Date(y, m - 1, d);
            
            if (date === actualTodayStr) {
              label = "Today";
            } else if (date === actualTomorrowStr) {
              label = "Tomorrow";
            }

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold whitespace-nowrap transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 text-sm sm:text-base ${
                  selectedDate === date
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105"
                    : "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                <div className="font-bold">{label}</div>
                <div className="text-xs opacity-75 mt-0.5 sm:mt-1">{formatDate(displayDate)}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Current Service Info */}
      {currentBooking && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 space-y-3 sm:space-y-4 shadow-2xl animate-pulse-glow">
          <div className="text-xs sm:text-sm opacity-90 font-semibold flex items-center gap-1 sm:gap-2">
            <span className="text-base sm:text-lg md:text-xl">🔥</span>
            <span>Currently Serving</span>
          </div>
          <div className="text-5xl sm:text-6xl md:text-7xl font-bold drop-shadow-lg">#{currentBooking.queuePosition}</div>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold break-words">{currentBooking.name}</div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base opacity-90 pt-2 sm:pt-3 border-t border-white/30 flex-wrap">
            <span className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              <span>🕐</span>
              {formatTime(new Date(currentBooking.slotTime))}
            </span>
            <span className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
              <span>🎫</span>
              Booking #{currentBooking.serialNumber}
            </span>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, booking #, or slot #..."
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
        </div>

        {/* Results count */}
        <div className="text-sm text-purple-200">
          Showing {paginatedBookings.length} of {dateBookings.length} bookings
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">📋</span>
          <span className="break-words">
            Queue for {selectedDate === actualTodayStr ? "Today" : selectedDate === actualTomorrowStr ? "Tomorrow" : (() => {
              const [y, m, d] = selectedDate.split('-').map(Number);
              return formatDate(new Date(y, m - 1, d));
            })()}
          </span>
        </h3>

        {dateBookings.length === 0 ? (
          <div className="p-8 sm:p-10 md:p-12 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl text-center border-2 border-white/20">
            <p className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</p>
            <p className="text-white font-semibold text-base sm:text-lg md:text-xl">No bookings found</p>
            <p className="text-purple-200 mt-1 sm:mt-2 text-sm sm:text-base">
              {searchQuery || statusFilter !== "ALL" ? "Try adjusting your filters" : "Be the first to book!"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-200">Slot #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-200">Booking #</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-200">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-200">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-purple-200">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {paginatedBookings.map((booking) => {
                      const isNext = booking.status === "PENDING" && booking.id === currentBooking?.id;
                      const isPast = booking.status === "COMPLETED";

                      return (
                        <tr
                          key={booking.id}
                          className={`transition-all hover:bg-white/5 ${
                            isNext ? "bg-green-500/10" : isPast ? "opacity-60" : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg font-bold text-lg shadow-md ${
                              isNext
                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse"
                                : isPast
                                ? "bg-gray-600 text-white"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            }`}>
                              #{booking.queuePosition}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-white font-medium">#{booking.serialNumber}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-white font-semibold">{booking.name}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-purple-200">{formatTime(new Date(booking.slotTime))}</span>
                          </td>
                          <td className="px-4 py-4">
                            {isPast ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600/80 text-white rounded-lg font-semibold text-sm">
                                ✓ Completed
                              </span>
                            ) : isNext ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg font-semibold text-sm animate-pulse">
                                🔥 Now Serving
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/30 border border-purple-400/50 text-purple-100 rounded-lg font-semibold text-sm">
                                ⏳ Waiting
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2 sm:space-y-3">
              {paginatedBookings.map((booking) => {
                const isNext = booking.status === "PENDING" && booking.id === currentBooking?.id;
                const isPast = booking.status === "COMPLETED";

                return (
                  <div
                    key={booking.id}
                    className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all shadow-lg hover:shadow-2xl ${
                      isNext
                        ? "border-green-400/50 bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm shadow-green-500/20"
                        : isPast
                        ? "border-white/10 bg-white/5 backdrop-blur-sm opacity-60"
                        : "border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
                          <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-lg sm:text-xl shadow-lg flex-shrink-0 ${
                            isNext
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white animate-pulse"
                              : isPast
                              ? "bg-gray-600 text-white"
                              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                          }`}>
                            #{booking.queuePosition}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-base sm:text-lg truncate">{booking.name}</p>
                            <p className="text-xs sm:text-sm text-purple-200 flex items-center gap-1 mt-1">
                              <span>🎫</span>
                              <span>Booking #{booking.serialNumber}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs sm:text-sm font-semibold text-white flex items-center gap-1 sm:gap-2 justify-end mb-2 sm:mb-3 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg">
                          <span>🕐</span>
                          <span className="whitespace-nowrap">{formatTime(new Date(booking.slotTime))}</span>
                        </p>
                        <p className="text-xs">
                          {isPast ? (
                            <span className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600/80 backdrop-blur-sm text-white rounded-lg font-semibold text-xs sm:text-sm shadow-md whitespace-nowrap">
                              ✓ <span className="hidden sm:inline">Completed</span>
                            </span>
                          ) : isNext ? (
                            <span className="px-2 sm:px-3 py-1 sm:py-2 bg-green-500 text-white rounded-lg font-semibold text-xs sm:text-sm animate-pulse shadow-lg whitespace-nowrap">
                              🔥 <span className="hidden sm:inline">Now Serving</span>
                            </span>
                          ) : (
                            <span className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-500/30 backdrop-blur-sm border border-purple-400/50 text-purple-100 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap">
                              ⏳ <span className="hidden sm:inline">Waiting</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                  ← Prev
                </button>
                <span className="text-white font-medium px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

  
    </div>
  );
}
