import { JobServiceClient } from '@google-cloud/talent';
import { NextResponse } from 'next/server';
import { searchMockJobs } from '../mock-data';
import { searchJobsWithRapidAPI } from '../rapidapi-search';

// Initialize JobServiceClient with credentials
let jobServiceClient;
try {
  jobServiceClient = new JobServiceClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
  });
} catch (error) {
  console.error('Failed to initialize Google Cloud Talent client:', error);
}

// Check which job source to use
const USE_RAPIDAPI = process.env.USE_RAPIDAPI === 'true';
const USE_MOCK_DATA = process.env.USE_MOCK_JOBS === 'true' || (!USE_RAPIDAPI && !process.env.GOOGLE_CLOUD_TENANT_ID);

export async function GET(request) {
  console.log('🔍 [Job Search API] Request received');

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const location = searchParams.get('location');

  console.log(`📋 Search params - Query: "${query}", Location: "${location}"`);

  if (!query || !location) {
    return NextResponse.json({
      error: 'Query and location are required',
      matchingJobs: []
    }, { status: 400 });
  }

  // Use RapidAPI if enabled
  if (USE_RAPIDAPI) {
    console.log('🚀 Using RapidAPI for REAL job data');

    try {
      const rapidAPIJobs = await searchJobsWithRapidAPI(query, location);

      console.log(`✅ Found ${rapidAPIJobs.length} real jobs from RapidAPI`);

      return NextResponse.json({
        matchingJobs: rapidAPIJobs,
        source: 'rapidapi',
        message: rapidAPIJobs.length === 0 ? 'No jobs found for your search criteria' : undefined
      });

    } catch (rapidError) {
      console.error('❌ RapidAPI failed:', rapidError.message);

      // Fallback to mock data if RapidAPI fails
      console.log('💡 Falling back to mock data...');
      const mockJobs = searchMockJobs(query, location);

      return NextResponse.json({
        matchingJobs: mockJobs,
        source: 'mock',
        warning: 'RapidAPI unavailable, using sample data: ' + rapidError.message
      });
    }
  }

  // Use mock data if enabled or if Google Cloud is not configured
  if (USE_MOCK_DATA) {
    console.log('🎭 Using mock data (Google Cloud not configured or USE_MOCK_JOBS=true)');

    const mockJobs = searchMockJobs(query, location);

    console.log(`✅ Found ${mockJobs.length} mock jobs`);

    return NextResponse.json({
      matchingJobs: mockJobs,
      source: 'mock',
      message: mockJobs.length === 0 ? 'No jobs found for your search criteria' : undefined
    });
  }

  // Check environment variables
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const tenantId = process.env.GOOGLE_CLOUD_TENANT_ID;

  if (!projectId) {
    console.error('❌ GOOGLE_CLOUD_PROJECT_ID not configured');
    return NextResponse.json({
      error: 'Google Cloud Project ID is not configured',
      matchingJobs: []
    }, { status: 500 });
  }

  if (!tenantId) {
    console.error('❌ GOOGLE_CLOUD_TENANT_ID not configured');
    return NextResponse.json({
      error: 'Google Cloud Tenant ID is not configured. Please run create-tenant.js first',
      matchingJobs: []
    }, { status: 500 });
  }

  if (!jobServiceClient) {
    console.error('❌ Job service client not initialized');
    return NextResponse.json({
      error: 'Google Cloud Talent Solution client initialization failed',
      matchingJobs: []
    }, { status: 500 });
  }

  const parent = `projects/${projectId}/tenants/${tenantId}`;
  console.log('🏢 Using tenant parent:', parent);

  try {
    // Build the search request
    const searchRequest = {
      parent: parent,
      requestMetadata: {
        userId: 'anonymous-user',
        sessionId: `session_${Date.now()}`,
        domain: 'resumia.com',
      },
      jobQuery: {
        query: query,
        locationFilters: [
          {
            address: location,
            distanceInMiles: 50.0, // Increased to 50 miles for better results
          },
        ],
      },
      jobView: 'JOB_VIEW_FULL',
      pageSize: 20,
      orderBy: 'relevance desc',
    };

    console.log('📤 Sending request to Google Cloud Talent API...');

    const [response] = await jobServiceClient.searchJobs(searchRequest);

    console.log(`✅ Received ${response.matchingJobs?.length || 0} jobs from Google`);

    // If no jobs found, return empty array
    if (!response.matchingJobs || response.matchingJobs.length === 0) {
      console.log('⚠️  No jobs found for this search');
      return NextResponse.json({
        matchingJobs: [],
        message: 'No jobs found for your search criteria'
      });
    }

    // Map the response to our format
    const matchingJobs = response.matchingJobs.map((matchingJob) => {
      const job = matchingJob.job;

      // Safely extract data with fallbacks
      return {
        id: job.name || `job_${Date.now()}`,
        title: job.title || 'Untitled Position',
        company: job.companyDisplayName || job.company || 'Company Name Not Available',
        location: (job.addresses && job.addresses.length > 0)
          ? job.addresses.join(', ')
          : location,
        description: job.description
          ? job.description.substring(0, 300) + '...'  // Limit description length
          : 'No description available',
        jobUrl: (job.applicationInfo?.uris && job.applicationInfo.uris.length > 0)
          ? job.applicationInfo.uris[0]
          : '#',
        source: 'google',
        foundAt: new Date().toISOString(),
        salary: job.compensationInfo?.entries?.[0]?.description || 'Not specified',
        employmentType: job.employmentTypes?.[0] || 'Not specified',
      };
    });

    console.log('✅ [Job Search API] Success - returning', matchingJobs.length, 'jobs');

    return NextResponse.json({ matchingJobs });

  } catch (error) {
    console.error('❌ Google Talent Solution API error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });

    // Provide helpful error messages
    let errorMessage = 'Failed to fetch jobs from Google Talent Solution';

    if (error.code === 5) { // NOT_FOUND
      errorMessage = 'Tenant not found. Please run create-tenant.js to set up your tenant';
    } else if (error.code === 7) { // PERMISSION_DENIED / BILLING_DISABLED
      errorMessage = 'Google Cloud billing is not enabled or permission denied';
      console.log('💡 Falling back to mock data...');

      // Fallback to mock data if billing issue
      const mockJobs = searchMockJobs(query, location);
      return NextResponse.json({
        matchingJobs: mockJobs,
        source: 'mock',
        warning: 'Using mock data - Google Cloud billing not enabled',
        message: mockJobs.length === 0 ? 'No jobs found for your search criteria' : undefined
      });

    } else if (error.code === 3) { // INVALID_ARGUMENT
      errorMessage = 'Invalid search parameters. Please check your query and location';
    }

    // For other errors, also try fallback to mock data
    console.log('💡 Falling back to mock data due to error...');
    const mockJobs = searchMockJobs(query, location);

    return NextResponse.json({
      matchingJobs: mockJobs,
      source: 'mock',
      warning: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
