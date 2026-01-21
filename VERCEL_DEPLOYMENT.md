# 🚀 Vercel Deployment Guide

## Prerequisites
- A Neon PostgreSQL database (you already have one!)
- A Vercel account

## Step-by-Step Deployment

### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables
In Vercel project settings, add these environment variables:

**Required Variables:**
```
DATABASE_URL=postgresql://neondb_owner:npg_9SQvjdXnP5hU@ep-patient-paper-ah2t1rbo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://neondb_owner:npg_9SQvjdXnP5hU@ep-patient-paper-ah2t1rbo.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

ADMIN_USERNAME=admin

ADMIN_PASSWORD=admin#chotu@123

JWT_SECRET=your-secret-key-change-in-production-chotu

NEXT_PUBLIC_OPENING_TIME=08:00

NEXT_PUBLIC_CLOSING_TIME=20:00

SLOT_DURATION_MINUTES=18
```

**Important Notes:**
- `DATABASE_URL` uses the **pooler** endpoint (for serverless functions)
- `DIRECT_URL` uses the **direct** endpoint (for migrations)
- Change `JWT_SECRET` to a strong random string in production!
- Change `ADMIN_PASSWORD` to a secure password!

### 4. Deploy
1. Click "Deploy"
2. Vercel will:
   - Install dependencies
   - Run `prisma generate`
   - Build your Next.js app
   - Deploy to production

### 5. Run Database Migrations (First Time Only)
After first deployment, you need to run migrations:

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel env pull .env.production
npx prisma migrate deploy
```

**Option B: Using Neon Console**
1. Go to your Neon dashboard
2. Open SQL Editor
3. Run the migration SQL manually (from `prisma/migrations` folder)

**Option C: Add to Build Command (Recommended)**
In Vercel project settings:
- Build Command: `prisma migrate deploy && npm run build`
- This will run migrations automatically on each deploy

### 6. Create Admin User (First Time Only)
After deployment, you need to create the admin user:

1. Go to your deployed site: `https://your-app.vercel.app`
2. The app will automatically create the admin user on first API call
3. Login with your `ADMIN_USERNAME` and `ADMIN_PASSWORD`

## Troubleshooting

### Build Fails with Prisma Error
**Solution:** Make sure all environment variables are set in Vercel

### Database Connection Error
**Solution:** 
- Check that `DATABASE_URL` is correct
- Ensure Neon database is active (not paused)
- Verify SSL mode is set correctly

### Admin Login Not Working
**Solution:**
- Check `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Vercel env vars
- Make sure `JWT_SECRET` is set
- Try accessing `/api/admin/login` directly to see error

### Migrations Not Applied
**Solution:**
```bash
# Connect to your production database
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

## Post-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database migrations are applied
- [ ] Admin user can login
- [ ] Test booking creation
- [ ] Test queue display
- [ ] Test admin dashboard
- [ ] Change default passwords!
- [ ] Update JWT_SECRET to a strong random value

## Security Recommendations

1. **Change Default Credentials:**
   ```
   ADMIN_PASSWORD=<strong-unique-password>
   JWT_SECRET=<random-64-character-string>
   ```

2. **Enable Neon IP Allowlist** (optional):
   - Go to Neon dashboard
   - Add Vercel's IP ranges

3. **Set up Custom Domain:**
   - In Vercel project settings
   - Add your custom domain
   - Update DNS records

## Monitoring

- **Vercel Dashboard:** Monitor deployments and errors
- **Neon Dashboard:** Monitor database usage and queries
- **Vercel Logs:** Check function logs for errors

## Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Vercel will automatically deploy!
```

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
