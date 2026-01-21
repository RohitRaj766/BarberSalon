# Deployment Guide

## Deploy to Vercel

### Prerequisites
- GitHub account with the repository pushed
- Neon PostgreSQL database
- Vercel account

### Steps

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `barber-shop` directory as root

3. **Set Environment Variables**:
   In Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=your-neon-postgresql-url
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   JWT_SECRET=your-random-secret-key
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Post-Deployment

1. **Verify database connection**:
   - Check Vercel logs for any connection errors
   - Test the booking endpoint

2. **Update admin credentials**:
   - Change `ADMIN_PASSWORD` to a strong password
   - Update `JWT_SECRET` to a random string

3. **Test all features**:
   - Create a test booking
   - Login to admin panel
   - Mark booking as completed
   - Verify queue updates

---

## Environment Variables for Production

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Admin credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-very-secure-password-here

# JWT secret (generate a random string)
JWT_SECRET=your-random-secret-key-min-32-chars

# Optional: Next.js
NODE_ENV=production
```

---

## Database Backups

With Neon, backups are automatic. To export data:

1. Go to Neon dashboard
2. Select your project
3. Use Neon's export tools or connect with pgAdmin

---

## Monitoring

### Vercel Analytics
- Monitor performance in Vercel dashboard
- Check build times and deployment history

### Database Monitoring
- Use Neon dashboard to monitor connections
- Check query performance

### Error Tracking
- Enable Vercel error tracking
- Monitor API errors in logs

---

## Scaling

### Database
- Neon automatically scales compute
- Monitor connection pool usage
- Upgrade plan if needed

### Application
- Vercel automatically scales serverless functions
- No additional configuration needed

---

## Security Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set up database backups
- [ ] Monitor admin login attempts
- [ ] Keep dependencies updated
- [ ] Review API rate limiting needs
- [ ] Set up error monitoring

---

## Troubleshooting

### Build fails
- Check Node.js version (18+)
- Verify all environment variables are set
- Check Vercel logs for specific errors

### Database connection fails
- Verify DATABASE_URL is correct
- Check IP whitelist in Neon
- Ensure SSL mode is enabled

### Admin login not working
- Clear browser cookies
- Verify ADMIN_USERNAME and ADMIN_PASSWORD
- Check JWT_SECRET is set

### Slow performance
- Check database query performance
- Monitor Vercel function duration
- Consider caching strategies

---

## Rollback

To rollback to a previous version:
1. Go to Vercel dashboard
2. Select your project
3. Go to "Deployments"
4. Click "Redeploy" on a previous deployment

---

## Custom Domain

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatic

---

## CI/CD

Vercel automatically deploys on:
- Push to main branch
- Pull request (preview deployment)

To disable auto-deploy:
1. Go to "Settings" → "Git"
2. Disable "Deploy on push"

---

## Support

- Vercel docs: https://vercel.com/docs
- Neon docs: https://neon.tech/docs
- Next.js docs: https://nextjs.org/docs
