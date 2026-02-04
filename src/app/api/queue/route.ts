import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { getCurrentTimeUTC, getTodayUTC, getTomorrowUTC } from "@/lib/utils";
import { ApiResponse, QueueResponse, BookingResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<QueueResponse>>> {
  try {
    // Check if user is admin
    const isAdmin = await getAdminFromCookie();

    // Get current time and dates in UTC
    const nowUTC = getCurrentTimeUTC();
    const todayUTC = getTodayUTC();
    const tomorrowUTC = getTomorrowUTC();
    
    // Create date range that covers today and tomorrow
    const startDate = new Date(todayUTC);
    
    const endDate = new Date(tomorrowUTC);
    endDate.setUTCHours(23, 59, 59, 999);

    // Get all bookings for today and tomorrow
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
        { slotTime: "asc" },
        { queuePosition: "asc" },
      ],
    });

    const response: BookingResponse[] = bookings.map((booking) => ({
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
          totalCount: bookings.length,
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
