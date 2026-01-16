import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import PDFParse from 'pdf-parse';
import mammoth from 'mammoth';

const prisma = new PrismaClient();

// Text extraction and parsing functions
function extractPersonalInfo(text) {
  const info = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    info.email = emails[0];
  }

  // Extract phone
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})|(\+\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    info.phone = phones[0];
  }

  // Extract name (usually first few words before email/phone)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 2 && line.length < 50 && 
        !line.includes('@') && 
        !line.match(/\d{3,}/) &&
        line.split(' ').length >= 2) {
      info.name = line;
      break;
    }
  }

  return info;
}

function extractEducation(text) {
  const education = [];
  const educationKeywords = ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school'];
  const degreeTypes = ['bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate', 'b.s', 'b.a', 'm.s', 'm.a', 'mba'];
  
  const lines = text.toLowerCase().split('\n');
  let inEducationSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're entering education section
    if (educationKeywords.some(keyword => line.includes(keyword))) {
      inEducationSection = true;
      continue;
    }
    
    // Check if we're leaving education section
    if (inEducationSection && (line.includes('experience') || line.includes('work') || line.includes('skills'))) {
      inEducationSection = false;
      continue;
    }
    
    // Extract degree information
    if (inEducationSection || degreeTypes.some(degree => line.includes(degree))) {
      if (line.length > 10 && line.length < 200) {
        education.push(line);
      }
    }
  }
  
  return education.slice(0, 5); // Limit to 5 entries
}

function extractExperience(text) {
  const experience = [];
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'professional', 'job'];
  const jobTitles = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'director', 'coordinator'];
  
  const lines = text.toLowerCase().split('\n');
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're entering experience section
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      inExperienceSection = true;
      continue;
    }
    
    // Check if we're leaving experience section
    if (inExperienceSection && (line.includes('education') || line.includes('skills') || line.includes('project'))) {
      inExperienceSection = false;
      continue;
    }
    
    // Extract job information
    if (inExperienceSection || jobTitles.some(title => line.includes(title))) {
      if (line.length > 10 && line.length < 200) {
        experience.push(line);
      }
    }
  }
  
  return experience.slice(0, 8); // Limit to 8 entries
}

function extractSkills(text) {
  const skills = [];
  const skillKeywords = ['skills', 'technical', 'programming', 'software', 'tools', 'technologies'];
  const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'git', 'aws', 'docker'];
  
  const lines = text.toLowerCase().split('\n');
  let inSkillsSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're entering skills section
    if (skillKeywords.some(keyword => line.includes(keyword))) {
      inSkillsSection = true;
      continue;
    }
    
    // Check if we're leaving skills section
    if (inSkillsSection && (line.includes('experience') || line.includes('education') || line.includes('project'))) {
      inSkillsSection = false;
      continue;
    }
    
    // Extract skills
    if (inSkillsSection || commonSkills.some(skill => line.includes(skill))) {
      if (line.length > 2 && line.length < 100) {
        // Split by common delimiters
        const lineSkills = line.split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 1);
        skills.push(...lineSkills);
      }
    }
  }
  
  return [...new Set(skills)].slice(0, 15); // Remove duplicates and limit to 15
}

export async function POST(request) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { resumeId } = await request.json();

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

    let extractedText = '';

    // Extract text based on file type
    if (resume.mime_type === 'application/pdf') {
      try {
        const pdfData = await PDFParse(resume.file_data);
        extractedText = pdfData.text;
      } catch (error) {
        console.error('PDF parsing error:', error);
        return Response.json({ error: 'Failed to parse PDF' }, { status: 500 });
      }
    } else if (resume.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const result = await mammoth.extractRawText({ buffer: resume.file_data });
        extractedText = result.value;
      } catch (error) {
        console.error('DOCX parsing error:', error);
        return Response.json({ error: 'Failed to parse DOCX' }, { status: 500 });
      }
    } else {
      return Response.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Parse extracted text
    const personalInfo = extractPersonalInfo(extractedText);
    const education = extractEducation(extractedText);
    const experience = extractExperience(extractedText);
    const skills = extractSkills(extractedText);

    const parsedData = {
      personalInfo,
      education,
      experience,
      skills,
      extractedAt: new Date().toISOString()
    };

    // Update resume with parsed data
    await prisma.resume.update({
      where: { id: parseInt(resumeId) },
      data: {
        parsed_data: JSON.stringify(parsedData),
        extracted_text: extractedText.substring(0, 5000) // Store first 5000 chars
      }
    });

    return Response.json({
      message: 'Resume parsed successfully',
      parsedData,
      extractedText: extractedText.substring(0, 1000) // Return first 1000 chars
    }, { status: 200 });

  } catch (error) {
    console.error('Parse resume error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}