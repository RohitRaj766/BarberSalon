# Barber Shop Queue Management System

A modern, real-time queue management system for barber shops built with Next.js, TypeScript, and PostgreSQL.

## 🎯 Features

### Customer Features
- **Easy Booking**: Book appointments without authentication
- **Dual Numbering**: Booking number (daily sequential) + Slot number (time-based)
- **Live Queue Display**: Real-time queue with table view and filters
- **Search & Filter**: Search by name, booking/slot number, filter by status
- **Pagination**: Adjustable rows per page (5/10/50)
- **Manual Refresh**: On-demand data refresh (no auto-polling)
- **Mobile Responsive**: Optimized table view for all screen sizes

### Admin Features
- **Secure Dashboard**: JWT-based authentication
- **Complete Management**: Mark complete, delete bookings
- **Quick Actions**: One-click call button for each customer
- **Advanced Filters**: Search, status filter, pagination
- **Real-time Stats**: Pending and completed counts
- **Manual Refresh**: Control when to fetch new data

### Technical Features
- **UTC Timezone**: All operations in UTC for consistency
- **Daily Reset**: Booking numbers reset at midnight UTC
- **Time Slots**: 18-minute slots from 08:00 to 20:00 (40 slots/day)
- **2-Day Window**: Book for today or tomorrow only
- **Modern UI**: Glassmorphism design with gradients and animations

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS 4
- **Auth**: JWT with HTTP-only cookies
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd barber-shop
npm install
```

2. **Set up environment variables**
Create `.env` file:
```env
DATABASE_URL="your-postgresql-url"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-password"
JWT_SECRET="your-secret-key"
```

3. **Initialize database**
```bash
npx prisma db push
```

4. **Run development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app is production-ready with:
- Prisma generation in build script
- Binary targets for Vercel
- Optimized static and dynamic rendering

## 📊 Database Schema

### Booking
- Dual numbering: `serialNumber` (daily) + `queuePosition` (slot-based)
- UTC timestamps for all dates
- Status: PENDING, COMPLETED, CANCELLED
- Indexed fields for fast queries

### Counter
- Date-based format: `booking_counter_YYYYMMDD`
- Auto-increments per day
- Resets at midnight UTC

## 🎨 UI/UX Highlights

- **Glassmorphism**: Modern blur effects and gradients
- **Responsive Tables**: Works on all screen sizes
- **Smart Pagination**: First/Prev/Page Numbers/Next/Last
- **Visual Feedback**: Loading states, hover effects, animations
- **Accessibility**: Semantic HTML, clear hierarchy

## 📱 Pages

- `/` - Customer booking form
- `/queue` - Public queue display
- `/status/[id]` - Booking status tracking
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Admin management panel

## 🔐 Default Credentials

**Development only:**
- Username: `admin`
- Password: Set in `.env`

**Change these in production!**

## 📝 API Routes

### Public
- `POST /api/book` - Create booking
- `GET /api/queue` - Get queue
- `GET /api/slots` - Get available slots
- `GET /api/booking/[id]` - Get booking details

### Admin
- `POST /api/admin/login` - Login
- `POST /api/admin/logout` - Logout
- `PATCH /api/booking/[id]` - Update status
- `DELETE /api/booking/[id]` - Delete booking

## 🎯 Key Concepts

### Booking Numbers
- **Booking #**: Sequential per day (1, 2, 3... resets daily)
- **Slot #**: Based on time (Slot 1 = 08:00, Slot 34 = 18:00)

### Time Management
- All operations in UTC
- 18-minute slots
- 40 slots per day (08:00 - 20:00)
- 2-day booking window

### Queue Display
- Shows today and tomorrow only
- Filters: Search, status, rows per page
- Manual refresh (no auto-polling)
- Table view on all devices

## 📄 License

MIT

---

Built with ❤️ for modern barber shops
