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

    // If marking as completed, recalculate queue positions for remaining pending bookings
    if (body.status === "COMPLETED" || body.status === "CANCELLED") {
      const pendingBookings = await prisma.booking.findMany({
        where: {
          status: "PENDING",
        },
        orderBy: {
          queuePosition: "asc",
        },
      });

      // Recalculate queue positions
      for (let i = 0; i < pendingBookings.length; i++) {
        const newPosition = i + 1;
        const newEstimatedTime = calculateEstimatedTime(newPosition);

        await prisma.booking.update({
          where: { id: pendingBookings[i].id },
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

    // Recalculate queue positions for remaining pending bookings
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        queuePosition: "asc",
      },
    });

    for (let i = 0; i < pendingBookings.length; i++) {
      const newPosition = i + 1;
      const newEstimatedTime = calculateEstimatedTime(newPosition);

      await prisma.booking.update({
        where: { id: pendingBookings[i].id },
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
