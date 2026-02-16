# Deployment Checklist - Railway

## ✅ Pre-Deployment

- [x] All code committed to GitHub
- [x] Web crawler integrated with job search
- [x] ML suggestions improved (specific, actionable)
- [x] Resume builder included (`open-resume/`)
- [x] Environment variables documented
- [x] Railway.json configured
- [ ] Test locally one more time

---

## 🔧 Railway Setup

### Step 1: GitHub Connection
- [ ] Go to Railway Dashboard (https://railway.app/dashboard)
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose `rajag202506-design/Resumia`
- [ ] Branch: `main`

### Step 2: Database
- [ ] Add PostgreSQL database service
- [ ] Copy DATABASE_URL from Variables tab
- [ ] Or connect to existing PostgreSQL service

### Step 3: Environment Variables
Add these in Railway → Variables tab:

#### Required Variables:
```
DATABASE_URL = <from PostgreSQL service>
JWT_SECRET = <your-long-random-secret-key>
OPENAI_API_KEY = <your-openai-api-key-from-platform.openai.com>
USE_RAPIDAPI = true
RAPIDAPI_KEY = <your-rapidapi-key-from-rapidapi.com>
NEXTAUTH_URL = <your-railway-url>
NODE_ENV = production
```

#### Optional Variables:
```
USE_WEBCRAWLER = false  (recommended false for Railway free tier)
USE_MOCK_JOBS = false
NEXTAUTH_SECRET = your-nextauth-secret-here
```

Checklist:
- [ ] DATABASE_URL set
- [ ] JWT_SECRET set
- [ ] OPENAI_API_KEY set
- [ ] USE_RAPIDAPI = true
- [ ] RAPIDAPI_KEY set
- [ ] NEXTAUTH_URL set (will get after first deployment)
- [ ] NODE_ENV = production

---

## 🚀 Deployment

### Step 4: Initial Deploy
- [ ] Railway auto-detects `railway.json`
- [ ] Build command runs: `npm install && npx prisma generate && npm run build`
- [ ] Wait for "Deployed" status (5-10 minutes)

### Step 5: Get Deployment URL
- [ ] Click on deployment
- [ ] Copy the generated URL (e.g., `resumia-production.up.railway.app`)
- [ ] Update `NEXTAUTH_URL` variable with this URL
- [ ] Redeploy if needed

### Step 6: Database Migrations
Option A: Auto-migration (should happen during build)
- [ ] Check logs for "Running migrations..."

Option B: Manual migration (if needed)
```bash
railway login
railway link
railway run npx prisma migrate deploy
```

---

## 🧪 Post-Deployment Testing

### Step 7: Verify Deployment
Test these URLs (replace with your Railway URL):

#### Homepage
- [ ] https://your-app.railway.app/
- [ ] Should load the homepage

#### Health Check (if you have one)
- [ ] https://your-app.railway.app/api/health
- [ ] Should return 200 OK

#### Job Search API
- [ ] https://your-app.railway.app/api/jobs/search?query=software+engineer&location=Pakistan
- [ ] Should return job listings (from RapidAPI)

#### Authentication
- [ ] Register new user
- [ ] Login works
- [ ] JWT token generated

#### Resume Upload
- [ ] Upload a resume (PDF/DOCX)
- [ ] File saved to database
- [ ] Resume displayed

#### Resume Analysis
- [ ] Click "Analyze with ML"
- [ ] ChatGPT parsing works
- [ ] ML score displayed (if ML API deployed)

#### Job Search UI
- [ ] Search for "software engineer" in "Pakistan"
- [ ] Jobs displayed from RapidAPI
- [ ] Can click on job details

---

## 🐛 Troubleshooting

### If build fails:
- [ ] Check Railway logs
- [ ] Verify all dependencies in package.json
- [ ] Test build locally: `npm run build`

### If database connection fails:
- [ ] Verify DATABASE_URL is correct
- [ ] Check PostgreSQL service is running
- [ ] Run migrations manually

### If job search returns no results:
- [ ] Check USE_RAPIDAPI=true
- [ ] Verify RAPIDAPI_KEY is correct
- [ ] Check Railway logs for API errors

### If resume upload fails:
- [ ] Check file size limits
- [ ] Verify database connection
- [ ] Check Railway logs

---

## 📊 Monitoring

### Step 8: Monitor Deployment
- [ ] Railway Dashboard → Metrics
- [ ] Check CPU usage
- [ ] Check Memory usage
- [ ] Check Request count

### Step 9: Check Logs
- [ ] Railway → Deployments → View Logs
- [ ] Look for errors
- [ ] Verify API calls working

---

## 🔄 Redeploy Instructions

### For code changes:
1. Commit changes locally
2. Push to GitHub: `git push origin main`
3. Railway auto-deploys

### For environment variable changes:
1. Railway → Variables
2. Update variables
3. Click "Redeploy" (may not be needed)

---

## 📝 Important Notes

### Web Crawler on Railway:
❌ **Not recommended for Railway free tier**
- Puppeteer + Chromium needs ~300MB RAM
- Railway free tier has limited resources
- Use `USE_RAPIDAPI=true` instead

✅ **For local demo:**
- Use `USE_WEBCRAWLER=true` locally
- Show 35+ real jobs from Pakistani sites

### ML API on Railway:
⚠️ **Separate deployment needed**
- Flask API needs separate Railway service
- Or run locally for demo
- Or deploy to Vercel/Heroku

### Resume Builder:
✅ **Already included**
- Location: `/open-resume`
- Should be accessible via routing

---

## 🎯 Final Checklist

Before presentation:
- [ ] App deployed and accessible
- [ ] All features working
- [ ] Job search returns results
- [ ] Resume analysis works
- [ ] Database persisting data
- [ ] No console errors
- [ ] Screenshots taken
- [ ] Demo account created

---

## 🌐 Deployment URLs

Fill these in after deployment:

**Main App:**
```
URL: _________________________________
```

**PostgreSQL Database:**
```
Host: _________________________________
Port: _________________________________
Database: _________________________________
```

**Status:**
```
Deployment Status: [ ] Deployed  [ ] Failed
Last Updated: _______________
```

---

## 📞 Quick Reference

**Railway Dashboard:**
https://railway.app/dashboard

**GitHub Repo:**
https://github.com/rajag202506-design/Resumia

**Documentation:**
- RAILWAY_DEPLOYMENT_GUIDE.md
- QUICK_START.md
- WEBCRAWLER_INTEGRATION.md

---

**Ready to Deploy:** ✅

Use this checklist during deployment to ensure nothing is missed!
