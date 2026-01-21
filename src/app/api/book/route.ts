import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateEstimatedTime, validateName, validatePhoneNumber } from "@/lib/utils";
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

    // Validate booking date - parse the date string correctly
    // The date comes as "YYYY-MM-DD" string, we need to parse it in local timezone
    const [year, month, day] = body.bookingDate.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day); // month is 0-indexed
    bookingDate.setHours(0, 0, 0, 0);
    
    // Check if date is today or tomorrow (actual system dates)
    const actualToday = new Date();
    actualToday.setHours(0, 0, 0, 0);
    
    const actualTomorrow = new Date();
    actualTomorrow.setDate(actualToday.getDate() + 1);
    actualTomorrow.setHours(0, 0, 0, 0);
    
    const isValidDate = bookingDate.getTime() === actualToday.getTime() || 
                        bookingDate.getTime() === actualTomorrow.getTime();
    
    // Debug logs
    console.log("=== DATE VALIDATION DEBUG ===");
    console.log("Received bookingDate string:", body.bookingDate);
    console.log("Parsed bookingDate:", bookingDate.toISOString(), "| Local:", bookingDate.toString());
    console.log("bookingDate timestamp:", bookingDate.getTime());
    console.log("actualToday:", actualToday.toISOString(), "| Local:", actualToday.toString());
    console.log("actualToday timestamp:", actualToday.getTime());
    console.log("actualTomorrow:", actualTomorrow.toISOString(), "| Local:", actualTomorrow.toString());
    console.log("actualTomorrow timestamp:", actualTomorrow.getTime());
    console.log("isValidDate:", isValidDate);
    console.log("=== END DEBUG ===");
    
    if (!isValidDate) {
      return NextResponse.json(
        { success: false, error: "Can only book for today or tomorrow" },
        { status: 400 }
      );
    }

    // Validate slot time
    const slotTime = new Date(`${body.bookingDate}T${body.slotTime}:00`);
    if (isNaN(slotTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid slot time" },
        { status: 400 }
      );
    }

    // Check if slot time is in the past (only for today)
    const now = new Date();
    const isTodayBooking = bookingDate.getTime() === actualToday.getTime();
    if (isTodayBooking && slotTime < now) {
      return NextResponse.json(
        { success: false, error: "Cannot book slots in the past" },
        { status: 400 }
      );
    }

    // Create date range for queries
    const startOfDay = new Date(bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

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

    // Get or create counter for serial numbers
    let counter = await prisma.counter.findUnique({
      where: { id: "booking_counter" },
    });

    if (!counter) {
      counter = await prisma.counter.create({
        data: { id: "booking_counter", value: 0 },
      });
    }

    // Increment counter and get next serial number
    const updatedCounter = await prisma.counter.update({
      where: { id: "booking_counter" },
      data: { value: { increment: 1 } },
    });

    const serialNumber = updatedCounter.value;

    // Get the next queue position for this date
    const lastBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["PENDING", "COMPLETED"] },
      },
      orderBy: {
        queuePosition: "desc",
      },
    });

    const nextQueuePosition = (lastBooking?.queuePosition || 0) + 1;
    const estimatedTime = calculateEstimatedTime(nextQueuePosition, bookingDate);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        serialNumber,
        name: body.name.trim(),
        phone: body.phone.trim(),
        queuePosition: nextQueuePosition,
        bookingDate: startOfDay,
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
