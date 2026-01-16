import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request) {
  console.log('🗑️ === DELETE RESUME API STARTED ===');

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  try {
    // Environment checks
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET missing');
      return new Response(JSON.stringify({
        error: 'Server configuration error: JWT_SECRET missing'
      }), { status: 500, headers });
    }

    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header missing or invalid');
      return new Response(JSON.stringify({
        error: 'Authorization required'
      }), { status: 401, headers });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ JWT verified for user:', decoded.userId);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError);
      return new Response(JSON.stringify({
        error: 'Invalid or expired token'
      }), { status: 401, headers });
    }

    // Parse request body
    const body = await request.json();
    const { resumeId } = body;

    if (!resumeId) {
      return new Response(JSON.stringify({
        error: 'Resume ID is required'
      }), { status: 400, headers });
    }

    console.log('🗑️ Deleting resume ID:', resumeId, 'for user:', decoded.userId);

    // Database connection and resume verification
    console.log('🔍 Connecting to database...');
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (dbConnectError) {
      console.error('❌ Database connection failed:', dbConnectError);
      return new Response(JSON.stringify({
        error: 'Database connection failed',
        details: dbConnectError.message
      }), { status: 500, headers });
    }

    // Verify resume exists and belongs to user
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resumeId),
        user_id: decoded.userId
      },
      select: {
        id: true,
        original_name: true,
        user_id: true
      }
    });

    if (!resume) {
      return new Response(JSON.stringify({
        error: 'Resume not found or access denied'
      }), { status: 404, headers });
    }

    console.log('✅ Resume found for deletion:', resume.original_name);

    // Delete the resume
    try {
      await prisma.resume.delete({
        where: {
          id: parseInt(resumeId)
        }
      });
      console.log('✅ Resume deleted successfully');
    } catch (deleteError) {
      console.error('❌ Resume deletion failed:', deleteError);
      return new Response(JSON.stringify({
        error: 'Failed to delete resume',
        details: deleteError.message
      }), { status: 500, headers });
    }

    const response = {
      success: true,
      message: 'Resume deleted successfully',
      deletedResume: {
        id: resume.id,
        name: resume.original_name
      }
    };

    console.log('🎉 SUCCESS: Resume deleted');
    return new Response(JSON.stringify(response), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('💥 DELETE RESUME ERROR:', error);

    return new Response(JSON.stringify({
      error: 'Failed to delete resume',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers
    });
  } finally {
    await prisma.$disconnect();
    console.log('🏁 === DELETE RESUME API FINISHED ===');
  }
}