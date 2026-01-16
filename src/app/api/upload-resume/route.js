import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log('=== UPLOAD API STARTED ===');
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ERROR: No authorization header');
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('AUTH SUCCESS: User ID =', decoded.userId);
    } catch (error) {
      console.log('ERROR: Invalid token', error.message);
      return Response.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || typeof file === 'string') {
      console.log('ERROR: No file uploaded');
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('FILE INFO:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.log('ERROR: Invalid file type:', file.type);
      return Response.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.log('ERROR: File too large:', file.size);
      return Response.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer for database storage
    console.log('Converting file to buffer...');
    const buffer = await file.arrayBuffer();
    const fileData = Buffer.from(buffer);
    console.log('Buffer created, size:', fileData.length);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${decoded.userId}_${timestamp}_${file.name}`;
    console.log('Generated filename:', fileName);

    // Save file to database
    try {
      console.log('Attempting to save to database...');
      console.log('Database URL exists:', !!process.env.DATABASE_URL);
      
      const savedResume = await prisma.resume.create({
        data: {
          user_id: decoded.userId,
          original_name: file.name,
          file_name: fileName,
          file_data: fileData,
          file_size: file.size,
          mime_type: file.type,
        }
      });

      console.log('SUCCESS: Database record created with ID:', savedResume.id);

      return Response.json(
        { 
          message: 'Resume uploaded and saved successfully',
          resumeId: savedResume.id,
          fileName: fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: savedResume.uploaded_at
        },
        { status: 200 }
      );

    } catch (dbError) {
      console.log('DATABASE ERROR:', dbError);
      console.log('Error code:', dbError.code);
      console.log('Error message:', dbError.message);
      
      // Check if it's a missing table error
      if (dbError.code === 'P2021' || dbError.message.includes('does not exist')) {
        console.log('ERROR: Table does not exist');
        return Response.json(
          { error: 'Database table not found. Please run database migrations.' },
          { status: 500 }
        );
      }
      
      return Response.json(
        { error: 'Failed to save file to database: ' + dbError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.log('GENERAL ERROR:', error);
    return Response.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  } finally {
    // Clean up Prisma connection
    await prisma.$disconnect();
    console.log('=== UPLOAD API FINISHED ===');
  }
}