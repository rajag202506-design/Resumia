import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import PDFParse from 'pdf-parse';
import mammoth from 'mammoth';

const prisma = new PrismaClient();

// Enhanced text extraction functions
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

  // Extract phone - enhanced pattern for Pakistani numbers
  const phoneRegex = /(?:\+92|0092|92)?[-.\s]?(?:\d{3}[-.\s]?\d{7}|\d{4}[-.\s]?\d{7}|\d{10})/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    info.phone = phones[0];
  }

  // Extract name (usually first line or first few words)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    // Look for a name pattern (2-4 words, no numbers, no email symbols)
    if (line.length > 2 && line.length < 50 && 
        !line.includes('@') && 
        !line.match(/\d{3,}/) &&
        !line.toLowerCase().includes('resume') &&
        !line.toLowerCase().includes('cv') &&
        line.split(' ').length >= 2 && line.split(' ').length <= 4) {
      info.name = line;
      break;
    }
  }

  // Extract address/location
  const locationKeywords = ['pakistan', 'lahore', 'karachi', 'islamabad', 'rawalpindi', 'peshawar', 'quetta', 'multan'];
  const addressRegex = new RegExp(`(${locationKeywords.join('|')})`, 'gi');
  const addressMatch = text.match(addressRegex);
  if (addressMatch) {
    // Find the line containing the location
    const addressLines = lines.filter(line => 
      locationKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );
    if (addressLines.length > 0) {
      info.address = addressLines[0].trim();
    }
  }

  return info;
}

function extractEducation(text) {
  const education = [];
  const educationKeywords = ['education', 'academic', 'qualification', 'degree', 'university', 'college', 'school', 'bs ', 'ms ', 'phd', 'bachelor', 'master'];
  const degreeTypes = ['bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate', 'b.s', 'b.a', 'm.s', 'm.a', 'mba', 'bs ', 'ms ', 'ics', 'fsc'];
  
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
    if (inEducationSection && (line.includes('experience') || line.includes('work') || line.includes('skills') || line.includes('projects'))) {
      inEducationSection = false;
      continue;
    }
    
    // Extract degree information
    if (inEducationSection || degreeTypes.some(degree => line.includes(degree))) {
      if (line.length > 10 && line.length < 300) {
        // Get the original line with proper capitalization
        const originalLine = text.split('\n')[i];
        if (originalLine && originalLine.trim().length > 10) {
          education.push(originalLine.trim());
        }
      }
    }
  }
  
  return education.slice(0, 5); // Limit to 5 entries
}

function extractExperience(text) {
  const experience = [];
  const experienceKeywords = ['experience', 'work', 'employment', 'career', 'professional', 'job', 'internee', 'intern', 'worked'];
  const jobTitles = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'director', 'coordinator', 'internee', 'intern'];
  
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
    if (inExperienceSection && (line.includes('education') || line.includes('skills') || line.includes('projects'))) {
      inExperienceSection = false;
      continue;
    }
    
    // Extract job information
    if (inExperienceSection || jobTitles.some(title => line.includes(title))) {
      if (line.length > 10 && line.length < 300) {
        // Get the original line with proper capitalization
        const originalLine = text.split('\n')[i];
        if (originalLine && originalLine.trim().length > 10) {
          experience.push(originalLine.trim());
        }
      }
    }
  }
  
  return experience.slice(0, 8); // Limit to 8 entries
}

