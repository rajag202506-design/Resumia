# Google Cloud Talent Solution API Setup Guide

## ✅ Completed Steps

1. ✅ Created Google Cloud Project: `my-first-project-442612`
2. ✅ Enabled Cloud Talent Solution API
3. ✅ Created Service Account: `job-search-api-user`
4. ✅ Downloaded JSON credentials file
5. ✅ Updated `.env.local` with project configuration
6. ✅ Updated API route to use Google Cloud Talent Solution

---

## 📋 Next Steps to Complete

### Step 1: Place the Credentials File

1. **Locate** the downloaded JSON file from Google Cloud (it should be named something like `my-first-project-442612-xxxxx.json`)

2. **Rename** it to `google-credentials.json`

3. **Move** it to your project root directory:
   ```
   c:\Users\hp\Documents\Hashim (FYP)\code\resumia\google-credentials.json
   ```

4. **Verify** the file is in the correct location by running:
   ```bash
   dir google-credentials.json
   ```

### Step 2: Create a Tenant

Google Cloud Talent Solution requires a **tenant** to store and search jobs. Run the tenant creation script:

```bash
node create-tenant.js
```

**Expected Output:**
```
🚀 Creating Google Cloud Talent Solution Tenant...

✅ SUCCESS! Tenant created successfully!

📋 Tenant Details:
   Name: projects/my-first-project-442612/tenants/XXXXXXXXXX
   External ID: resumia-tenant-1234567890

🎉 IMPORTANT: Add this to your .env.local file:

GOOGLE_CLOUD_TENANT_ID="XXXXXXXXXX"
```

**Action Required:**
- Copy the `GOOGLE_CLOUD_TENANT_ID` line from the output
- Open `.env.local`
- Add the line to your `.env.local` file

### Step 3: Restart Your Development Server

After adding the tenant ID, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)

# Start it again
npm run dev
```

---

## 🧪 Testing the Job Search

### Test 1: Basic Search

1. Navigate to: `http://localhost:3000/job-search`
2. Enter:
   - **Query**: `Software Engineer`
   - **Location**: `Pakistan` or `Lahore, Pakistan` or `Karachi, Pakistan`
3. Click "Search Jobs"

### Test 2: Different Job Types

Try searching for:
- `React Developer` in `Islamabad, Pakistan`
- `Backend Developer` in `Pakistan`
- `Full Stack Engineer` in `Karachi, Pakistan`
- `Data Scientist` in `Lahore, Pakistan`

---

## ⚠️ Important Notes

### About Google Cloud Talent Solution

**Google Cloud Talent Solution is NOT a job board!** It's a service for:
1. **Companies** to post their jobs to Google's job search infrastructure
2. **Job search platforms** to search jobs that companies have posted

### What This Means for Your Project

To get actual job results, you need to either:

**Option 1: Use Sample/Test Data**
- Google provides ways to create sample jobs for testing
- These are for development and demo purposes

**Option 2: Integrate with Real Job Boards**
- Use APIs from job boards like:
  - LinkedIn Jobs API
  - Indeed API
  - Glassdoor API
  - Reed API (UK)
  - Rozee.pk API (Pakistan)
  - Mustakbil.com (Pakistan)

**Option 3: Build Your Own Job Database**
- Companies post jobs to your platform
- You store them in your database
- You use Google Talent Solution to provide intelligent search

### For Your FYP Demo

I recommend:

1. **Create sample jobs** using Google Cloud Talent Solution for demonstration
2. **Show the search functionality** works correctly
3. **Explain in your presentation** that in production:
   - Real companies would post jobs through your platform
   - OR you would integrate with job board APIs
   - Google Talent Solution provides the intelligent matching and search

---

## 🐛 Troubleshooting

### Error: "Tenant not found"
- Make sure you ran `node create-tenant.js`
- Make sure you added the `GOOGLE_CLOUD_TENANT_ID` to `.env.local`
- Restart your dev server

### Error: "Permission denied"
- Verify your service account has the "Cloud Talent Solution Job Seeker" role
- Go to: Google Cloud Console → IAM → Find your service account → Edit roles

### Error: "No jobs found"
- This is NORMAL if no companies have posted jobs to your tenant
- See the section above about creating sample jobs for testing

### Error: "Cannot find google-credentials.json"
- Make sure the file is in the project root
- Check the filename is exactly `google-credentials.json`
- Verify the path in `.env.local` is correct

---

## 📚 Additional Resources

- [Google Cloud Talent Solution Documentation](https://cloud.google.com/talent-solution/job-search/docs)
- [Creating Sample Jobs](https://cloud.google.com/talent-solution/job-search/docs/create-job)
- [Best Practices](https://cloud.google.com/talent-solution/job-search/docs/best-practices)

---

## 🎯 For Your FYP Presentation

### What to Demonstrate

1. **Search Interface**: Show the beautiful UI you've built
2. **API Integration**: Explain you're using Google's enterprise-grade job search API
3. **Future Work**: Explain how you would integrate real job sources in production

### What to Say

> "For this prototype, I've integrated Google Cloud Talent Solution API, which is the same technology that powers Google's job search features. In a production environment, we would either integrate with Pakistani job boards like Rozee.pk and Mustakbil.com, or allow companies to directly post jobs to our platform. The Google Talent Solution API provides intelligent matching, location-based search, and relevance ranking."

---

## ✨ Sample Job Creation Script (Optional)

If you want to create sample jobs for demonstration, I can create a script that adds sample jobs to your tenant. Let me know if you need this!
