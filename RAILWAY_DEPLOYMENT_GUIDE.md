# Railway Deployment Guide - Complete Resumia Project

## 🚀 Complete Deployment Steps

### Prerequisites
- GitHub repository: `rajag202506-design/Resumia`
- Railway account
- PostgreSQL database on Railway

---

## 📋 Step 1: Push Latest Code to GitHub

```bash
cd "c:\Users\hp\Documents\Hashim (FYP)\code\resumia"
git add -A
git commit -m "Final deployment ready"
git push origin main
```

✅ **DONE** - All code pushed to GitHub

---

## 🗄️ Step 2: Railway PostgreSQL Database

### Create Database (if not exists):
1. Go to Railway Dashboard
2. Click "New Project" → "Provision PostgreSQL"
3. Note the connection details

### Get Database URL:
1. Click on PostgreSQL service
2. Go to "Variables" tab
3. Copy `DATABASE_URL`

Format: `postgresql://user:password@host:port/database`

---

## 🌐 Step 3: Deploy Main Application

### Create New Service:
1. Railway Dashboard → "New Service"
2. Select "GitHub Repo"
3. Choose `rajag202506-design/Resumia`
4. Branch: `main`
5. Root Directory: `/` (default)

### Configure Build:
Railway will auto-detect `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
```

---

## ⚙️ Step 4: Set Environment Variables

Go to your service → **Variables** tab → Add these:

### Database:
```env
DATABASE_URL=<from PostgreSQL service>
```

### Authentication:
```env
JWT_SECRET=resumiaApp2024SecretKeyForJWTTokens!@#$%^&*()_+ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789

NEXTAUTH_URL=<your-railway-url>
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### OpenAI API:
```env
OPENAI_API_KEY=<your-openai-api-key-from-platform.openai.com>
```

### Job Search (Web Crawler):
```env
USE_WEBCRAWLER=false
USE_RAPIDAPI=true
RAPIDAPI_KEY=<your-rapidapi-key-from-rapidapi.com>
USE_MOCK_JOBS=false
```

**Note:** Set `USE_WEBCRAWLER=false` on Railway because:
- Web crawler needs Chromium (heavy memory)
- Railway free tier has limited resources
- RapidAPI is faster and more reliable for production

### Next.js:
```env
NODE_ENV=production
```

---

## 🗃️ Step 5: Run Database Migrations

After deployment, run migrations:

### Option A: Using Railway CLI
```bash
railway login
railway link
railway run npx prisma migrate deploy
```

### Option B: Using Railway Dashboard
1. Go to your service
2. Click "Deployments" → Latest deployment
3. Click "View Logs"
4. The migrations should run automatically during build

---

## 🧪 Step 6: Verify Deployment

### Check Deployment Status:
1. Railway Dashboard → Your Service
2. Wait for "Deployed" status (green)
3. Click on the generated URL

### Test Endpoints:

**Homepage:**
```
https://your-app.railway.app/
```

**Health Check:**
```
https://your-app.railway.app/api/health
```

**Job Search API:**
```
https://your-app.railway.app/api/jobs/search?query=software+engineer&location=Pakistan
```

**Resume Analysis API:**
```
POST https://your-app.railway.app/api/analyze-resume-ml
```

---

## 📝 Step 7: Database Setup (First Time Only)

### Create Tables:
The tables should be created automatically via Prisma migrations.

If not, you can manually create them:

1. Go to PostgreSQL service → "Data" tab
2. Run SQL:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS "Resume" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "User"("id") ON DELETE CASCADE,
  "fileName" VARCHAR(255) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileSize" INTEGER,
  "mimeType" VARCHAR(100),
  "parsedData" TEXT,
  "ml_analysis" TEXT,
  "ml_score" DECIMAL(3,1),
  "analyzed_at" TIMESTAMP,
  "uploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔧 Step 8: ML API Deployment (Optional)

The ML Flask API (`resume_score/app.py`) runs on `localhost:5000`.

For production, you have two options:

### Option A: Deploy ML API Separately on Railway

1. Create new service on Railway
2. Select same GitHub repo
3. Set Root Directory: `/resume_score`
4. Add buildpack: Python
5. Set environment variables:
   - `PORT=5000`
6. Update main app's ML API URL

### Option B: Use Serverless (Recommended for Railway)

Deploy ML API to Vercel or similar:
```bash
cd resume_score
vercel deploy
```

Then update the ML API endpoint in your Next.js app.

### Option C: Keep Local ML API (Demo Only)

For FYP demo, you can:
1. Run ML API locally: `cd resume_score && python app.py`
2. Use ngrok to expose: `ngrok http 5000`
3. Update ML API URL in Next.js

---

## 🎨 Step 9: Open Resume Editor

The resume editor is already in the project at `/open-resume`.

It's accessible at:
```
https://your-app.railway.app/resume-builder
```

*(Make sure the Next.js routing is set up to serve this)*

---

## 📊 Environment Variables Summary

### Required (Production):
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=sk-...
USE_RAPIDAPI=true
RAPIDAPI_KEY=your-rapidapi-key
NEXTAUTH_URL=https://your-app.railway.app
NODE_ENV=production
```

