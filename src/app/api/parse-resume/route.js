import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
// Fixed imports with default exports
import PDFParse from 'pdf-parse';
import mammoth from 'mammoth';
import OpenAI from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI with error handling
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (openaiError) {
  console.error('OpenAI initialization failed:', openaiError);
}

async function analyzeResumeWithChatGPT(extractedText) {
  console.log('🤖 Starting ChatGPT analysis...');
  
  if (!openai) {
    throw new Error('OpenAI not initialized');
  }
  
  try {
    const prompt = `
Analyze this resume and extract information in this EXACT JSON format:

{
  "personalInfo": {
    "name": "Full name",
    "email": "Email address", 
    "phone": "Phone number",
    "address": "Location/Address"
  },
  "education": [
    "Educational qualifications with degree, institution, year"
  ],
  "experience": [
    "Work experience with job title, company, duration"
  ],
  "skills": [
    "Technical and professional skills"
  ],
  "summary": "Professional summary of the candidate in 2-3 sentences",
  "keyStrengths": [
    "Key achievements and strengths"
  ],
  "recommendations": [
    "Specific suggestions to improve this resume"
  ]
}

Resume Text:
${extractedText}

IMPORTANT: Return ONLY valid JSON, no additional text or explanation.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert HR professional. Extract resume information and return ONLY valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    const aiResponse = response.choices[0].message.content.trim();
    console.log('✅ ChatGPT response received, length:', aiResponse.length);
    
    // Clean the response (remove markdown if present)
    let cleanedResponse = aiResponse;
    if (aiResponse.startsWith('```json')) {
      cleanedResponse = aiResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    
    const parsedData = JSON.parse(cleanedResponse);
    console.log('✅ ChatGPT JSON parsed successfully');
    
    return parsedData;

  } catch (error) {
    console.error('❌ ChatGPT analysis failed:', error);
    throw error;
  }
}

