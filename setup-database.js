// Run this script once to set up the database tables
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'NOT SET!');

    // Create users table
    console.log('Creating users table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL NOT NULL,
          "name" VARCHAR(60) NOT NULL,
          "email" VARCHAR(255) NOT NULL,
          "password" VARCHAR(255) NOT NULL,
          "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Users table ready');

    // Create unique index
    console.log('Creating email index...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `);
    console.log('✓ Email index ready');

    // Create resumes table
    console.log('Creating resumes table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "resumes" (
          "id" SERIAL NOT NULL,
          "user_id" INTEGER NOT NULL,
          "original_name" VARCHAR(255) NOT NULL,
          "file_name" VARCHAR(255) NOT NULL,
          "file_data" BYTEA NOT NULL,
          "file_size" INTEGER NOT NULL,
          "mime_type" VARCHAR(100) NOT NULL,
          "uploaded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "parsed_data" TEXT,
          "extracted_text" TEXT,
          "analyzed_at" TIMESTAMPTZ(6),
          "ml_analysis" TEXT,
          "ml_score" DOUBLE PRECISION,
          CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✓ Resumes table ready');

    // Add foreign key
    console.log('Adding foreign key constraint...');
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'resumes_user_id_fkey'
        ) THEN
          ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✓ Foreign key ready');

    // Verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `;
    console.log('📋 Tables in database:', tables.map(t => t.tablename).join(', '));

    console.log('✅ Database setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
