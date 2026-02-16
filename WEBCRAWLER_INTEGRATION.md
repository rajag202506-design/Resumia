# Web Crawler Integration Guide

## Overview

The Resumia job search now uses the **Web Crawler** to fetch **REAL jobs** from Pakistani job sites instead of relying solely on RapidAPI.

---

## ✅ Integrated Job Sources

When `USE_WEBCRAWLER=true`, the job search will extract real jobs from:

1. **Rozee.pk** - Private company jobs (Tech, Software, Engineering)
2. **JobsAlert.pk** - Government & organization jobs
3. **Mustakbil.com** - Various company jobs (All sectors)

**Total:** 35+ real jobs per search

---

## 🔧 Configuration

### Option 1: Use Web Crawler (Recommended)

Edit `.env.local`:

```env
# PRIORITY #1: Web Crawler (Real Pakistani jobs)
USE_WEBCRAWLER="true"

# PRIORITY #2: RapidAPI (Fallback)
USE_RAPIDAPI="false"
RAPIDAPI_KEY="your-rapidapi-key"

# PRIORITY #3: Mock Data (Testing)
USE_MOCK_JOBS="false"
```

### Option 2: Use RapidAPI Only

```env
USE_WEBCRAWLER="false"
USE_RAPIDAPI="true"
RAPIDAPI_KEY="your-rapidapi-key"
```

### Option 3: Use Mock Data (Testing)

```env
USE_WEBCRAWLER="false"
USE_RAPIDAPI="false"
USE_MOCK_JOBS="true"
```

---

## 🚀 How It Works

### Priority Order:

1. **Web Crawler** (if `USE_WEBCRAWLER=true`)
   - Runs Puppeteer-based crawler
   - Scrapes Rozee.pk, JobsAlert.pk, Mustakbil.com
   - Returns 35+ real jobs
   - Fallback to RapidAPI if crawler fails

2. **RapidAPI** (if `USE_RAPIDAPI=true`)
   - Uses JSearch API
   - Returns 10 jobs per search
   - 150 requests/month (free tier)
   - Fallback to mock data if API fails

3. **Mock Data** (if `USE_MOCK_JOBS=true`)
   - Returns sample jobs for testing

---

## 📊 API Response Format

### Web Crawler Response:

```json
{
  "matchingJobs": [
    {
      "id": "crawler_1819896",
      "title": "Senior Software Engineer",
      "company": "Cadence",
      "location": "Lahore",
      "description": "We are seeking experienced Senior Engineers...",
      "jobUrl": "https://www.rozee.pk/senior-software-engineer-jobs-1819896",
      "source": "webcrawler",
      "crawlerSource": "Rozee",
      "foundAt": "2026-02-16T22:52:50.913Z",
      "salary": "Not specified",
      "employmentType": "Full-time",
      "postedDate": "Recently posted"
    },
    ...
  ],
  "source": "webcrawler",
  "sources": ["Rozee.pk", "JobsAlert.pk", "Mustakbil.com"]
}
```

---

## 🧪 Testing

### Test the Web Crawler Directly:

```bash
cd webcroller
node test-all-working-sites.js
```

**Output:**
- ✅ 35+ real jobs
- ✅ Real company names
- ✅ Real URLs
- ✅ Real locations

### Test via API:

1. Start the Next.js app:
   ```bash
   npm run dev
   ```

2. Make a search request:
   ```bash
   curl "http://localhost:3000/api/jobs/search?query=software+engineer&location=Pakistan"
   ```

3. Check the job search page:
   ```
   http://localhost:3000/job-search
   ```

---

## 📁 File Structure

```
resumia/
├── src/app/api/jobs/
│   ├── search/route.js          # Main search endpoint
│   ├── webcrawler-search.js     # Web crawler integration (NEW)
│   ├── rapidapi-search.js       # RapidAPI integration
│   └── mock-data.js             # Mock data fallback
│
└── webcroller/                   # Web crawler directory
    ├── src/
    │   ├── JobCrawler.js        # Main crawler
    │   ├── RozeeCrawler.js      # Rozee.pk crawler
    │   ├── JobsAlertCrawler.js  # JobsAlert.pk crawler
    │   └── MustakbilCrawler.js  # Mustakbil.com crawler
    └── test-all-working-sites.js # Test script
```

---

## ⚙️ How the Integration Works

### 1. User searches for jobs:
```
Job Search Page → API Request → /api/jobs/search
```

### 2. API checks environment variables:
```javascript
if (USE_WEBCRAWLER === 'true') {
  // Use web crawler
}
```