// Fallback basic parsing
function basicResumeAnalysis(text) {
  console.log('📝 Using fallback basic parsing...');
  
  // Simple email extraction
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  
  // Simple phone extraction
  const phoneRegex = /(?:\+92|0092|92)?[-.\s]?(?:\d{3}[-.\s]?\d{7}|\d{4}[-.\s]?\d{7}|\d{10})/g;
  const phones = text.match(phoneRegex);
  
  // Simple name extraction (first non-empty line that looks like a name)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  let name = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 2 && trimmed.length < 50 && 
        !trimmed.includes('@') && 
        !trimmed.match(/\d{3,}/) &&
        !trimmed.toLowerCase().includes('resume') &&
        !trimmed.toLowerCase().includes('cv') &&
        trimmed.split(' ').length >= 2 && trimmed.split(' ').length <= 4) {
      name = trimmed;
      break;
    }
  }

  // Extract some basic skills
  const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css'];
  const foundSkills = [];
  const lowerText = text.toLowerCase();
  for (const skill of commonSkills) {
    if (lowerText.includes(skill)) {
      foundSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  return {
    personalInfo: {
      name: name,
      email: emails ? emails[0] : '',
      phone: phones ? phones[0] : '',
      address: ''
    },
    education: ['Education information needs manual review'],
    experience: ['Work experience needs manual review'],
    skills: foundSkills.length > 0 ? foundSkills : ['Skills need manual review'],
    summary: 'Basic parsing used. For detailed AI analysis, ensure OpenAI API key is configured.',
    keyStrengths: ['Professional experience present'],
    recommendations: [
      'Upload a clearer resume for better AI analysis',
      'Ensure resume has clear sections for Education, Experience, and Skills',
      'Use standard resume formatting for better parsing'
    ]
  };
}

export async function POST(request) {
  console.log('🚀 === CHATGPT PARSE RESUME API STARTED ===');
  
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  try {
    // Step 1: Environment checks
    console.log('🔍 Checking environment...');
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('JWT Secret present:', !!process.env.JWT_SECRET);

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET missing');
      return new Response(JSON.stringify({
        error: 'Server configuration error: JWT_SECRET missing'
      }), { status: 500, headers });
    }

    // Step 2: Parse request body
    let body;
    try {
      body = await request.json();
      console.log('✅ Request body parsed:', body);
    } catch (bodyError) {
      console.error('❌ Request body parse error:', bodyError);
      return new Response(JSON.stringify({
        error: 'Invalid JSON in request body'
      }), { status: 400, headers });
    }

    const { resumeId } = body;
    if (!resumeId) {
      return new Response(JSON.stringify({
        error: 'Resume ID is required'
      }), { status: 400, headers });
    }
    console.log('📄 Processing resume ID:', resumeId);

    // Step 3: Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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

    // Step 4: Database connection and resume fetch
    console.log('🔍 Connecting to database...');
    try {
      await prisma.$connect();
      console.log('✅ Database connected');
    } catch (dbConnectError) {
      console.error('❌ Database connection failed:', dbConnectError);
      return new Response(JSON.stringify({
        error: 'Database connection failed'
      }), { status: 500, headers });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resumeId),
        user_id: decoded.userId
      }
    });

    if (!resume) {
      return new Response(JSON.stringify({
        error: 'Resume not found or access denied'
      }), { status: 404, headers });
    }
    console.log('✅ Resume found:', resume.original_name, 'Type:', resume.mime_type);

    // Step 5: Extract text from file
    console.log('📝 Extracting text from file...');
    let extractedText = '';
    
    try {
      if (resume.mime_type === 'application/pdf') {
        console.log('📄 Processing PDF...');
        const pdfData = await PDFParse(resume.file_data);
        extractedText = pdfData.text;
        console.log('✅ PDF text extracted, length:', extractedText.length);
      } else if (resume.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('📄 Processing DOCX...');
        const result = await mammoth.extractRawText({ buffer: resume.file_data });
        extractedText = result.value;
        console.log('✅ DOCX text extracted, length:', extractedText.length);
      } else {
        return new Response(JSON.stringify({
          error: 'Unsupported file type: ' + resume.mime_type
        }), { status: 400, headers });
      }
    } catch (extractError) {
      console.error('❌ Text extraction failed:', extractError);
      return new Response(JSON.stringify({
        error: 'Failed to extract text from file: ' + extractError.message
      }), { status: 500, headers });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      console.error('❌ Insufficient text extracted');
      return new Response(JSON.stringify({
        error: 'No readable text found in the file. Please ensure the file is not corrupted or image-based.'
      }), { status: 400, headers });
    }

    console.log('✅ Text extraction successful, length:', extractedText.length);

    // Step 6: Analyze with ChatGPT or fallback
    let analysisResult;
    let analysisMethod = 'Basic Parsing';
    
    if (process.env.OPENAI_API_KEY && openai) {
      try {
        console.log('🤖 Attempting ChatGPT analysis...');
        analysisResult = await analyzeResumeWithChatGPT(extractedText);
        analysisMethod = 'ChatGPT Enhanced';
        console.log('✅ ChatGPT analysis successful');
      } catch (aiError) {
        console.error('❌ ChatGPT analysis failed, using fallback:', aiError.message);
        analysisResult = basicResumeAnalysis(extractedText);
        analysisMethod = 'Basic Parsing (ChatGPT failed: ' + aiError.message + ')';
      }
    } else {
      console.log('⚠️ OpenAI not available, using basic parsing');
      analysisResult = basicResumeAnalysis(extractedText);
      analysisMethod = 'Basic Parsing (OpenAI not configured)';
    }

    // Step 7: Prepare final data
    const finalData = {
      ...analysisResult,
      extractedAt: new Date().toISOString(),
      analysisMethod: analysisMethod,
      textLength: extractedText.length
    };

    console.log('📊 Analysis summary:', {
      method: analysisMethod,
      hasName: !!finalData.personalInfo?.name,
      hasEmail: !!finalData.personalInfo?.email,
      educationCount: finalData.education?.length || 0,
      experienceCount: finalData.experience?.length || 0,
      skillsCount: finalData.skills?.length || 0
    });

    // Step 8: Save to database
    console.log('💾 Saving to database...');
    try {
      await prisma.resume.update({
        where: { id: parseInt(resumeId) },
        data: {
          parsed_data: JSON.stringify(finalData),
          extracted_text: extractedText.substring(0, 5000)
        }
      });
      console.log('✅ Data saved to database');
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError);
      return new Response(JSON.stringify({
        error: 'Failed to save analysis: ' + dbError.message
      }), { status: 500, headers });
    }

    // Step 9: Return success response
    const response = {
      success: true,
      message: 'Resume analyzed successfully with ' + analysisMethod,
      parsedData: finalData,
      extractedText: extractedText.substring(0, 500) + '...'
    };

    console.log('🎉 SUCCESS: Resume analysis complete');
    return new Response(JSON.stringify(response), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers
    });
  } finally {
    await prisma.$disconnect();
    console.log('🏁 === CHATGPT PARSE RESUME API FINISHED ===');
  }
}