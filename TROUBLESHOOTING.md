# Troubleshooting Guide

## Failed to Load Slots / Queue

### Issue
Getting "Failed to load slots" or "Failed to load queue" errors

### Root Causes & Solutions

#### 1. Database Connection Issues
**Symptoms**: API returns 500 error

**Check**:
```bash
# Verify DATABASE_URL in .env
echo $env:DATABASE_URL

# Test connection
npx prisma db execute --stdin < /dev/null
```

**Fix**:
- Verify Neon connection string is correct
- Check IP whitelist in Neon dashboard
- Ensure SSL mode is enabled

#### 2. Missing Database Tables
**Symptoms**: "relation does not exist" error

**Fix**:
```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

#### 3. Date Mutation Issues (FIXED)
**Symptoms**: Queries return empty results

**What was wrong**:
```typescript
// ❌ WRONG - mutates date object
new Date(date.setHours(0, 0, 0, 0))

// ✅ CORRECT - creates new date
const startOfDay = new Date(date);
startOfDay.setHours(0, 0, 0, 0);
```

**Status**: ✅ Fixed in latest version

#### 4. API Route Not Found
**Symptoms**: 404 errors on `/api/slots` or `/api/queue`

**Check**:
- File exists: `src/app/api/slots/route.ts`
- File exists: `src/app/api/queue/route.ts`
- Rebuild: `npm run build`

#### 5. CORS Issues
**Symptoms**: Network error in browser console

**Check**:
- Are you accessing from same origin?
- Check browser console for CORS errors
- Verify API is running on same port

### Testing API Endpoints

#### Test Slots API
```bash
curl http://localhost:3000/api/slots
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-01-21",
      "slots": [
        {
          "time": "08:00",
          "available": true,
          "bookedCount": 0
        }
      ]
    }
  ]
}
```

#### Test Queue API
```bash
curl http://localhost:3000/api/queue
```

Expected response:
```json
{
  "success": true,
  "data": {
    "bookings": [],
    "totalCount": 0
  }
}
```

### Browser Console Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Look for failed requests to `/api/slots` or `/api/queue`
5. Click on request and check:
   - Status code (should be 200)
   - Response tab (check error message)
   - Headers (check Content-Type)

### Common Error Messages

#### "Failed to fetch available slots"
- Database connection failed
- Query error in slots API
- Check server logs

#### "Failed to fetch queue"
- Database connection failed
- Query error in queue API
- Check server logs

#### "Can only book for today or tomorrow"
- Date validation failed
- Check system date/time
- Verify date format (YYYY-MM-DD)

#### "Invalid slot time"
- Time format incorrect
- Should be HH:MM format
- Check slot time parsing

### Server Logs

Check for errors:
```bash
# Development
npm run dev
# Look for errors in terminal

# Production
# Check Vercel logs in dashboard
```

### Step-by-Step Debug

1. **Check Database**
   ```bash
   npx prisma studio
   # Opens Prisma Studio to view database
   ```

2. **Check API Response**
   ```bash
   curl -v http://localhost:3000/api/slots
   # Check status code and response
   ```

3. **Check Component Logs**
   - Open browser DevTools
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Check Environment Variables**
   ```bash
   # Verify .env.local exists
   cat .env.local
   
   # Verify DATABASE_URL is set
   echo $env:DATABASE_URL
   ```

5. **Rebuild and Restart**
   ```bash
   npm run build
   npm run dev
   ```

### If Still Not Working

1. **Clear Cache**
   ```bash
   rm -r .next
   npm run build
   ```

2. **Reinstall Dependencies**
   ```bash
   rm -r node_modules
   npm install
   npm run build
   ```

3. **Reset Database**
   ```bash
   # WARNING: This deletes all data
   npx prisma db push --force-reset
   ```

4. **Check Logs**
   - Development: Terminal output
   - Production: Vercel dashboard logs

### Getting Help

Include these details:
1. Error message (exact text)
2. Browser console errors
3. Network tab response
4. Database connection string (without password)
5. Environment variables (without secrets)
6. Steps to reproduce

### Quick Checklist

- [ ] Database URL is correct
- [ ] Database tables exist (`npx prisma db push`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] API routes exist in correct location
- [ ] Build succeeds (`npm run build`)
- [ ] Dev server running (`npm run dev`)
- [ ] Accessing correct URL (http://localhost:3000)
- [ ] No CORS errors in console
- [ ] Network requests show 200 status
- [ ] Response JSON is valid

### Performance Tips

- Slots API: ~50ms (40 slots per day)
- Queue API: ~100ms (depends on booking count)
- If slow, check database indexes

### Security Notes

- Never commit `.env` files
- Use environment variables for secrets
- Validate all inputs
- Use HTTPS in production
- Keep dependencies updated
