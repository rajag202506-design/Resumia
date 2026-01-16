import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log('=== GET MY RESUMES API STARTED ===');
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('AUTH SUCCESS: User ID =', decoded.userId);
    } catch (error) {
      console.error('JWT verification error:', error);
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure userId exists
    if (!decoded.userId) {
      return new Response(JSON.stringify({ error: 'Invalid token payload' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('FETCHING RESUMES FOR USER:', decoded.userId);

    // Get user's resumes from database
    const resumes = await prisma.resume.findMany({
      where: {
        user_id: decoded.userId
      },
      select: {
        id: true,
        original_name: true,
        file_name: true,
        file_size: true,
        mime_type: true,
        uploaded_at: true,
        parsed_data: true,
        extracted_text: true
      },
      orderBy: {
        uploaded_at: 'desc'
      }
    });

    console.log('FOUND RESUMES:', resumes.length);

    // Keep parsed_data as string for the frontend to handle
    const resumesWithParsedData = resumes.map(resume => ({
      ...resume,
      parsed_data: resume.parsed_data || null,
      extracted_text: resume.extracted_text || null,
      uploaded_at: resume.uploaded_at.toISOString()
    }));

    const responseData = {
      resumes: resumesWithParsedData,
      count: resumes.length
    };

    console.log('SUCCESS: Returning', resumes.length, 'resumes');

    return new Response(JSON.stringify(responseData), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get resumes error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
    console.log('=== GET MY RESUMES API FINISHED ===');
  }
}