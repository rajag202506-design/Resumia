# Resumia - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set:

```env
# Database
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/resumia"

# JWT Secret (keep this secure)
JWT_SECRET="your-secret-key-here"

# OpenAI API Key (for resume parsing)
OPENAI_API_KEY="sk-your-key-here"

# Job Search: Choose ONE option

# OPTION 1: Web Crawler (35+ real Pakistani jobs - RECOMMENDED)
USE_WEBCRAWLER="true"
USE_RAPIDAPI="false"

# OPTION 2: RapidAPI (10 jobs, 150 requests/month free)
USE_WEBCRAWLER="false"
USE_RAPIDAPI="true"
RAPIDAPI_KEY="your-rapidapi-key"

# OPTION 3: Mock Data (for testing)
USE_WEBCRAWLER="false"
USE_RAPIDAPI="false"
USE_MOCK_JOBS="true"
```

### Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Features

### ✅ Authentication
- Sign up / Login
- JWT-based auth
- Secure password hashing

### ✅ Resume Builder
- Create professional resumes
- Multiple templates
- PDF export

### ✅ Resume Analysis
- AI-powered resume parsing (ChatGPT)
- ML-based scoring (86% accuracy)
- Skills matching

### ✅ Job Search
- **Web Crawler:** 35+ real jobs from Rozee.pk, JobsAlert.pk, Mustakbil.com
- **RapidAPI:** 10 jobs from Google, LinkedIn, Indeed
- **Mock Data:** Sample jobs for testing

---

## 🕷️ Web Crawler Setup (Recommended)

The web crawler extracts **REAL jobs** from Pakistani job sites.

### Requirements:
- Node.js 18+
- `webcroller` directory (already included)

### Test the crawler:

```bash
cd webcroller
node test-all-working-sites.js
```

**Expected output:**
```
✅ CRAWL COMPLETED SUCCESSFULLY!
Total Jobs Found: 35+ REAL jobs
Active Sources: Rozee, JobsAlert.pk, Mustakbil.com
```

### Enable in job search:

Set in `.env.local`:
```env
USE_WEBCRAWLER="true"
```

---

## 🔧 Database Setup

### Using PostgreSQL:

1. Create database:
```bash
createdb resumia
```

2. Run migrations:
```bash
npx prisma migrate dev
```

3. Generate Prisma client:
```bash
npx prisma generate
```

---

## 📊 Job Search Options

### Option 1: Web Crawler (Best for FYP Demo)

**Pros:**
- ✅ 35+ real jobs per search
- ✅ Multiple Pakistani job sources
- ✅ No API quota limits
- ✅ Real company names and URLs

**Cons:**
- ⏱️ Slower (60-80 seconds)
- 🌐 Requires internet connection

**Setup:**
```env
USE_WEBCRAWLER="true"
```

### Option 2: RapidAPI

**Pros:**
- ⚡ Fast (1-2 seconds)
- 🌍 Global jobs (Google, LinkedIn, Indeed)
- 📊 Structured data

**Cons:**
- 📉 Only 10 jobs per search
- 🔒 Limited to 150 requests/month

**Setup:**
```env
USE_RAPIDAPI="true"
RAPIDAPI_KEY="your-key"
```

### Option 3: Mock Data

**Pros:**
- ⚡ Instant response
- 🧪 Great for testing
- 🔄 Always works

**Cons:**
- 🎭 Fake data
- 📉 Limited variety

**Setup:**
```env
USE_MOCK_JOBS="true"
```

---

## 🎓 For FYP Presentation

### Demo Script:

1. **Show Project:**
   ```bash
   npm run dev
   ```
   Go to: http://localhost:3000

2. **Create Account:**
   - Click "Sign Up"
   - Enter name, email, password
   - Login

3. **Search for Jobs:**
   - Go to "Job Search"
   - Search: "software engineer" in "Pakistan"
   - **Show 35+ real jobs** from web crawler

4. **Show Job Details:**
   - Real company names: Cadence, vFairs, NADRA, UET
   - Real URLs to job postings
   - Multiple sources: Rozee.pk, JobsAlert.pk, Mustakbil.com

5. **Show Resume Builder:**
   - Click "Build Resume"
   - Fill in details
   - Preview & download PDF

6. **Show Resume Analysis:**
   - Upload a resume
   - Show AI parsing
   - Show ML scoring (86% accuracy)

7. **Explain Architecture:**
   - Next.js 15 (React 19)
   - PostgreSQL with Prisma
   - JWT authentication
   - OpenAI API (ChatGPT)
   - Python Flask (ML scoring)
   - Puppeteer (web crawler)

---

## 🐛 Troubleshooting

### Issue: Database connection failed

**Solution:**
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Check DATABASE_URL in .env.local
```

### Issue: Web crawler timeout

**Solution:**
1. Check internet connection
2. Try increasing timeout in `webcrawler-search.js`
3. Fallback to RapidAPI: `USE_RAPIDAPI="true"`

### Issue: No jobs found

**Solution:**
1. Check `.env.local` configuration
2. Test crawler: `cd webcroller && node test-all-working-sites.js`
3. Check terminal logs for errors

### Issue: OpenAI API error

**Solution:**
- Verify `OPENAI_API_KEY` in `.env.local`
- Check API quota at https://platform.openai.com

---

## 📁 Project Structure

```
resumia/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── jobs/          # Job search API
│   │   │   │   ├── search/    # Main search endpoint
│   │   │   │   ├── webcrawler-search.js  # Crawler integration
│   │   │   │   ├── rapidapi-search.js    # RapidAPI integration
│   │   │   │   └── mock-data.js          # Mock data
│   │   │   └── resume/        # Resume analysis API
│   │   ├── job-search/        # Job search page
│   │   ├── resume-builder/    # Resume builder page
│   │   └── login/             # Auth pages
│   └── components/            # React components
│
├── webcroller/                # Web crawler
│   ├── src/
│   │   ├── BaseCrawler.js    # Base crawler class
│   │   ├── RozeeCrawler.js   # Rozee.pk
│   │   ├── JobsAlertCrawler.js  # JobsAlert.pk
│   │   └── MustakbilCrawler.js  # Mustakbil.com
│   └── test-all-working-sites.js
│
├── ml-api/                    # Python Flask ML API
│   └── main.py               # Resume scoring
│
├── prisma/
│   └── schema.prisma         # Database schema
│
└── .env.local                # Environment variables
```

---

## 🎯 Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Run database migrations
4. ✅ Test web crawler
5. ✅ Start the app
6. ✅ Create an account
7. ✅ Search for jobs
8. ✅ Build a resume

---

## 📚 Documentation

- **WEBCRAWLER_INTEGRATION.md** - Web crawler integration guide
- **PRESENTATION_DOCUMENTATION.md** - Complete FYP documentation
- **README.md** - Project overview

---

## ✅ Verification

### Check if everything works:

1. **Database:**
   ```bash
   npx prisma studio
   ```

2. **Web Crawler:**
   ```bash
   cd webcroller
   node test-all-working-sites.js
   ```

3. **ML API:**
   ```bash
   cd ml-api
   python main.py
   ```

4. **Next.js App:**
   ```bash
   npm run dev
   ```

---

**Status:** ✅ Ready for FYP Presentation!

**Support:** If you encounter issues, check the logs in the terminal.
