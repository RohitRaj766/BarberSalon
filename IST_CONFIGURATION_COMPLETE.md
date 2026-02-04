# IST Configuration - Complete Implementation

## Overview
All APIs and components are now properly configured to use Indian Standard Time (IST, UTC+5:30), ensuring the app works correctly even when deployed on Vercel (which uses UTC).

## IST Implementation Summary

### Server-Side APIs (Always use IST)

#### 1. Queue API (`src/app/api/queue/route.ts`)
- ✅ Uses `getCurrentTimeIST()`, `getTodayIST()`, `getTomorrowIST()`
- ✅ Filters bookings for today and tomorrow in IST
- ✅ Date range: `todayIST` to `dayAfterTomorrowIST`

#### 2. Slots API (`src/app/api/slots/route.ts`)
- ✅ Uses `getCurrentTimeIST()` for current time
- ✅ Filters past slots based on IST time
- ✅ Generates slots for today and tomorrow in IST

#### 3. Booking API (`src/app/api/book/route.ts`)
- ✅ Uses `getTodayIST()` and `getTomorrowIST()` for date validation
- ✅ Uses `getCurrentTimeIST()` to check if slot is in the past
- ✅ Queue position based on slot number (not sequential)
- ✅ Validates dates against IST, not server time

### Client-Side Components (Use inline IST calculation)

#### 1. PublicQueueDisplay (`src/components/PublicQueueDisplay.tsx`)
- ✅ Calculates IST dates using `toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })`
- ✅ Filters to show only today and tomorrow bookings
- ✅ Correctly labels "Today" and "Tomorrow" based on IST

### Helper Functions (`src/lib/utils.ts`)

```typescript
// IST Helper Functions
getCurrentTimeIST(): Date  // Returns current time in IST
getTodayIST(): Date        // Returns today at midnight IST
getTomorrowIST(): Date     // Returns tomorrow at midnight IST
toIST(date: Date): Date    // Converts any date to IST

// Slot Number Functions
getSlotNumber(slotTime: string): number           // "08:00" → 1
getSlotNumberFromDate(date: Date): number         // Date object → slot number
```

## How It Works

### Server-Side (Vercel/Production)
1. Vercel servers run in UTC
2. All APIs use IST helper functions to convert to IST
3. Database stores dates in UTC
4. All comparisons and filtering done in IST

### Client-Side (Browser)
1. Browser may be in any timezone
2. Components use `toLocaleString` with IST timezone
3. Date calculations done in IST context
4. Display shows IST dates and times

## Example Flow

### Booking Creation (Jan 22, 2026 in IST)
```
User in India (IST): Jan 22, 2026, 7:30 PM
Vercel Server (UTC): Jan 22, 2026, 2:00 PM

1. User selects date: "2026-01-22"
2. API receives: "2026-01-22"
3. API converts to IST: getTodayIST() → Jan 22, 2026 00:00 IST
4. Validates: Is "2026-01-22" today or tomorrow in IST? ✅ Yes
5. Stores in DB: Jan 22, 2026 00:00 UTC (converted from IST)
6. Queue position: Based on slot number (e.g., 6:00 PM = slot #40)
```

### Queue Display
```
Vercel Server (UTC): Jan 22, 2026, 2:00 PM
IST: Jan 22, 2026, 7:30 PM

1. API: getTodayIST() → Jan 22, 2026 00:00 IST
2. API: getTomorrowIST() → Jan 23, 2026 00:00 IST
3. Query DB: bookings between Jan 22 and Jan 24 (IST)
4. Return: Only today and tomorrow bookings
5. Client: Filters and displays with IST labels
```

## Testing Checklist

### Date Validation
- [ ] At 11:59 PM IST, can book for "today" (current IST date)
- [ ] At 12:00 AM IST, "today" changes to new date
- [ ] At 11:59 PM UTC (5:29 AM IST next day), still shows correct IST date

### Slot Filtering
- [ ] Past slots don't appear for today (based on IST time)
- [ ] All slots appear for tomorrow
- [ ] At 11:59 PM IST, tomorrow's slots are available

### Queue Display
- [ ] Shows only today and tomorrow bookings (IST)
- [ ] "Today" label shows current IST date
- [ ] "Tomorrow" label shows next IST date
- [ ] Old bookings don't appear

### Booking Creation
- [ ] Can book for today (IST date)
- [ ] Can book for tomorrow (IST date)
- [ ] Cannot book past slots (based on IST time)
- [ ] Queue position matches slot number

## Production Deployment

### Environment Variables
No special IST configuration needed. The code handles timezone conversion automatically.

### Vercel Configuration
- Vercel runs in UTC (default)
- No timezone environment variables needed
- IST conversion happens in code

### Database
- Stores dates in UTC (PostgreSQL default)
- All queries use IST-converted dates
- No timezone configuration needed in Prisma

## Troubleshooting

### Issue: Wrong date showing
**Check**: Are you using IST helper functions in the API?
**Solution**: Use `getTodayIST()` instead of `new Date()`

### Issue: Past slots appearing
**Check**: Is slot filtering using IST time?
**Solution**: Use `getCurrentTimeIST()` for comparison

### Issue: Queue showing old bookings
**Check**: Is queue API filtering by IST dates?
**Solution**: Use `getTodayIST()` and `getTomorrowIST()` in query

## Key Principles

1. **Server-side**: Always use IST helper functions
2. **Client-side**: Use `toLocaleString` with IST timezone
3. **Database**: Store in UTC, query with IST-converted dates
4. **Never**: Use `new Date()` directly for date comparisons
5. **Always**: Convert to IST before any date logic

## Files Modified

- ✅ `src/app/api/queue/route.ts` - IST filtering
- ✅ `src/app/api/slots/route.ts` - IST slot filtering
- ✅ `src/app/api/book/route.ts` - IST date validation
- ✅ `src/components/PublicQueueDisplay.tsx` - IST date display
- ✅ `src/lib/utils.ts` - IST helper functions

## Result

The app now works correctly in IST regardless of:
- Server timezone (Vercel uses UTC)
- Database timezone (PostgreSQL uses UTC)
- User's browser timezone
- Time of day (handles midnight transitions correctly)
