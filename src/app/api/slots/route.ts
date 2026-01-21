import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots, formatDateOnly } from "@/lib/utils";
import { ApiResponse, DaySlots, AvailableSlot } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DaySlots[]>>> {
  try {
    // Use actual system dates (what's stored in DB)
    const actualToday = new Date();
    actualToday.setHours(0, 0, 0, 0);

    const actualTomorrow = new Date();
    actualTomorrow.setDate(actualToday.getDate() + 1);
    actualTomorrow.setHours(0, 0, 0, 0);

    // Debug logs
    console.log("=== SLOTS API DEBUG ===");
    console.log("actualToday:", actualToday.toISOString(), "| Local:", actualToday.toString());
    console.log("actualTomorrow:", actualTomorrow.toISOString(), "| Local:", actualTomorrow.toString());
    console.log("=== END DEBUG ===");

    // Dates to query from DB (actual dates)
    const dates = [actualToday, actualTomorrow];
    const result: DaySlots[] = [];
    
    const now = new Date(); // Current time for filtering past slots

    for (const date of dates) {
      // Format date properly in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const slots = getAvailableSlots(date);

      // Create date range for query
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
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
        const hours = String(booking.slotTime.getHours()).padStart(2, "0");
        const minutes = String(booking.slotTime.getMinutes()).padStart(2, "0");
        const timeStr = `${hours}:${minutes}`;
        slotBookingMap.set(timeStr, (slotBookingMap.get(timeStr) || 0) + 1);
      });

      const daySlots: AvailableSlot[] = slots
        .map((time) => {
          const bookedCount = slotBookingMap.get(time) || 0;
          
          // Check if this slot is in the past (only for today)
          let isPast = false;
          if (isToday) {
            const [hours, minutes] = time.split(':').map(Number);
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hours, minutes, 0, 0);
            isPast = slotDateTime < now;
          }
          
          return {
            time,
            available: bookedCount === 0 && !isPast, // Slot is available only if no bookings and not in past
            bookedCount,
          };
        })
        .filter((slot) => {
          // For today, filter out past slots completely
          if (isToday) {
            const [hours, minutes] = slot.time.split(':').map(Number);
            const slotDateTime = new Date(date);
            slotDateTime.setHours(hours, minutes, 0, 0);
            return slotDateTime >= now; // Only show future slots
          }
          return true; // Show all slots for tomorrow
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
