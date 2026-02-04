import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateEstimatedTime, validateName, validatePhoneNumber, getSlotNumber, getCurrentTimeUTC, getTodayUTC, getTomorrowUTC } from "@/lib/utils";
import { BookingRequest, ApiResponse, BookingResponse } from "@/types";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<BookingResponse>>> {
  try {
    const body: BookingRequest = await request.json();

    // Validate input
    if (!validateName(body.name)) {
      return NextResponse.json(
        { success: false, error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (!validatePhoneNumber(body.phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Validate booking date - parse as UTC
    const [year, month, day] = body.bookingDate.split('-').map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    // Check if date is today or tomorrow using UTC
    const todayUTC = getTodayUTC();
    const tomorrowUTC = getTomorrowUTC();
    
    const isValidDate = bookingDate.getTime() === todayUTC.getTime() || 
                        bookingDate.getTime() === tomorrowUTC.getTime();
    
    if (!isValidDate) {
      return NextResponse.json(
        { success: false, error: "Can only book for today or tomorrow" },
        { status: 400 }
      );
    }

    // Validate slot time - parse as UTC
    const [slotHours, slotMinutes] = body.slotTime.split(':').map(Number);
    const slotTime = new Date(Date.UTC(year, month - 1, day, slotHours, slotMinutes, 0, 0));
    
    if (isNaN(slotTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid slot time" },
        { status: 400 }
      );
    }

    // Check if slot time is in the past (only for today) using UTC
    const nowUTC = getCurrentTimeUTC();
    const isTodayBooking = bookingDate.getTime() === todayUTC.getTime();
    if (isTodayBooking && slotTime < nowUTC) {
      return NextResponse.json(
        { success: false, error: "Cannot book slots in the past" },
        { status: 400 }
      );
    }

    // Create date range for queries
    const startOfDay = new Date(bookingDate);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Check if slot is already booked (only one booking per slot)
    const existingSlotBooking = await prisma.booking.findFirst({
      where: {
        slotTime: slotTime,
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["PENDING", "COMPLETED"] },
      },
    });

    if (existingSlotBooking) {
      return NextResponse.json(
        { success: false, error: "This time slot is already booked" },
        { status: 400 }
      );
    }

    // Check for existing pending booking with same phone on same date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        phone: body.phone,
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "PENDING",
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: "You already have a pending booking for this date" },
        { status: 400 }
      );
    }

    // Get or create counter for this specific date
    // Format: booking_counter_YYYYMMDD
    const dateStr = body.bookingDate.replace(/-/g, ''); // "2026-01-22" -> "20260122"
    const counterId = `booking_counter_${dateStr}`;
    
    let counter = await prisma.counter.findUnique({
      where: { id: counterId },
    });

    if (!counter) {
      counter = await prisma.counter.create({
        data: { id: counterId, value: 0 },
      });
    }

    // Increment counter and get next serial number for this date
    const updatedCounter = await prisma.counter.update({
      where: { id: counterId },
      data: { value: { increment: 1 } },
    });

    const serialNumber = updatedCounter.value;

    console.log("=== SERIAL NUMBER DEBUG ===");
    console.log("Date string:", dateStr);
    console.log("Counter ID:", counterId);
    console.log("Counter value:", updatedCounter.value);
    console.log("Serial number:", serialNumber);
    console.log("=== END DEBUG ===");

    // Calculate queue position based on slot number
    // Slot 1 = 08:00, Slot 2 = 08:18, Slot 3 = 08:36, etc.
    const queuePosition = getSlotNumber(body.slotTime);

    console.log("=== QUEUE POSITION DEBUG ===");
    console.log("Slot time:", body.slotTime);
    console.log("Queue position (slot number):", queuePosition);
    console.log("Serial number (booking number):", serialNumber);
    console.log("=== END DEBUG ===");

    const estimatedTime = calculateEstimatedTime(queuePosition, bookingDate);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serialNumber,
        name: body.name.trim(),
        phone: body.phone.trim(),
        queuePosition: queuePosition,
        bookingDate: bookingDate,
        slotTime,
        estimatedTime,
        status: "PENDING",
      },
    });

    const response: BookingResponse = {
      id: booking.id,
      serialNumber: booking.serialNumber,
      name: booking.name,
      phone: booking.phone,
      queuePosition: booking.queuePosition,
      bookingDate: booking.bookingDate.toISOString(),
      slotTime: booking.slotTime.toISOString(),
      estimatedTime: booking.estimatedTime.toISOString(),
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: response }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
