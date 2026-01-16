# 🚀 RapidAPI JSearch Setup - Get REAL Jobs!

## ✅ What You'll Get

- ✅ **REAL jobs** from Google, LinkedIn, Indeed, Glassdoor
- ✅ **FREE** - 150 requests/month
- ✅ **No billing** - Free tier doesn't need credit card
- ✅ **Works globally** - Including Pakistan
- ✅ **5-minute setup**

---

## 📋 Step-by-Step Setup

### Step 1: Sign Up for RapidAPI (2 minutes)

1. Go to: **https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch**

2. Click **"Sign Up"** (top right)
   - Use your email
   - Or sign up with Google/GitHub

3. After signing up, you'll be on the JSearch API page

### Step 2: Subscribe to FREE Plan (1 minute)

1. On the JSearch API page, click **"Subscribe to Test"** button

2. Select the **"BASIC (FREE)"** plan:
   - ✅ 0 USD/month
   - ✅ 150 requests/month
   - ✅ Hard limit (no charges)

3. Click **"Subscribe"**

4. You don't need to add a credit card for the free tier!

### Step 3: Get Your API Key (1 minute)

1. After subscribing, you'll see the **"Code Snippets"** section

2. Look for **"X-RapidAPI-Key"** in the code example

3. Your API key looks like this:
   ```
   1234567890abcdef1234567890abcdef
   ```

4. **Copy this key!**

### Step 4: Add to Your Project (1 minute)

1. Open your `.env.local` file

2. Add these lines:
   ```env
   # RapidAPI JSearch (Real Jobs)
   RAPIDAPI_KEY="paste-your-api-key-here"
   USE_RAPIDAPI="true"
   USE_MOCK_JOBS="false"
   ```

3. **Replace** `paste-your-api-key-here` with your actual API key

4. Save the file

### Step 5: Restart Server

```bash
# Stop your current server (Ctrl+C)

# Start again
npm run dev
```

---

## 🧪 Test It!

1. Go to: **http://localhost:3000/job-search**

2. Search for:
   - **Query:** `Software Developer`
   - **Location:** `Pakistan`

3. Click **"Search Jobs"**

4. You should see **REAL jobs** from actual companies!

---

## ✅ How to Verify It's Working

### Check Server Console

You should see:
```
🚀 Using RapidAPI for REAL job data
✅ Found 10 real jobs from RapidAPI
```

### Check Job Cards

Real jobs will have:
- ✅ Real company names (not just Pakistani companies)
- ✅ Actual job descriptions
- ✅ Real "Apply Now" links to job sites
- ✅ Posted dates
- ✅ Salary information (when available)

---

## 📊 What Jobs Will You See?

### Example Search Results:

**"Software Developer in Pakistan"**
- Senior Software Engineer @ Systems Limited (Real)
- Python Developer @ ArbiSoft (Real)
- Full Stack Developer @ Netsol (Real)
- React Developer @ various companies (Real)
- Remote positions available in Pakistan

**"React Developer in Lahore"**
- React.js Developer jobs in Lahore
- Frontend positions
- Full Stack roles requiring React

---

## 🎯 Free Tier Limits

- **150 requests per month**
- **Resets every month**
- **No overage charges** (hard limit)

### How Many Searches?
- Each search = 1 request
- 150 searches per month
- About 5 searches per day
- **Perfect for FYP demos and testing!**

---

## 🐛 Troubleshooting

### Issue: "RAPIDAPI_KEY not configured"

**Solution:**
- Make sure you added `RAPIDAPI_KEY="..."` to `.env.local`
- Check there are no typos
- Restart your dev server

### Issue: "RapidAPI authentication failed"

**Solution:**
- Check your API key is correct
- Make sure you subscribed to the free plan
- Try copying the key again from RapidAPI

### Issue: "Rate limit exceeded"

**Solution:**
- You've used all 150 requests this month
- Wait until next month for reset
- Or upgrade to paid plan (optional)
- Or switch back to mock data temporarily

### Issue: Still seeing mock data

**Solution:**
Check your `.env.local`:
```env
USE_RAPIDAPI="true"    ← Must be "true"
USE_MOCK_JOBS="false"  ← Must be "false"
```

---

## 🔄 Switching Between Sources

### Use RapidAPI (Real Jobs):
```env
USE_RAPIDAPI="true"
USE_MOCK_JOBS="false"
```

### Use Mock Data (Sample Jobs):
```env
USE_RAPIDAPI="false"
USE_MOCK_JOBS="true"
```

### Use Google Cloud (Complex Setup):
```env
USE_RAPIDAPI="false"
USE_MOCK_JOBS="false"
GOOGLE_CLOUD_TENANT_ID="your-tenant-id"
```

---

## 🎬 For Your FYP Presentation

### What to Say:

> "Our job search system integrates with JSearch API, which aggregates jobs from multiple sources including Google Jobs, LinkedIn, Indeed, and Glassdoor. This gives users access to real job listings from across the industry. The system can search by job title and location, and returns detailed information including company name, job description, salary ranges, and direct application links."

### What to Demonstrate:

1. **Search for relevant jobs** - "Software Engineer in Pakistan"
2. **Show real results** - Actual companies and positions
3. **Click on job cards** - Show detailed information
4. **Show application links** - "Users can apply directly"
5. **Try different searches** - Show versatility

---

## 💡 Pro Tips

1. **Test before presentation** - Make sure your quota isn't used up
2. **Have backup** - Keep mock data as fallback
3. **Cache results** - Don't repeatedly search same terms
4. **Show variety** - Search for different job types during demo

---

## 🎉 You're Done!

Once you add your API key, you'll have **REAL job data** in your application!

**Total setup time: 5 minutes**
**Cost: FREE** ✅
**Works perfectly for FYP** ✅

---

## 📞 Need Help?

If you face any issues:
1. Check the troubleshooting section above
2. Verify your API key from RapidAPI dashboard
3. Check server console for error messages
4. Make sure `.env.local` has correct format

Good luck! 🚀
