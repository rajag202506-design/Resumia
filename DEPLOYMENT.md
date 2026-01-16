# Resumia Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub account with access to this repository
2. PostgreSQL database (we'll use Vercel Postgres or Neon)
3. OpenAI API key
4. RapidAPI key for job search

### Step 1: Set Up Database
You need a PostgreSQL database for production. Choose one:

#### Option A: Vercel Postgres (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Create a new project but DON'T deploy yet
4. Go to Storage tab → Create Database → Postgres
5. Copy the `DATABASE_URL` connection string

#### Option B: Neon (Free PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string

### Step 2: Deploy to Vercel

1. **Import Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `rajag202506-design/Resumia` from GitHub

2. **Configure Environment Variables**
   Click "Environment Variables" and add these:

   ```
   DATABASE_URL=postgresql://your-db-connection-string
   JWT_SECRET=your-secure-random-string-here
   OPENAI_API_KEY=sk-proj-your-openai-key
   USE_RAPIDAPI=true
   RAPIDAPI_KEY=your-rapidapi-key
   USE_MOCK_JOBS=false
   NEXTAUTH_URL=https://your-app-name.vercel.app
   NEXTAUTH_SECRET=your-nextauth-secret
   NODE_ENV=production
   ```

   **Optional (for Google Jobs API):**
   ```
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

3. **Build Settings**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npx prisma generate && next build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment

### Step 3: Run Database Migrations

After first deployment:
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Verify `DATABASE_URL` is set
4. Go to Deployments tab
5. Click on the latest deployment → "..." menu → "Redeploy"
6. Check the build logs to ensure Prisma migrations run

Alternatively, run migrations locally:
```bash
cd resumia
npx prisma migrate deploy
```

### Step 4: Test Your Deployment

1. Visit your deployed URL: `https://your-app-name.vercel.app`
2. Try creating an account
3. Test resume upload
4. Test job search

## 🔧 Troubleshooting

### Database Connection Issues
- Make sure `DATABASE_URL` includes `?sslmode=require` for production databases
- Example: `postgresql://user:pass@host:5432/db?sslmode=require`

### Build Failures
- Check Vercel build logs
- Ensure all environment variables are set
- Verify `npx prisma generate` runs successfully

### API Key Issues
- Verify OpenAI API key is valid and has credits
- Check RapidAPI key has available quota
- Set `USE_MOCK_JOBS=true` temporarily to test without real APIs

## 📱 Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Import from GitHub
3. Build command: `npx prisma generate && npm run build`
4. Publish directory: `.next`
5. Add same environment variables as above

## 🐳 Alternative: Deploy with Docker

```bash
# Build
docker build -t resumia .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL=your-db-url \
  -e OPENAI_API_KEY=your-key \
  resumia
```

## 🔐 Security Notes

- Never commit `.env` or `.env.local` files
- Rotate API keys regularly
- Use strong JWT secrets (min 32 characters)
- Enable 2FA on all service accounts

## 📊 Monitoring

- Check Vercel Analytics for traffic
- Monitor OpenAI API usage
- Set up error tracking (Sentry recommended)

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
