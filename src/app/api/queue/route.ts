import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { getCurrentTimeIST, getTodayIST, getTomorrowIST } from "@/lib/utils";
import { ApiResponse, QueueResponse, BookingResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<QueueResponse>>> {
  try {
    // Check if user is admin
    const isAdmin = await getAdminFromCookie();

    // Get current time and dates in IST
    const nowIST = getCurrentTimeIST();
    const todayIST = getTodayIST();
    const tomorrowIST = getTomorrowIST();
    
    // Create date range that covers today and tomorrow in any timezone
    // Go back 1 day and forward 2 days to ensure we catch all bookings
    const startDate = new Date(todayIST);
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(tomorrowIST);
    endDate.setDate(endDate.getDate() + 2);
    endDate.setHours(23, 59, 59, 999);

    console.log("=== QUEUE API DEBUG (IST) ===");
    console.log("Current time IST:", nowIST.toString());
    console.log("Today IST:", todayIST.toString(), "| ISO:", todayIST.toISOString());
    console.log("Tomorrow IST:", tomorrowIST.toString(), "| ISO:", tomorrowIST.toISOString());
    console.log("Query range:", startDate.toISOString(), "to", endDate.toISOString());
    console.log("=== END DEBUG ===");

    // Get all recent bookings and filter on client side
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "COMPLETED"] },
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [
        { bookingDate: "asc" },
        { slotTime: "asc" }, // Sort by slot time (5pm before 6pm)
        { queuePosition: "asc" },
      ],
    });

    console.log(`Found ${bookings.length} bookings in date range`);
    
    // Filter to only today and tomorrow using bookingDate at midnight IST
    // Compare using timestamps to avoid timezone string issues
    const todayMidnight = todayIST.getTime();
    const tomorrowMidnight = tomorrowIST.getTime();
    const dayAfterMidnight = new Date(tomorrowIST);
    dayAfterMidnight.setDate(dayAfterMidnight.getDate() + 1);
    const dayAfterTimestamp = dayAfterMidnight.getTime();
    
    const filteredBookings = bookings.filter(booking => {
      const bookingTimestamp = booking.bookingDate.getTime();
      return bookingTimestamp >= todayMidnight && bookingTimestamp < dayAfterTimestamp;
    });
    
    console.log(`Filtered to ${filteredBookings.length} bookings for today and tomorrow (IST)`);
    console.log("Today midnight timestamp:", todayMidnight, "Tomorrow midnight:", tomorrowMidnight);
    if (filteredBookings.length > 0) {
      console.log("First booking:", filteredBookings[0].bookingDate.toISOString(), "timestamp:", filteredBookings[0].bookingDate.getTime());
      console.log("Last booking:", filteredBookings[filteredBookings.length - 1].bookingDate.toISOString(), "timestamp:", filteredBookings[filteredBookings.length - 1].bookingDate.getTime());
    }

    const response: BookingResponse[] = filteredBookings.map((booking) => ({
      id: booking.id,
      serialNumber: booking.serialNumber,
      name: booking.name,
      // Only include phone for admin
      ...(isAdmin && { phone: booking.phone }),
      queuePosition: booking.queuePosition,
      bookingDate: booking.bookingDate.toISOString(),
      slotTime: booking.slotTime.toISOString(),
      estimatedTime: booking.estimatedTime.toISOString(),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          bookings: response,
          totalCount: filteredBookings.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Queue fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}
