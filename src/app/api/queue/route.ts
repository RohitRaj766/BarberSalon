import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { ApiResponse, QueueResponse, BookingResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<QueueResponse>>> {
  try {
    // Check if user is admin
    const isAdmin = await getAdminFromCookie();

    // Get all bookings (don't filter by date to show everything)
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "COMPLETED"] },
      },
      orderBy: [
        { bookingDate: "asc" },
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
