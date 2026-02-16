/**
 * Web Crawler Job Search Integration
 *
 * This module provides real-time job scraping from Pakistani job sites:
 * - Rozee.pk
 * - JobsAlert.pk
 * - Mustakbil.com
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Search jobs using the web crawler
 * @param {string} query - Job search query (e.g., "software engineer")
 * @param {string} location - Location (e.g., "Pakistan", "Karachi", "Lahore")
 * @returns {Promise<Array>} Array of job objects
 */
export async function searchJobsWithWebCrawler(query, location) {
    console.log(`🕷️  [WebCrawler] Searching for: "${query}" in ${location}`);

    try {
        // Path to the webcrawler directory
        const crawlerDir = path.join(process.cwd(), '..', 'webcroller');

        // Check if crawler directory exists
        try {
            await fs.access(crawlerDir);
        } catch {
            console.error('❌ [WebCrawler] Crawler directory not found:', crawlerDir);
            throw new Error('Web crawler not installed');
        }

        // Build the command to run the crawler
        // Using npm start with query and location arguments
        const command = `cd "${crawlerDir}" && node src/index.js "${query}" "${location}"`;

        console.log('🔧 [WebCrawler] Running crawler command...');
        console.log('Command:', command);

        // Execute the crawler with a timeout (2 minutes max)
        const { stdout, stderr } = await execAsync(command, {
            timeout: 120000, // 2 minutes
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        });

        if (stderr && !stderr.includes('warn:')) {
            console.warn('⚠️  [WebCrawler] Stderr output:', stderr);
        }

        console.log('✅ [WebCrawler] Crawler execution completed');

        // Find the most recent output file
        const dataDir = path.join(crawlerDir, 'data');
        const files = await fs.readdir(dataDir);

        // Look for processed-jobs JSON files
        const jsonFiles = files
            .filter(f => f.startsWith('processed-jobs-') && f.endsWith('.json'))
            .sort()
            .reverse();

        if (jsonFiles.length === 0) {
            console.warn('⚠️  [WebCrawler] No output files found');
            return [];
        }

        // Read the most recent file
        const latestFile = path.join(dataDir, jsonFiles[0]);
        console.log('📄 [WebCrawler] Reading results from:', latestFile);

        const fileContent = await fs.readFile(latestFile, 'utf-8');
        const crawlerData = JSON.parse(fileContent);

        console.log(`📊 [WebCrawler] Found ${crawlerData.jobs?.length || 0} jobs`);

        // Transform crawler jobs to our API format
        const jobs = (crawlerData.jobs || []).map(job => ({
            id: `crawler_${job.url?.split('/').pop() || Date.now()}`,
            title: job.title || 'Untitled Position',
            company: job.company || 'Company Not Specified',
            location: job.location || location,
            description: job.description || 'No description available',
            jobUrl: job.url || '#',
            source: 'webcrawler',
            crawlerSource: job.source || 'Unknown',
            foundAt: job.scrapedAt || new Date().toISOString(),
            salary: job.salary || 'Not specified',
            employmentType: job.jobType || 'Not specified',
            postedDate: job.postedDate || job.datePosted || 'Recently posted'
        }));

        console.log(`✅ [WebCrawler] Returning ${jobs.length} jobs from sources:`,
            crawlerData.summary?.sources);

        return jobs;

    } catch (error) {
        console.error('❌ [WebCrawler] Error:', error.message);

        if (error.killed) {
            throw new Error('Web crawler timeout - job sites may be slow');
        }

        throw error;
    }
}

/**
 * Quick check if web crawler is available
 * @returns {Promise<boolean>}
 */
export async function isWebCrawlerAvailable() {
    try {
        const crawlerDir = path.join(process.cwd(), '..', 'webcroller');
        await fs.access(crawlerDir);
        await fs.access(path.join(crawlerDir, 'src', 'index.js'));
        return true;
    } catch {
        return false;
    }
}
