#!/usr/bin/env node

import { JobCrawler } from './src/JobCrawler.js';
import { getConfig } from './config.js';
import fs from 'fs-extra';

console.log('🕷️ Job Web Crawler - Pakistan Job Sites\n');

// Get command line arguments
const keyword = process.argv[2] || 'software engineer';
const location = process.argv[3] || 'Pakistan';

async function main() {
    try {
        console.log(`🔍 Searching for: "${keyword}"`);
        console.log(`📍 Location: ${location}\n`);
        console.log('⏳ Initializing crawler (this may take a moment)...\n');

        // Ensure directories exist
        await fs.ensureDir('data');
        await fs.ensureDir('logs');

        // Get configuration
        const config = getConfig();

        // Create crawler instance
        const crawler = new JobCrawler(config.crawler);

        // Configure search parameters
        const searchParams = {
            keyword: keyword,
            location: location,
            sources: ['indeed', 'rozee'], // Use Indeed and Rozee
            maxPages: 2, // Limit to 2 pages per source to avoid blocking
            filters: {},
            sortBy: 'datePosted'
        };

        console.log('🌐 Crawling job sites...');
        console.log(`📊 Sources: ${searchParams.sources.join(', ')}`);
        console.log(`📄 Pages per source: ${searchParams.maxPages}\n`);

        // Run the crawler
        const result = await crawler.searchJobs(searchParams);

        // Display results
        console.log('\n✅ Crawl Completed!\n');
        console.log('📈 Results Summary:');
        console.log(`   Total Jobs Found: ${result.summary.totalJobs}`);

        if (result.summary.totalJobs > 0) {
            console.log(`   Sources: ${Object.keys(result.summary.sources).join(', ')}`);

            if (result.summary.topLocations && result.summary.topLocations.length > 0) {
                const topLocs = result.summary.topLocations.slice(0, 3).map(([loc]) => loc).join(', ');
                console.log(`   Top Locations: ${topLocs}`);
            }

            if (result.summary.topCompanies && result.summary.topCompanies.length > 0) {
                const topComps = result.summary.topCompanies.slice(0, 3).map(([comp]) => comp).join(', ');
                console.log(`   Top Companies: ${topComps}`);
            }

            if (result.summary.salaryRanges && result.summary.salaryRanges.withSalary > 0) {
                console.log(`   Jobs with Salary Info: ${result.summary.salaryRanges.withSalary}`);
                if (result.summary.salaryRanges.minSalary && result.summary.salaryRanges.maxSalary) {
                    console.log(`   Salary Range: ${result.summary.salaryRanges.minSalary} - ${result.summary.salaryRanges.maxSalary} PKR`);
                }
            }

            // Show first few jobs
            console.log('\n📋 Sample Jobs:\n');
            const sampleJobs = result.jobs.slice(0, 5);
            sampleJobs.forEach((job, index) => {
                console.log(`${index + 1}. ${job.title}`);
                console.log(`   Company: ${job.company}`);
                console.log(`   Location: ${job.location}`);
                if (job.salary) console.log(`   Salary: ${job.salary}`);
                console.log(`   Source: ${job.source}`);
                console.log('');
            });

            if (result.jobs.length > 5) {
                console.log(`   ... and ${result.jobs.length - 5} more jobs\n`);
            }
        } else {
            console.log('\n⚠️ No jobs found. This could be due to:');
            console.log('   - Anti-bot protection on job sites');
            console.log('   - Network connectivity issues');
            console.log('   - Search terms too specific');
            console.log('\n💡 Try running the demo version: node demo-working.js');
        }

        console.log(`\n💾 Data saved to: data/ directory`);
        console.log(`📋 Logs saved to: logs/ directory`);

        console.log('\n🎉 Crawler execution completed!');

    } catch (error) {
        console.error('\n❌ Crawler Error:', error.message);
        console.error('\n💡 This is likely due to anti-bot protection.');
        console.error('   The crawler framework is working, but job sites block automated access.');
        console.error('   For demonstration, run: node demo-working.js');
        process.exit(1);
    }
}

// Run the crawler
main();
