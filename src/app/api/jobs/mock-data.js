/**
 * Mock job data for testing and fallback
 * This allows the job search to work even without external APIs
 */

export const MOCK_JOBS = [
  // Islamabad Jobs
  {
    id: 'job_1',
    title: 'Senior Software Developer',
    company: 'Systems Limited',
    location: 'Islamabad, Pakistan',
    description: 'We are seeking an experienced Senior Software Developer to join our team in Islamabad. The ideal candidate will have 5+ years of experience in full-stack development with strong skills in React, Node.js, and cloud technologies. You will be responsible for designing and implementing scalable web applications, mentoring junior developers, and participating in architectural decisions.',
    jobUrl: 'https://www.systemsltd.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 200,000 - 350,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_2',
    title: 'Software Developer - React & Node.js',
    company: 'Netsol Technologies',
    location: 'Islamabad, Pakistan',
    description: 'Join Netsol Technologies as a Software Developer working with React and Node.js. We need someone passionate about creating innovative solutions for the automotive finance industry. You will work with modern technologies, collaborate with international teams, and contribute to products used by millions worldwide.',
    jobUrl: 'https://www.netsoltech.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 150,000 - 250,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_3',
    title: 'Full Stack Developer',
    company: 'TPS Worldwide',
    location: 'Islamabad, Pakistan',
    description: 'TPS is looking for a talented Full Stack Developer to work on cutting-edge projects. Experience with JavaScript frameworks (React, Vue, or Angular), backend technologies (Node.js, Python, or Java), and database systems required. Great opportunity to work with international clients and latest technologies.',
    jobUrl: 'https://www.tpsworldwide.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 180,000 - 280,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_4',
    title: 'Junior Software Developer',
    company: 'Venturedive',
    location: 'Islamabad, Pakistan',
    description: 'Perfect opportunity for fresh graduates or junior developers. Venturedive provides comprehensive training and mentorship in modern software development. You will work on real projects, learn from experienced developers, and grow your career in a supportive environment. Strong foundation in programming concepts required.',
    jobUrl: 'https://www.venturedive.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 80,000 - 120,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_5',
    title: 'Software Engineer - Backend',
    company: 'Folio3 Software',
    location: 'Islamabad, Pakistan',
    description: 'We are hiring a Backend Software Engineer with expertise in Node.js, Python, or Java. You will design and implement RESTful APIs, work with microservices architecture, optimize database queries, and ensure application security. Experience with Docker and cloud platforms (AWS/Azure) is a plus.',
    jobUrl: 'https://www.folio3.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 160,000 - 240,000 per month',
    employmentType: 'FULL_TIME',
  },

  // Lahore Jobs
  {
    id: 'job_6',
    title: 'Software Developer',
    company: 'ArbiSoft',
    location: 'Lahore, Pakistan',
    description: 'ArbiSoft is looking for Software Developers to work on international projects. Strong programming skills in Python, JavaScript, or Ruby required. You will work with cutting-edge technologies, collaborate with US-based clients, and contribute to products used by millions of users worldwide.',
    jobUrl: 'https://www.arbisoft.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 150,000 - 250,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_7',
    title: 'Senior Software Engineer',
    company: 'Inbox Business Technologies',
    location: 'Lahore, Pakistan',
    description: 'Join Inbox as a Senior Software Engineer working on enterprise solutions. We need experts in .NET, Java, or modern JavaScript frameworks. You will lead development teams, make architectural decisions, and ensure delivery of high-quality software solutions.',
    jobUrl: 'https://www.inboxbiz.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 220,000 - 350,000 per month',
    employmentType: 'FULL_TIME',
  },

  // Karachi Jobs
  {
    id: 'job_8',
    title: 'Software Developer - Full Stack',
    company: 'i2c Inc.',
    location: 'Karachi, Pakistan',
    description: 'i2c is hiring Full Stack Developers for our fintech solutions. Experience with React, Angular, Node.js, and SQL databases required. You will work on payment processing systems, banking applications, and other financial technology solutions.',
    jobUrl: 'https://www.i2cinc.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 180,000 - 280,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_9',
    title: 'Software Engineer - Java',
    company: 'Techlogix',
    location: 'Karachi, Pakistan',
    description: 'Looking for Java Software Engineers with experience in Spring Boot, Hibernate, and microservices. You will develop enterprise applications, work with databases, and implement RESTful services. Strong understanding of design patterns and clean code principles required.',
    jobUrl: 'https://www.techlogix.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 170,000 - 260,000 per month',
    employmentType: 'FULL_TIME',
  },

  // Remote/Pakistan
  {
    id: 'job_10',
    title: 'Remote Software Developer',
    company: 'Gaditek',
    location: 'Remote, Pakistan',
    description: 'Work from anywhere in Pakistan! Gaditek is hiring remote Software Developers for multiple projects. We need versatile developers comfortable with various technologies. Experience with web development, mobile apps, or desktop applications welcome. Great work-life balance and competitive compensation.',
    jobUrl: 'https://www.gaditek.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 140,000 - 220,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_11',
    title: 'Python Developer',
    company: '10Pearls',
    location: 'Islamabad, Pakistan',
    description: '10Pearls is seeking Python Developers for backend development. Experience with Django or Flask frameworks, PostgreSQL, and RESTful API development required. You will work on scalable web applications, data processing systems, and cloud-based solutions.',
    jobUrl: 'https://www.10pearls.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 140,000 - 200,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    id: 'job_12',
    title: 'Software Development Engineer',
    company: 'Contour Software',
    location: 'Islamabad, Pakistan',
    description: 'Join Contour Software to work on healthcare technology solutions. We need developers with experience in modern web technologies, database design, and cloud platforms. You will contribute to products that improve healthcare delivery across the United States.',
    jobUrl: 'https://www.contoursoftware.com/careers',
    source: 'mock',
    foundAt: new Date().toISOString(),
    salary: 'PKR 160,000 - 240,000 per month',
    employmentType: 'FULL_TIME',
  },
];

/**
 * Search mock jobs by query and location
 */
export function searchMockJobs(query, location) {
  const queryLower = query.toLowerCase();
  const locationLower = location.toLowerCase();

  return MOCK_JOBS.filter(job => {
    const matchesQuery =
      job.title.toLowerCase().includes(queryLower) ||
      job.description.toLowerCase().includes(queryLower) ||
      job.company.toLowerCase().includes(queryLower);

    const matchesLocation =
      job.location.toLowerCase().includes(locationLower) ||
      locationLower.includes('pakistan'); // Show all Pakistan jobs if searching for Pakistan

    return matchesQuery && matchesLocation;
  });
}

/**
 * Get jobs by specific location
 */
export function getJobsByLocation(location) {
  const locationLower = location.toLowerCase();
  return MOCK_JOBS.filter(job =>
    job.location.toLowerCase().includes(locationLower)
  );
}
