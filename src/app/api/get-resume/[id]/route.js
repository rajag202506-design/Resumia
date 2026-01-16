import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // Check authentication
   // Check authentication - support both header and query parameter
let token;
const authHeader = request.headers.get('authorization');
const url = new URL(request.url);
const queryToken = url.searchParams.get('token');

if (authHeader && authHeader.startsWith('Bearer ')) {
  token = authHeader.substring(7);
} else if (queryToken) {
  token = queryToken;
} else {
  return Response.json({ error: 'Authentication required' }, { status: 401 });
}
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const resumeId = params.id;

    if (!resumeId) {
      return Response.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    // Get resume from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resumeId),
        user_id: decoded.userId
      }
    });

    if (!resume) {
      return Response.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Return file data with proper headers for viewing
    const response = new Response(resume.file_data, {
      status: 200,
      headers: {
        'Content-Type': resume.mime_type,
        'Content-Disposition': `inline; filename="${resume.original_name}"`,
        'Content-Length': resume.file_size.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('Get resume error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}