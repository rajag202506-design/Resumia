import { BaseCrawler } from './BaseCrawler.js';

/**
 * Mustakbil.com Crawler - Extracts job listings from Mustakbil.com
 */
export class MustakbilCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('Mustakbil', options);
        this.baseUrl = 'https://www.mustakbil.com';
    }

    /**
     * Main crawl method
     */
    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize crawler');
            }

            this.logger.info(`Starting Mustakbil crawl with params: ${JSON.stringify(searchParams)}`);

            const maxPages = searchParams.maxPages || 3;
            let currentPage = 1;

            while (currentPage <= maxPages) {
                const searchUrl = this.buildSearchUrl({
                    ...searchParams,
                    page: currentPage
                });

                if (!await this.navigateToPage(searchUrl)) {
                    this.logger.warn(`Failed to load page ${currentPage}, skipping...`);
                    currentPage++;
                    continue;
                }

                await this.randomDelay(3000, 5000);

                const pageJobs = await this.extractJobData();

                if (pageJobs.length === 0) {
                    this.logger.info('No more jobs found, stopping crawl');
                    break;
                }

                this.jobs.push(...pageJobs);
                this.logger.info(`Page ${currentPage}: Found ${pageJobs.length} jobs (Total: ${this.jobs.length})`);

                currentPage++;

                if (currentPage <= maxPages) {
                    await this.randomDelay(2000, 4000);
                }
            }

            this.logger.info(`Crawl completed. Total jobs found: ${this.jobs.length}`);
            return this.jobs;

        } catch (error) {
            this.logger.error(`Crawl failed: ${error.message}`);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    /**
     * Build search URL for Mustakbil.com
     */
    buildSearchUrl(searchParams) {
        const { keyword = 'software engineer', location = '', page = 1 } = searchParams;

        // Mustakbil uses a simple /jobs endpoint
        // For search, we'll use their jobs page and filter client-side
        let url = `${this.baseUrl}/jobs`;

        // Add search query if provided
        if (keyword && keyword !== 'software engineer') {
            const query = keyword.replace(/\s+/g, '-').toLowerCase();
            url += `/search?q=${query}`;
        }

        // Add pagination if needed
        if (page > 1) {
            url += url.includes('?') ? '&' : '?';
            url += `page=${page}`;
        }

        return url;
    }

    /**
     * Extract job data from Mustakbil.com page
     */
    async extractJobData() {
        try {
            const jobs = await this.page.evaluate(() => {
                const jobElements = document.querySelectorAll('div[class*="job"], article, li, .card, [class*="listing"]');
                const extractedJobs = [];

                jobElements.forEach((el) => {
                    const allText = el.innerText;
                    if (!allText || allText.length < 30) return;

                    // Look for job-related keywords
                    const lowerText = allText.toLowerCase();
                    const hasJobKeywords = lowerText.includes('engineer') ||
                                          lowerText.includes('developer') ||
                                          lowerText.includes('software') ||
                                          lowerText.includes('manager') ||
                                          lowerText.includes('analyst') ||
                                          lowerText.includes('designer') ||
                                          lowerText.includes('executive');

                    if (hasJobKeywords) {
                        // Look for job title
                        const titleElem = el.querySelector('h1, h2, h3, h4, h5, a[href*="job"]');
                        const title = titleElem ? titleElem.innerText.trim() : '';

                        // Get link
                        const linkElem = el.querySelector('a');
                        const url = linkElem ? linkElem.href : '';

                        // Look for company name (usually appears before location)
                        const companyMatch = allText.match(/([A-Z][a-zA-Z\s&]+(?:Limited|Ltd|Pvt|Private|Software|Technologies|Solutions|Services|Group|International|Industries|Systems|Traders|Packages)?)/);
                        const company = companyMatch ? companyMatch[0].trim() : '';

                        // Look for location
                        const locationMatch = allText.match(/(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta|Pakistan|Hyderabad|Sialkot)/i);
                        const location = locationMatch ? locationMatch[0] : '';

                        // Look for job type
                        const jobTypeMatch = allText.match(/(Full Time|Part Time|Contract|Internship|Remote)/i);
                        const jobType = jobTypeMatch ? jobTypeMatch[0] : 'Full Time';

                        // Look for posted date
                        const postedMatch = allText.match(/Posted\s+(\d+\s+(hours?|days?|weeks?|months?)\s+ago)/i);
                        const posted = postedMatch ? postedMatch[1] : '';

                        if (title && url && title.length > 5 && title.length < 150) {
                            // Filter out navigation/menu items
                            if (!title.toLowerCase().includes('login') &&
                                !title.toLowerCase().includes('register') &&
                                !title.toLowerCase().includes('home') &&
                                !title.toLowerCase().includes('about')) {

                                extractedJobs.push({
                                    title,
                                    company: company || 'Not specified',
                                    location: location || 'Pakistan',
                                    url,
                                    jobType,
                                    postedDate: posted || 'Recently posted',
                                    description: allText.substring(0, 250).replace(/\n/g, ' ').trim(),
                                    source: 'Mustakbil.com'
                                });
                            }
                        }
                    }
                });

                // Remove duplicates by URL
                const unique = [];
                const seen = new Set();
                extractedJobs.forEach(job => {
                    if (!seen.has(job.url)) {
                        seen.add(job.url);
                        unique.push(job);
                    }
                });

                return unique.slice(0, 15);
            });

            // Normalize job data
            return jobs.map(job => this.normalizeJobData(job));

        } catch (error) {
            console.error('Error extracting job data from Mustakbil:', error.message);
            return [];
        }
    }

    /**
     * Normalize job data to standard format
     */
    normalizeJobData(rawJob) {
        return {
            title: rawJob.title,
            company: rawJob.company || 'Not specified',
            location: rawJob.location || 'Pakistan',
            description: rawJob.description || rawJob.title,
            url: rawJob.url,
            source: 'Mustakbil.com',
            scrapedAt: new Date().toISOString(),
            jobType: rawJob.jobType || 'Full Time',
            postedDate: rawJob.postedDate || 'Recently posted'
        };
    }
}