### Optional:
```env
USE_WEBCRAWLER=false          # Set true only if you have resources
USE_MOCK_JOBS=false
GOOGLE_CLOUD_PROJECT_ID=...   # If using Google Cloud
GOOGLE_CLOUD_TENANT_ID=...
```

---

## 🐛 Troubleshooting

### Issue 1: Build Fails

**Error:** `npm install failed`

**Solution:**
```bash
# Locally, clear cache
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

### Issue 2: Database Connection Failed

**Error:** `PrismaClientInitializationError`

**Solution:**
1. Check `DATABASE_URL` is correct
2. Run migrations: `railway run npx prisma migrate deploy`
3. Generate Prisma client: `railway run npx prisma generate`

### Issue 3: Environment Variables Not Working

**Solution:**
1. Railway Dashboard → Service → Variables
2. Add all variables listed above
3. Redeploy service

### Issue 4: Job Search Returns No Results

**Solution:**
1. Check `USE_RAPIDAPI=true`
2. Verify `RAPIDAPI_KEY` is correct
3. Check Railway logs for API errors

### Issue 5: ML Analysis Fails

**Solution:**
- ML API needs to be deployed separately
- Or use local ML API with ngrok for demo
- Check `OPENAI_API_KEY` is valid

---

## 📱 Post-Deployment Checklist

- [ ] App is accessible via Railway URL
- [ ] User registration works
- [ ] User login works
- [ ] Job search returns results (RapidAPI)
- [ ] Resume upload works
- [ ] Resume analysis works (ChatGPT)
- [ ] ML scoring works (if ML API deployed)
- [ ] Resume builder is accessible
- [ ] Database is persisting data
- [ ] All environment variables are set

---

## 🚀 Quick Deployment Commands

```bash
# 1. Push to GitHub
git add -A
git commit -m "Deploy to Railway"
git push origin main

# 2. Railway will auto-deploy from GitHub

# 3. Check deployment
railway status

# 4. View logs
railway logs

# 5. Open app
railway open
```

---

## 🌍 Live URLs

After deployment, you'll have:

**Main App:**
```
https://resumia-production.up.railway.app
```

**API Endpoints:**
```
https://resumia-production.up.railway.app/api/jobs/search
https://resumia-production.up.railway.app/api/analyze-resume-ml
https://resumia-production.up.railway.app/api/upload-resume
```

**Resume Builder:**
```
https://resumia-production.up.railway.app/resume-builder
```

---

## 💰 Railway Pricing Note

**Free Tier:**
- $5/month in credits
- Good for demo/testing
- Limited resources (512MB RAM)

**Pro Tier:**
- $20/month
- Better for production
- More resources

For FYP demo, free tier should work fine with:
- `USE_WEBCRAWLER=false` (use RapidAPI instead)
- ML API running locally or on free tier service

---

## 📞 Support

If deployment fails:
1. Check Railway logs
2. Verify all environment variables
3. Test locally first: `npm run dev`
4. Check GitHub Actions (if enabled)

---

**Status:** Ready for Full Deployment ✅

**Last Updated:** February 17, 2026
