/**
 * Script to create sample jobs for testing the Google Cloud Talent Solution API
 * Run this AFTER creating your tenant to populate it with test job data
 */

const { JobServiceClient, CompanyServiceClient } = require('@google-cloud/talent').v4;

// Sample jobs data for Pakistan
const SAMPLE_JOBS = [
  {
    title: 'Senior Software Engineer',
    company: 'Tech Solutions Pakistan',
    location: 'Lahore, Pakistan',
    description: 'We are looking for an experienced Senior Software Engineer to join our team. The ideal candidate will have 5+ years of experience in full-stack development, strong knowledge of React, Node.js, and cloud technologies. You will be responsible for architecting and building scalable web applications.',
    requirements: ['5+ years experience', 'React', 'Node.js', 'AWS or Azure', 'Team leadership'],
    salary: 'PKR 200,000 - 300,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'React Developer',
    company: 'Digital Innovations Ltd',
    location: 'Karachi, Pakistan',
    description: 'Join our growing team as a React Developer. We need someone passionate about creating beautiful, responsive user interfaces. You will work with modern tools and technologies including React, Redux, TypeScript, and Material-UI.',
    requirements: ['3+ years React experience', 'TypeScript', 'Redux', 'REST APIs', 'Git'],
    salary: 'PKR 120,000 - 180,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Backend Developer - Node.js',
    company: 'CodeCraft Solutions',
    location: 'Islamabad, Pakistan',
    description: 'We are seeking a talented Backend Developer with expertise in Node.js and database technologies. You will design and implement RESTful APIs, work with microservices architecture, and ensure application performance and security.',
    requirements: ['Node.js', 'Express.js', 'MongoDB or PostgreSQL', 'Docker', 'Microservices'],
    salary: 'PKR 150,000 - 220,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Full Stack Engineer',
    company: 'Innovation Hub Pakistan',
    location: 'Lahore, Pakistan',
    description: 'Looking for a Full Stack Engineer who can work on both frontend and backend. You will be involved in all stages of development from conception to deployment. Great opportunity to work on cutting-edge projects.',
    requirements: ['React or Vue.js', 'Node.js or Python', 'Database design', 'DevOps basics', 'Agile methodology'],
    salary: 'PKR 180,000 - 250,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Junior Software Developer',
    company: 'StartUp Tech Pvt Ltd',
    location: 'Karachi, Pakistan',
    description: 'Perfect opportunity for fresh graduates or junior developers. We provide mentorship and training in modern web development technologies. You will work alongside senior developers and learn industry best practices.',
    requirements: ['Bachelor in Computer Science', 'Basic JavaScript knowledge', 'HTML/CSS', 'Eager to learn', 'Team player'],
    salary: 'PKR 60,000 - 90,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Data Scientist',
    company: 'Analytics Pro Pakistan',
    location: 'Islamabad, Pakistan',
    description: 'We are looking for a Data Scientist to analyze large datasets and build predictive models. You will work with machine learning algorithms, statistical analysis, and data visualization tools.',
    requirements: ['Python', 'Machine Learning', 'TensorFlow or PyTorch', 'SQL', 'Statistics'],
    salary: 'PKR 200,000 - 280,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'DevOps Engineer',
    company: 'Cloud Systems Ltd',
    location: 'Lahore, Pakistan',
    description: 'Join our infrastructure team as a DevOps Engineer. You will manage CI/CD pipelines, cloud infrastructure, and ensure system reliability. Experience with AWS, Docker, and Kubernetes required.',
    requirements: ['AWS or Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Linux administration'],
    salary: 'PKR 180,000 - 260,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Mobile App Developer - React Native',
    company: 'Mobile First Solutions',
    location: 'Karachi, Pakistan',
    description: 'We need a skilled React Native developer to build cross-platform mobile applications. You will work on both iOS and Android apps, integrate with backend APIs, and ensure smooth user experience.',
    requirements: ['React Native', 'JavaScript/TypeScript', 'Mobile UI/UX', 'RESTful APIs', 'App deployment'],
    salary: 'PKR 140,000 - 200,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'UI/UX Designer',
    company: 'Creative Digital Agency',
    location: 'Islamabad, Pakistan',
    description: 'Creative UI/UX Designer needed to design beautiful and functional interfaces. You will work with product teams to understand requirements and create wireframes, mockups, and prototypes.',
    requirements: ['Figma or Adobe XD', 'User research', 'Prototyping', 'Design systems', 'Portfolio required'],
    salary: 'PKR 100,000 - 150,000 per month',
    employmentType: 'FULL_TIME',
  },
  {
    title: 'Python Developer - Django',
    company: 'Web Solutions Pakistan',
    location: 'Lahore, Pakistan',
    description: 'Experienced Python/Django developer needed for web application development. You will build scalable backend systems, integrate with databases, and implement business logic.',
    requirements: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Git'],
    salary: 'PKR 130,000 - 190,000 per month',
    employmentType: 'FULL_TIME',
  },
];