### 3. Web crawler executes:
```javascript
searchJobsWithWebCrawler(query, location)
  → Runs: node src/index.js "software engineer" "Pakistan"
  → Crawls: Rozee.pk, JobsAlert.pk, Mustakbil.com
  → Saves: data/processed-jobs-*.json
  → Returns: 35+ real jobs
```

### 4. API transforms crawler data:
```javascript
jobs.map(job => ({
  id: `crawler_${job.url?.split('/').pop()}`,
  title: job.title,
  company: job.company,
  location: job.location,
  jobUrl: job.url,
  source: 'webcrawler',
  ...
}))
```

### 5. Frontend displays jobs:
```
Job cards with real company names, URLs, and locations
```

---

## 🔍 Debugging

### Check if web crawler is being used:

Look for these logs in the terminal:

```
🔍 [Job Search API] Request received
- USE_WEBCRAWLER: true → true
🕷️  Using Web Crawler for REAL job data from Pakistani sites
🕷️  [WebCrawler] Searching for: "software engineer" in Pakistan
✅ [WebCrawler] Returning 35 jobs from sources: { Rozee: 10, JobsAlert.pk: 10, Mustakbil.com: 15 }
```

### Common Issues:

**Issue 1: "Web crawler not installed"**
- Solution: Make sure `webcroller` directory exists at the same level as `resumia`

**Issue 2: "Web crawler timeout"**
- Solution: Job sites may be slow, increase timeout in `webcrawler-search.js`

**Issue 3: No jobs returned**
- Solution: Check if crawler sites are accessible, run `node test-all-working-sites.js`

---

## 🎯 Benefits

### Using Web Crawler:

✅ **Real jobs** from Pakistani sites
✅ **35+ jobs** per search (vs 10 from RapidAPI)
✅ **Multiple sources** (Rozee, JobsAlert, Mustakbil)
✅ **No API quota** limits
✅ **Fresh data** (real-time scraping)
✅ **Local companies** (Pakistan-specific)

### Using RapidAPI:

✅ **Fast response** (1-2 seconds)
✅ **No blocking** (API access)
✅ **Global jobs** (Google, LinkedIn, Indeed)
⚠️  **Limited quota** (150 requests/month)
⚠️  **Only 10 jobs** per search

---

## 📈 Performance

| Method | Speed | Jobs | Quota | Reliability |
|--------|-------|------|-------|-------------|
| **Web Crawler** | 60-80s | 35+ | Unlimited | High (3 sources) |
| **RapidAPI** | 1-2s | 10 | 150/month | Very High |
| **Mock Data** | <1s | 20 | Unlimited | Always works |

---

## 🎓 For Presentation

### Demo Flow:

1. **Show `.env.local`:**
   ```env
   USE_WEBCRAWLER="true"
   ```

2. **Start the app:**
   ```bash
   npm run dev
   ```

3. **Search for jobs:**
   - Go to: `http://localhost:3000/job-search`
   - Search: "software engineer" in "Pakistan"

4. **Show results:**
   - ✅ 35+ real jobs displayed
   - ✅ Real companies: Cadence, vFairs, NADRA, UET, etc.
   - ✅ Real URLs to job postings
   - ✅ Multiple sources: Rozee.pk, JobsAlert.pk, Mustakbil.com

5. **Show terminal logs:**
   ```
   🕷️  Using Web Crawler for REAL job data
   ✅ Found 35 real jobs from Web Crawler
   ```

6. **Explain:**
   - "Built custom web crawler with Puppeteer"
   - "Scrapes 3 Pakistani job sites"
   - "Returns 35+ real jobs per search"
   - "Falls back to RapidAPI if crawler fails"

---

## 🔄 Deployment (Railway)

### Environment Variables to Add:

```env
USE_WEBCRAWLER=true
USE_RAPIDAPI=false
```

**Note:** Web crawler requires Node.js and sufficient memory on Railway. If deployment has issues, you can:

1. Use RapidAPI instead: `USE_WEBCRAWLER=false`, `USE_RAPIDAPI=true`
2. Run crawler locally and push results to database
3. Use a separate crawler service (scheduled job)

---

## ✅ Verification Checklist

- [x] Web crawler extracts 35+ real jobs
- [x] Integration with job search API
- [x] Environment variable configuration
- [x] Fallback to RapidAPI working
- [x] Frontend displays crawler jobs
- [x] Real company names and URLs
- [x] Multiple Pakistani job sources
- [x] Error handling and logging
- [x] Documentation complete

---

**Status:** ✅ **FULLY INTEGRATED**

The job search now uses the web crawler to fetch real jobs from Pakistani job sites!
