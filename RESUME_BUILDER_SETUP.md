# Resume Builder - Quick Setup

## To Use Resume Builder Locally:

### Terminal 1 - Main App:
```bash
cd "c:\Users\hp\Documents\Hashim (FYP)\code\resumia"
npm run dev
# Runs on http://localhost:3000
```

### Terminal 2 - Resume Builder:
```bash
cd "C:\Users\hp\Pictures\open-resume"
npm run dev -- -p 3001
# Runs on http://localhost:3001
```

### Then Visit:
- Main app: http://localhost:3000
- Resume builder: http://localhost:3000/resume-builder
- The iframe will load the builder from port 3001

## Deployed on Railway:
Resume builder shows iframe from localhost:3001 (won't work until you deploy open-resume separately or set NEXT_PUBLIC_RESUME_BUILDER_URL)

## For FYP Demo:
Run both services locally as shown above.