async function createSampleJobs() {
  console.log('🚀 Creating Sample Jobs for Testing...\n');

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'my-first-project-442612';
    const tenantId = process.env.GOOGLE_CLOUD_TENANT_ID;

    if (!tenantId) {
      console.error('❌ ERROR: GOOGLE_CLOUD_TENANT_ID not found in environment');
      console.error('Please run create-tenant.js first and add the tenant ID to .env.local');
      return;
    }

    const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';

    console.log('📍 Project ID:', projectId);
    console.log('📍 Tenant ID:', tenantId);
    console.log('📍 Credentials:', keyFilename);
    console.log('\n⏳ Initializing clients...\n');

    // Initialize clients
    const companyClient = new CompanyServiceClient({ keyFilename });
    const jobClient = new JobServiceClient({ keyFilename });

    const tenantPath = `projects/${projectId}/tenants/${tenantId}`;

    // Create a company first (required for job posting)
    console.log('🏢 Creating sample company...');

    const [company] = await companyClient.createCompany({
      parent: tenantPath,
      company: {
        displayName: 'Resumia Demo Companies',
        externalId: `demo-company-${Date.now()}`,
        headquartersAddress: 'Pakistan',
      },
    });

    console.log('✅ Company created:', company.name);
    console.log('');

    // Create jobs
    console.log('📝 Creating sample jobs...\n');
    let successCount = 0;

    for (let i = 0; i < SAMPLE_JOBS.length; i++) {
      const jobData = SAMPLE_JOBS[i];

      try {
        const [job] = await jobClient.createJob({
          parent: tenantPath,
          job: {
            company: company.name,
            requisitionId: `req-${Date.now()}-${i}`,
            title: jobData.title,
            description: `${jobData.description}\n\nRequirements:\n${jobData.requirements.map(r => `• ${r}`).join('\n')}`,
            applicationInfo: {
              uris: [`https://resumia.com/apply/${i + 1}`],
              instruction: 'Please apply through our website',
            },
            addresses: [jobData.location],
            compensationInfo: {
              entries: [
                {
                  description: jobData.salary,
                },
              ],
            },
            employmentTypes: [jobData.employmentType],
            languageCode: 'en-US',
          },
        });

        console.log(`✅ [${i + 1}/${SAMPLE_JOBS.length}] Created: ${jobData.title} at ${jobData.company}`);
        successCount++;
      } catch (error) {
        console.error(`❌ [${i + 1}/${SAMPLE_JOBS.length}] Failed to create ${jobData.title}:`, error.message);
      }
    }

    console.log('\n🎉 SUCCESS! Created', successCount, 'out of', SAMPLE_JOBS.length, 'sample jobs');
    console.log('\n📋 Summary:');
    console.log('   • Company ID:', company.name);
    console.log('   • Jobs Created:', successCount);
    console.log('   • Tenant:', tenantPath);
    console.log('\n✅ You can now test the job search functionality!');
    console.log('   Navigate to: http://localhost:3000/job-search');
    console.log('   Try searching for: "Software Engineer" in "Pakistan"');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);

    if (error.code === 5) {
      console.error('\n⚠️  Tenant not found. Make sure:');
      console.error('   1. You have run create-tenant.js');
      console.error('   2. GOOGLE_CLOUD_TENANT_ID is in your .env.local');
    }

    if (error.code === 7) {
      console.error('\n⚠️  Permission denied. Make sure:');
      console.error('   1. Service account has "Cloud Talent Solution Job Seeker" role');
      console.error('   2. Billing is enabled for your project');
    }
  }
}

// Run the function
createSampleJobs();
