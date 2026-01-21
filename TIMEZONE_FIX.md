# 🌍 Timezone Fix for Vercel

## Problem
Your Vercel deployment is using UTC time, but your business operates in IST (Indian Standard Time). This causes past slots to appear because:

- **Current time in India:** 7:32 PM IST (19:32)
- **Current time on Vercel:** 2:02 PM UTC (14:02)
- **Result:** Slots from 2:18 PM UTC onwards are shown (which is 7:48 PM IST)

## Solution

### Option 1: Add TZ Environment Variable (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `TZ`
   - **Value:** `Asia/Kolkata`
   - **Environment:** Production, Preview, Development (select all)
4. Click **Save**
5. **Redeploy** your application (Vercel → Deployments → Click "..." → Redeploy)

### Option 2: Use UTC Offset in Code

If Option 1 doesn't work, we can calculate IST time manually in the code.

## Verification

After adding the TZ variable and redeploying:

1. Check the logs again - you should see:
   ```
   Current time (now): 2026-01-21T14:02:44.917Z | Local: Wed Jan 21 2026 19:32:44 GMT+0530 (India Standard Time)
   ```

2. The slot filtering should now work correctly:
   - Current time: 7:32 PM IST
   - Slots before 7:32 PM should be hidden
   - Slots from 7:48 PM onwards should be visible

## Quick Test

After deploying, try booking at different times:
- **Morning (9 AM IST):** Should show slots from 9:12 AM onwards
- **Afternoon (2 PM IST):** Should show slots from 2:18 PM onwards  
- **Evening (7 PM IST):** Should show slots from 7:18 PM onwards

## Alternative: Use IST Offset Directly

If the TZ variable doesn't work on Vercel, I can update the code to manually add +5:30 offset to all time calculations.

Let me know if you need help with this approach!
