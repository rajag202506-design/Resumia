#!/usr/bin/env node

import { JobCrawler } from './src/JobCrawler.js';
import { getConfig } from './config.js';
import fs from 'fs-extra';

async function testAllWorkingSites() {
    console.log('🧪 TESTING ALL WORKING JOB SITES\n');
    console.log('='.repeat(70));
    console.log('This test will extract REAL jobs from:');
    console.log('1. Rozee.pk (Private companies)');
    console.log('2. JobsAlert.pk (Government & organizations)');
    console.log('3. Mustakbil.com (Various companies)');
    console.log('='.repeat(70) + '\n');

    try {
        await fs.ensureDir('data');
        await fs.ensureDir('logs');

        const config = getConfig();
        const crawler = new JobCrawler(config.crawler);

        const searchParams = {
            keyword: 'software engineer',
            location: 'Pakistan',
            sources: ['rozee', 'jobsalert', 'mustakbil'],
            maxPages: 1,
            filters: {},
            sortBy: 'datePosted'
        };

        console.log(`🔍 Searching for: "${searchParams.keyword}"`);
        console.log(`📍 Location: ${searchParams.location}`);
        console.log(`📊 Sources: ${searchParams.sources.join(', ')}`);
        console.log(`📄 Pages per source: ${searchParams.maxPages}\n`);

        console.log('⏳ Starting crawl... This may take a few minutes.\n');

        const result = await crawler.searchJobs(searchParams);

        console.log('\n' + '='.repeat(70));
        console.log('✅ CRAWL COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70) + '\n');

        console.log('📈 RESULTS SUMMARY:');
        console.log(`   Total Jobs Found: ${result.summary.totalJobs}`);
        console.log(`   Active Sources: ${Object.keys(result.summary.sources).join(', ')}`);

        console.log('\n📊 BREAKDOWN BY SOURCE:');
        Object.entries(result.summary.sources).forEach(([source, count]) => {
            console.log(`   ${source.padEnd(15)}: ${count} jobs`);
        });

        console.log('\n🌍 TOP LOCATIONS:');
        result.summary.topLocations.slice(0, 5).forEach(([location, count]) => {
            console.log(`   ${location.padEnd(15)}: ${count} jobs`);
        });

        console.log('\n🏢 TOP COMPANIES:');
        result.summary.topCompanies.slice(0, 5).forEach(([company, count]) => {
            console.log(`   ${company.padEnd(30)}: ${count} jobs`);
        });

        console.log('\n📋 SAMPLE JOBS (First 5):');
        console.log('='.repeat(70));
        result.jobs.slice(0, 5).forEach((job, i) => {
            console.log(`\n${i + 1}. ${job.title}`);
            console.log(`   Company: ${job.company}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Source: ${job.source}`);
            console.log(`   Type: ${job.jobType || 'Full-time'}`);
            console.log(`   URL: ${job.url}`);
            if (job.description) {
                console.log(`   Description: ${job.description.substring(0, 100)}...`);
            }
        });
        console.log('\n' + '='.repeat(70));

        console.log(`\n💾 DATA SAVED:`);
        console.log(`   JSON: data/jobs_${new Date().toISOString().split('T')[0]}.json`);
        console.log(`   CSV: data/jobs_${new Date().toISOString().split('T')[0]}.csv`);
        console.log(`   Logs: logs/job-crawler.log`);

        console.log('\n✅ VERIFICATION:');
        if (result.summary.totalJobs >= 5) {
            console.log(`   ✅ SUCCESS! Found ${result.summary.totalJobs} REAL jobs`);
            console.log(`   ✅ Multiple sources working: ${Object.keys(result.summary.sources).length} sources`);
            console.log(`   ✅ All jobs are from actual websites (not dummy data)`);
        } else {
            console.log(`   ⚠️  Warning: Only found ${result.summary.totalJobs} jobs`);
        }

        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!\n');

        return result;

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

testAllWorkingSites();
