# 🚀 Quick Start Guide - Google Cloud Talent Solution

## Step-by-Step Setup (5 minutes)

### 1️⃣ Place Your Credentials File

Move the downloaded JSON file to your project root and rename it:

```
c:\Users\hp\Documents\Hashim (FYP)\code\resumia\google-credentials.json
```

### 2️⃣ Create a Tenant

Open terminal in your project directory and run:

```bash
node create-tenant.js
```

**Copy the output line** that looks like:
```
GOOGLE_CLOUD_TENANT_ID="1234567890"
```

### 3️⃣ Update .env.local

Open `.env.local` and add the line you copied:

```env
GOOGLE_CLOUD_TENANT_ID="YOUR_TENANT_ID_HERE"
```

Your `.env.local` should now have:
```env
GOOGLE_CLOUD_PROJECT_ID="my-first-project-442612"
GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json"
GOOGLE_CLOUD_TENANT_ID="YOUR_TENANT_ID_HERE"
```

### 4️⃣ Create Sample Jobs

Run this to add test jobs to your tenant:

```bash
node create-sample-jobs.js
```

This will create 10 sample jobs including:
- Software Engineers
- React Developers
- Backend Developers
- Data Scientists
- UI/UX Designers
- etc.

### 5️⃣ Start Your Server

```bash
npm run dev
```

### 6️⃣ Test It!

1. Navigate to: **http://localhost:3000/job-search**

2. Try these searches:
   - Query: `Software Engineer`, Location: `Pakistan`
   - Query: `React Developer`, Location: `Lahore`
   - Query: `Backend`, Location: `Karachi`

---

## ✅ What Should Work Now

- ✅ Beautiful job search interface
- ✅ Real-time search with loading states
- ✅ Results from Google Cloud Talent Solution API
- ✅ Job cards with all details (title, company, location, salary)
- ✅ "Apply Now" buttons (will link to demo URLs)

---

## 🐛 Common Issues

### Issue: "Tenant not found"
**Solution:** Make sure you:
1. Ran `node create-tenant.js`
2. Added `GOOGLE_CLOUD_TENANT_ID` to `.env.local`
3. Restarted your dev server

### Issue: "No jobs found"
**Solution:** Run `node create-sample-jobs.js` to add sample jobs

### Issue: "Cannot find google-credentials.json"
**Solution:** Make sure the file is in the project root directory

---

## 📁 Expected File Structure

```
resumia/
├── google-credentials.json     ← Your credentials file
├── .env.local                   ← Contains all env variables
├── create-tenant.js             ← Script to create tenant
├── create-sample-jobs.js        ← Script to add sample jobs
├── src/
│   └── app/
│       ├── job-search/
│       │   └── page.tsx         ← Job search UI
│       └── api/
│           └── jobs/
│               └── search/
│                   └── route.js ← Updated API route
```

---

## 🎯 For Testing & Demo

1. **Search for different job titles**: Software Engineer, Developer, Designer
2. **Try different locations**: Pakistan, Lahore, Karachi, Islamabad
3. **Show the UI**: Beautiful design with animations
4. **Explain**: "This uses Google's enterprise job search technology"

---

## 📞 Need Help?

Check the detailed guide: `GOOGLE_CLOUD_SETUP.md`

Happy coding! 🎉
