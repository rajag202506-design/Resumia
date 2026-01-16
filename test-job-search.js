/**
 * Test script for job search API
 * Tests: Software Developer in Islamabad
 */

const fetch = require('node-fetch');

async function testJobSearch() {
  console.log('🧪 Testing Job Search API...\n');
  console.log('📋 Test Parameters:');
  console.log('   Query: Software Developer');
  console.log('   Location: Islamabad\n');

  const baseUrl = 'http://localhost:3000';
  const query = encodeURIComponent('Software Developer');
  const location = encodeURIComponent('Islamabad');
  const url = `${baseUrl}/api/jobs/search?query=${query}&location=${location}`;

  console.log('🔗 API URL:', url);
  console.log('\n⏳ Making request...\n');

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', response.headers.get('content-type'));
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.matchingJobs && data.matchingJobs.length > 0) {
      console.log('\n✅ SUCCESS! Found', data.matchingJobs.length, 'jobs:');
      console.log('\n' + '='.repeat(80));

      data.matchingJobs.forEach((job, index) => {
        console.log(`\n📌 Job ${index + 1}:`);
        console.log('   Title:', job.title);
        console.log('   Company:', job.company);
        console.log('   Location:', job.location);
        console.log('   Salary:', job.salary);
        console.log('   Description:', job.description.substring(0, 100) + '...');
        console.log('   Apply URL:', job.jobUrl);
      });

      console.log('\n' + '='.repeat(80));
    } else {
      console.log('\n⚠️  No jobs found or error occurred');

      if (data.error) {
        console.log('\n❌ Error:', data.error);
        if (data.details) {
          console.log('   Details:', data.details);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Server is not running!');
      console.error('   Please start the dev server first:');
      console.error('   npm run dev');
    }
  }
}

// Check if server is running first
async function checkServer() {
  console.log('🔍 Checking if dev server is running...\n');

  try {
    const response = await fetch('http://localhost:3000');
    console.log('✅ Server is running!\n');
    return true;
  } catch (error) {
    console.log('❌ Server is NOT running!');
    console.log('   Please start it first: npm run dev\n');
    return false;
  }
}

// Run the test
(async () => {
  const serverRunning = await checkServer();

  if (serverRunning) {
    await testJobSearch();
  } else {
    console.log('⚠️  Cannot test API without running server.');
    console.log('\nSteps to test:');
    console.log('1. Open a terminal and run: npm run dev');
    console.log('2. Wait for server to start');
    console.log('3. Run this test again: node test-job-search.js');
  }
})();
