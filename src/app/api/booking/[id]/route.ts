import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateEstimatedTime } from "@/lib/utils";
import { ApiResponse, BookingResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BookingResponse>>> {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    console.error("Booking fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<BookingResponse>>> {
  try {
    const { id } = await params;
    const body: { status: string } = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: body.status as "PENDING" | "COMPLETED" | "CANCELLED" },
    });

    // If marking as completed, recalculate queue positions for remaining bookings on the same date
    if (body.status === "COMPLETED" || body.status === "CANCELLED") {
      // Get the booking date range
      const startOfDay = new Date(booking.bookingDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(booking.bookingDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all bookings for this date ordered by slot time
      const dateBookings = await prisma.booking.findMany({
        where: {
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: { in: ["PENDING", "COMPLETED"] },
        },
        orderBy: {
          slotTime: "asc", // Order by slot time
        },
      });

      // Recalculate queue positions based on slot time order
      for (let i = 0; i < dateBookings.length; i++) {
        const newPosition = i + 1;
        const newEstimatedTime = calculateEstimatedTime(newPosition, dateBookings[i].bookingDate);

        await prisma.booking.update({
          where: { id: dateBookings[i].id },
          data: {
            queuePosition: newPosition,
            estimatedTime: newEstimatedTime,
          },
        });
      }
    }

    const response: BookingResponse = {
      id: updatedBooking.id,
      serialNumber: updatedBooking.serialNumber,
      name: updatedBooking.name,
      phone: updatedBooking.phone,
      queuePosition: updatedBooking.queuePosition,
      bookingDate: updatedBooking.bookingDate.toISOString(),
      slotTime: updatedBooking.slotTime.toISOString(),
      estimatedTime: updatedBooking.estimatedTime.toISOString(),
      status: updatedBooking.status,
      createdAt: updatedBooking.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, data: response }, { status: 200 });
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Delete the booking
    await prisma.booking.delete({
      where: { id },
    });

    // Recalculate queue positions for remaining bookings on the same date
    // Get the booking date range
    const startOfDay = new Date(booking.bookingDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(booking.bookingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings for this date ordered by slot time
    const dateBookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { in: ["PENDING", "COMPLETED"] },
      },
      orderBy: {
        slotTime: "asc", // Order by slot time
      },
    });

    // Recalculate queue positions based on slot time order
    for (let i = 0; i < dateBookings.length; i++) {
      const newPosition = i + 1;
      const newEstimatedTime = calculateEstimatedTime(newPosition, dateBookings[i].bookingDate);

      await prisma.booking.update({
        where: { id: dateBookings[i].id },
        data: {
          queuePosition: newPosition,
          estimatedTime: newEstimatedTime,
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Booking delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