function extractSkills(text) {
  const skills = [];
  const skillKeywords = ['skills', 'technical', 'programming', 'software', 'tools', 'technologies', 'languages'];
  
  // Common technical skills to look for
  const commonSkills = [
    'javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'git', 'aws', 'docker',
    'c++', 'c#', 'php', 'mysql', 'mongodb', 'express', 'angular', 'vue', 'bootstrap', 'jquery',
    'linux', 'windows', 'ubuntu', 'cisco', 'network', 'database', 'enterprise'
  ];
  
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
    if (inSkillsSection && (line.includes('experience') || line.includes('education') || line.includes('projects'))) {
      inSkillsSection = false;
      continue;
    }
    
    // Extract skills
    if (inSkillsSection || commonSkills.some(skill => line.includes(skill))) {
      if (line.length > 2 && line.length < 100) {
        // Split by common delimiters and extract individual skills
        const lineSkills = line.split(/[,;|•·:()]/).map(s => s.trim()).filter(s => s.length > 1);
        
        // Add skills that match common patterns
        lineSkills.forEach(skill => {
          if (commonSkills.some(commonSkill => skill.includes(commonSkill)) || 
              (skill.length > 2 && skill.length < 30 && !skill.includes(' ') && skill.match(/^[a-zA-Z+#.]+$/))) {
            skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
          }
        });
      }
    }
  }
  
  return [...new Set(skills)].slice(0, 15); // Remove duplicates and limit to 15
}

export async function POST(request) {
  let responseData = null;
  
  try {
    console.log('=== PARSE RESUME API STARTED ===');
    
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      responseData = { error: 'Authentication required' };
      return new Response(JSON.stringify(responseData), { 
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
      console.log('ERROR: Invalid token', error.message);
      responseData = { error: 'Invalid token' };
      return new Response(JSON.stringify(responseData), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      responseData = { error: 'Invalid request body' };
      return new Response(JSON.stringify(responseData), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { resumeId } = requestBody;

    if (!resumeId) {
      responseData = { error: 'Resume ID is required' };
      return new Response(JSON.stringify(responseData), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('PARSING RESUME ID:', resumeId);

    // Get resume from database
    const resume = await prisma.resume.findFirst({
      where: {
        id: parseInt(resumeId),
        user_id: decoded.userId
      }
    });

    if (!resume) {
      responseData = { error: 'Resume not found' };
      return new Response(JSON.stringify(responseData), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('FOUND RESUME:', resume.original_name, 'Type:', resume.mime_type);

    let extractedText = '';

    // Extract text based on file type
    if (resume.mime_type === 'application/pdf') {
      try {
        console.log('PARSING PDF...');
        const pdfData = await PDFParse(resume.file_data);
        extractedText = pdfData.text;
        console.log('PDF TEXT EXTRACTED, LENGTH:', extractedText.length);
      } catch (error) {
        console.error('PDF parsing error:', error);
        responseData = { error: 'Failed to parse PDF: ' + error.message };
        return new Response(JSON.stringify(responseData), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else if (resume.mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        console.log('PARSING DOCX...');
        const result = await mammoth.extractRawText({ buffer: resume.file_data });
        extractedText = result.value;
        console.log('DOCX TEXT EXTRACTED, LENGTH:', extractedText.length);
      } catch (error) {
        console.error('DOCX parsing error:', error);
        responseData = { error: 'Failed to parse DOCX: ' + error.message };
        return new Response(JSON.stringify(responseData), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      responseData = { error: 'Unsupported file type: ' + resume.mime_type };
      return new Response(JSON.stringify(responseData), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      responseData = { error: 'No text could be extracted from the file' };
      return new Response(JSON.stringify(responseData), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('EXTRACTING INFORMATION...');
    
    // Parse extracted text
    const personalInfo = extractPersonalInfo(extractedText);
    const education = extractEducation(extractedText);
    const experience = extractExperience(extractedText);
    const skills = extractSkills(extractedText);

    console.log('EXTRACTED INFO:', {
      name: personalInfo.name,
      email: personalInfo.email,
      educationCount: education.length,
      experienceCount: experience.length,
      skillsCount: skills.length
    });

    const parsedData = {
      personalInfo,
      education,
      experience,
      skills,
      extractedAt: new Date().toISOString()
    };

    // Update resume with parsed data
    try {
      await prisma.resume.update({
        where: { id: parseInt(resumeId) },
        data: {
          parsed_data: JSON.stringify(parsedData),
          extracted_text: extractedText.substring(0, 5000) // Store first 5000 chars
        }
      });

      console.log('SUCCESS: Resume parsed and saved');

      responseData = {
        success: true,
        message: 'Resume parsed successfully',
        parsedData,
        extractedText: extractedText.substring(0, 1000) // Return first 1000 chars for preview
      };

      return new Response(JSON.stringify(responseData), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (dbError) {
      console.error('Database update error:', dbError);
      responseData = { error: 'Failed to save parsed data: ' + dbError.message };
      return new Response(JSON.stringify(responseData), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Parse resume error:', error);
    responseData = { 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    };
    return new Response(JSON.stringify(responseData), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    await prisma.$disconnect();
    console.log('=== PARSE RESUME API FINISHED ===');
  }
}