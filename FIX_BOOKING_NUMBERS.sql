-- SQL Script to Fix Booking Numbers
-- This script recalculates booking numbers based on booking date
-- Run this after implementing date-based counters

-- Step 1: Create a temporary table with correct booking numbers
WITH RankedBookings AS (
  SELECT 
    id,
    "bookingDate",
    ROW_NUMBER() OVER (
      PARTITION BY DATE("bookingDate") 
      ORDER BY "createdAt" ASC
    ) as new_serial_number
  FROM "Booking"
)
-- Step 2: Update the serialNumber for each booking
UPDATE "Booking"
SET "serialNumber" = RankedBookings.new_serial_number
FROM RankedBookings
WHERE "Booking".id = RankedBookings.id;

-- Step 3: Verify the results
SELECT 
  "serialNumber",
  "name",
  "bookingDate",
  "slotTime",
  "createdAt"
FROM "Booking"
ORDER BY "bookingDate" ASC, "serialNumber" ASC;

-- Note: This will recalculate all booking numbers based on creation order per day
-- Feb 4 bookings will be numbered 1, 2, 3...
-- Feb 5 bookings will be numbered 1, 2, 3...
