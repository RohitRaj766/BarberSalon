# Quick Start Guide

## Running Locally

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment** (already configured in `.env`):
```bash
# .env already has your Neon PostgreSQL connection
# Admin credentials are set to:
# Username: admin
# Password: admin123
```

3. **Start development server**:
```bash
npm run dev
```

4. **Access the app**:
- Customer booking: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## Testing the App

### Customer Flow
1. Go to http://localhost:3000
2. Enter your name and phone number
3. Click "Book Appointment"
4. You'll see your booking confirmation with queue position
5. Click "View Queue Status" to see real-time updates

### Admin Flow
1. Go to http://localhost:3000/admin/login
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. View all pending bookings
4. Click "Done" to mark appointment as completed
5. Click "Delete" to cancel a booking
6. Queue positions update automatically

## Key Features

✅ **No authentication for customers** - Just enter name and phone
✅ **Real-time queue updates** - Polls every 3-5 seconds
✅ **Automatic queue recalculation** - When bookings are completed/deleted
✅ **Mobile-first design** - Optimized for all screen sizes
✅ **Fully typed TypeScript** - No `any` types anywhere
✅ **Production ready** - Can deploy to Vercel immediately

## Database

Connected to Neon PostgreSQL. Schema includes:
- `Booking` table with queue positions and estimated times
- `Admin` table for authentication
- Automatic timestamps and indexes

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Update `.env` to change:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `JWT_SECRET` - Secret for JWT tokens (change in production)

## Troubleshooting

**Database connection issues?**
- Verify your Neon connection string in `.env`
- Check that your IP is whitelisted in Neon

**Admin login not working?**
- Clear browser cookies
- Check credentials in `.env`

**Queue not updating?**
- Refresh the page
- Check browser console for errors
