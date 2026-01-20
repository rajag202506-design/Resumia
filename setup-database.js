// Run this script once to set up the database tables
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // The SQL from our migration file
    await prisma.$executeRawUnsafe(`
      -- CreateTable
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

    await prisma.$executeRawUnsafe(`
      -- CreateIndex
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
    `);

    await prisma.$executeRawUnsafe(`
      -- CreateTable
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

    await prisma.$executeRawUnsafe(`
      -- AddForeignKey
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

    console.log('✅ Database tables created successfully!');

    // Verify tables exist
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;
    console.log('Tables in database:', tables);

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
