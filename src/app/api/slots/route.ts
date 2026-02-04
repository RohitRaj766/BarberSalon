import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots, formatDateOnly, getCurrentTimeUTC } from "@/lib/utils";
import { ApiResponse, DaySlots, AvailableSlot } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DaySlots[]>>> {
  try {
    // Get current time in UTC
    const nowUTC = getCurrentTimeUTC();
    
    // Use actual system dates in UTC
    const actualToday = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));
    const actualTomorrow = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate() + 1));

    // Dates to query from DB
    const dates = [actualToday, actualTomorrow];
    const result: DaySlots[] = [];

    for (const date of dates) {
      const dateStr = formatDateOnly(date);
      const slots = getAvailableSlots(date);

      // Create date range for query
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      const isToday = date.getTime() === actualToday.getTime();

      // Get bookings for this date
      const bookings = await prisma.booking.findMany({
        where: {
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: ["PENDING", "COMPLETED"] },
        },
      });

      const slotBookingMap = new Map<string, number>();
      bookings.forEach((booking: { slotTime: Date }) => {
        const hours = String(booking.slotTime.getUTCHours()).padStart(2, "0");
        const minutes = String(booking.slotTime.getUTCMinutes()).padStart(2, "0");
        const timeStr = `${hours}:${minutes}`;
        slotBookingMap.set(timeStr, (slotBookingMap.get(timeStr) || 0) + 1);
      });

      const daySlots: AvailableSlot[] = slots
        .filter((time) => {
          // For today, filter out past slots
          if (isToday) {
            const [hours, minutes] = time.split(':').map(Number);
            const slotDateTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hours, minutes));
            return slotDateTime > nowUTC;
          }
          return true;
        })
        .map((time) => {
          const bookedCount = slotBookingMap.get(time) || 0;
          
          return {
            time,
            available: bookedCount === 0,
            bookedCount,
          };
        });

      result.push({
        date: dateStr,
        slots: daySlots,
      });
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    console.error("Slots fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
