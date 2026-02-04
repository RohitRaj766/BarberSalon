# Quick Fix for Booking Numbers

## Problem
Old bookings have sequential numbers (1, 2, 3...) across all dates instead of resetting per day.

## Solution Options

### Option 1: Fix Existing Bookings (Recommended)
Run this SQL to recalculate all booking numbers:

```sql
-- Recalculate booking numbers per day
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
UPDATE "Booking"
SET "serialNumber" = RankedBookings.new_serial_number
FROM RankedBookings
WHERE "Booking".id = RankedBookings.id;
```

### Option 2: Delete Old Bookings (Quick)
If these are test bookings, just delete them:

```sql
-- Delete all bookings
DELETE FROM "Booking";

-- Delete old counter
DELETE FROM "Counter" WHERE id = 'booking_counter';
```

Then create new bookings - they will have correct numbers.

### Option 3: Manual Fix via Prisma Studio
1. Open Prisma Studio: `npx prisma studio`
2. Go to Booking table
3. Manually update serialNumber:
   - Feb 4 booking: Change to 1
   - Feb 5 booking: Change to 1

## How It Should Work

After the fix:
- **Feb 4, 2026**: First booking = #1, Second = #2, Third = #3
- **Feb 5, 2026**: First booking = #1, Second = #2, Third = #3
- **Feb 6, 2026**: First booking = #1, Second = #2, Third = #3

Each day starts fresh at #1.

## Verify It's Working

Create a new booking and check:
1. The counter ID should be like `booking_counter_20260204`
2. The serial number should be 1 (if first booking of that day)
3. Check the console logs for "SERIAL NUMBER DEBUG"

## Database Access

### Via Neon Console
1. Go to https://console.neon.tech
2. Select your project
3. Open SQL Editor
4. Run the SQL from Option 1 or 2

### Via Prisma Studio
```bash
npx prisma studio
```

### Via Command Line
```bash
psql $DATABASE_URL
```

Then paste the SQL commands.
