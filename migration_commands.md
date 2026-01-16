# Database Migration Commands for ML Analysis

## Run these commands to add ML analysis fields to your database:

### 1. Generate migration:
```bash
npx prisma migrate dev --name add-ml-analysis-fields
```

### 2. If you prefer SQL migration, run this SQL directly:
```sql
-- Add ML analysis columns to resumes table
ALTER TABLE resumes 
ADD COLUMN ml_analysis TEXT,
ADD COLUMN ml_score DECIMAL(3,1),
ADD COLUMN analyzed_at TIMESTAMPTZ;
```

### 3. Push schema changes:
```bash
npx prisma db push
```

### 4. Generate Prisma client:
```bash
npx prisma generate
```

## Verification
After running the migration, verify the new columns exist:
```sql
\d+ resumes
-- Should show ml_analysis, ml_score, and analyzed_at columns
```