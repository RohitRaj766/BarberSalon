# Barber Shop Scheduling App

A mobile-first barber shop appointment scheduling web application built with Next.js, TypeScript, and PostgreSQL (Neon).

## Features

### Customer Features
- Book haircut appointments without authentication
- View queue position and estimated wait time
- Real-time queue updates
- Simple, mobile-friendly booking form

### Admin Features
- Secure login with username/password
- View all scheduled appointments
- Mark appointments as completed
- Delete or cancel bookings
- Real-time queue management
- Live queue position updates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (mobile-first)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT-based admin auth
- **State Management**: React Hooks

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository and install dependencies:
```bash
cd barber-shop
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="your-neon-postgresql-url"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
JWT_SECRET="your-secret-key-change-in-production"
```

3. Push the database schema:
```bash
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
barber-shop/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── book/route.ts
│   │   │   ├── booking/[id]/route.ts
│   │   │   └── queue/route.ts
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── status/[id]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLoginForm.tsx
│   │   ├── BookingConfirmation.tsx
│   │   ├── BookingForm.tsx
│   │   └── QueueDisplay.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
└── public/
```

## API Routes

### Public Routes
- `POST /api/book` - Create a new booking
- `GET /api/queue` - Get all bookings in queue
- `GET /api/booking/[id]` - Get specific booking details

### Admin Routes
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `PATCH /api/booking/[id]` - Update booking status
- `DELETE /api/booking/[id]` - Delete booking

## Scheduling Logic

- Each appointment slot is **18 minutes**
- Bookings are sequential (queue-based)
- Estimated time = Opening time (9 AM) + (Queue Position × 18 minutes)
- When a booking is completed/deleted, queue positions are automatically recalculated

## Type Safety

All code is strictly typed with TypeScript. No `any` types are used anywhere in the codebase:
- API responses are fully typed
- Database models are strongly typed
- Component props have explicit types
- All functions have return type annotations

## Deployment

The app is ready for deployment on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Default Credentials

For development:
- **Username**: admin
- **Password**: admin123

Change these in production via environment variables.

## Mobile-First Design

The app is optimized for mobile devices with:
- Responsive Tailwind CSS layout
- Touch-friendly buttons and inputs
- Minimal UI with no unnecessary animations
- Fast loading times

## License

MIT
