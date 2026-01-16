/**
 * Script to create a tenant in Google Cloud Talent Solution
 * Run this ONCE to set up your tenant, then save the tenant ID in .env.local
 */

const { TenantServiceClient } = require('@google-cloud/talent').v4;

async function createTenant() {
  console.log('🚀 Creating Google Cloud Talent Solution Tenant...\n');

  try {
    // Initialize the client
    const tenantClient = new TenantServiceClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json'
    });

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'my-first-project-442612';
    const parent = `projects/${projectId}`;

    console.log('📍 Project:', projectId);
    console.log('📍 Parent path:', parent);
    console.log('📍 Credentials file:', process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json');
    console.log('\n⏳ Creating tenant...\n');

    // Create the tenant
    const [tenant] = await tenantClient.createTenant({
      parent: parent,
      tenant: {
        externalId: 'resumia-tenant-' + Date.now(),
        name: 'Resumia Job Search Tenant',
      },
    });

    console.log('✅ SUCCESS! Tenant created successfully!\n');
    console.log('📋 Tenant Details:');
    console.log('   Name:', tenant.name);
    console.log('   External ID:', tenant.externalId);
    console.log('\n');

    // Extract tenant ID from the name (format: projects/PROJECT_ID/tenants/TENANT_ID)
    const tenantId = tenant.name.split('/').pop();

    console.log('🎉 IMPORTANT: Add this to your .env.local file:\n');
    console.log(`GOOGLE_CLOUD_TENANT_ID="${tenantId}"`);
    console.log('\n');
    console.log('Copy the line above and paste it into your .env.local file!');

  } catch (error) {
    console.error('❌ ERROR creating tenant:', error.message);
    console.error('\nFull error:', error);

    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n⚠️  Permission denied. Make sure:');
      console.error('   1. Cloud Talent Solution API is enabled');
      console.error('   2. Service account has "Cloud Talent Solution Job Seeker" role');
      console.error('   3. Credentials file path is correct');
    }

    if (error.message.includes('NOT_FOUND')) {
      console.error('\n⚠️  Project not found. Make sure:');
      console.error('   1. GOOGLE_CLOUD_PROJECT_ID is correct');
      console.error('   2. Billing is enabled for the project');
    }
  }
}

// Run the function
createTenant();
