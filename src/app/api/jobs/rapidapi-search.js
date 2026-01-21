/**
 * RapidAPI JSearch Integration
 * Fetches REAL jobs from Google, LinkedIn, Indeed, etc.
 * FREE tier: 150 requests/month
 * Returns up to 30 jobs per search (3 pages × 10 jobs)
 */

import axios from 'axios';

/**
 * Search jobs using RapidAPI JSearch
 * @param {string} query - Job title/keywords
 * @param {string} location - Location (city, country)
 * @returns {Promise<Array>} - Array of job objects
 */
export async function searchJobsWithRapidAPI(query, location) {
  const apiKey = process.env.RAPIDAPI_KEY;

  console.log('🔧 Environment check:');
  console.log('- USE_RAPIDAPI:', process.env.USE_RAPIDAPI);
  console.log('- RAPIDAPI_KEY exists:', !!apiKey);
  console.log('- RAPIDAPI_KEY length:', apiKey ? apiKey.length : 0);

  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY not configured in environment variables');
  }

  console.log(`🔍 Searching RapidAPI for: "${query}" in "${location}"`);

  try {
    const searchQuery = `${query} in ${location}`;
    console.log('📋 Search query:', searchQuery);

    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: searchQuery,
        page: '1',
        num_pages: '1',
        date_posted: 'all',
      },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📦 Response data structure:', Object.keys(response.data));

    const jobs = response.data.data || [];

    console.log(`✅ RapidAPI (JSearch) returned ${jobs.length} jobs`);

    if (jobs.length === 0) {
      console.log('⚠️ No jobs found in RapidAPI response');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('📋 Sample job titles:', jobs.slice(0, 3).map(j => j.job_title));
    }

    // Transform JSearch response to our format
    return jobs.map((job) => ({
      id: job.job_id || `job_${Date.now()}_${Math.random()}`,
      title: job.job_title || 'Untitled Position',
      company: job.employer_name || 'Company Not Specified',
      location: job.job_city && job.job_country
        ? `${job.job_city}, ${job.job_country}`
        : location,
      description: job.job_description
        ? job.job_description.substring(0, 300) + '...'
        : 'No description available',
      jobUrl: job.job_apply_link || job.job_google_link || '#',
      source: 'rapidapi-jsearch',
      foundAt: new Date().toISOString(),
      salary: formatSalary(job),
      employmentType: job.job_employment_type || 'Not specified',
      postedAt: job.job_posted_at_datetime_utc || null,
      publisher: job.job_publisher || 'Unknown',
      isRemote: job.job_is_remote || false,
    }));

  } catch (error) {
    console.error('❌ RapidAPI search failed:', error.message);
    console.error('Error type:', error.constructor.name);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));

      if (error.response.status === 429) {
        throw new Error('RapidAPI rate limit exceeded. Please try again later.');
      }

      if (error.response.status === 403) {
        throw new Error('RapidAPI authentication failed. Check your API key.');
      }

      if (error.response.status === 400) {
        throw new Error('Invalid search parameters: ' + JSON.stringify(error.response.data));
      }
    } else if (error.request) {
      console.error('Request was made but no response received');
      console.error('Request details:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    throw error;
  }
}

/**
 * Format salary information
 */
function formatSalary(job) {
  if (job.job_min_salary && job.job_max_salary) {
    const currency = job.job_salary_currency || 'USD';
    const period = job.job_salary_period || 'YEAR';

    return `${currency} ${formatNumber(job.job_min_salary)} - ${formatNumber(job.job_max_salary)} per ${period.toLowerCase()}`;
  }

  return 'Not specified';
}

/**
 * Format numbers with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Test RapidAPI connection
 */
export async function testRapidAPIConnection() {
  try {
    console.log('🧪 Testing RapidAPI connection...');
    const jobs = await searchJobsWithRapidAPI('software engineer', 'Pakistan');
    console.log('✅ RapidAPI test successful!');
    console.log(`Found ${jobs.length} jobs`);
    return true;
  } catch (error) {
    console.error('❌ RapidAPI test failed:', error.message);
    return false;
  }
}
