import { BaseCrawler } from './BaseCrawler.js';

/**
 * JobsAlert.pk Crawler - Extracts job listings from JobsAlert.pk
 */
export class JobsAlertCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('JobsAlert', options);
        this.baseUrl = 'https://www.jobsalert.pk';
    }

    /**
     * Main crawl method
     */
    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize crawler');
            }

            this.logger.info(`Starting JobsAlert crawl with params: ${JSON.stringify(searchParams)}`);

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
     * Build search URL for JobsAlert.pk
     */
    buildSearchUrl(searchParams) {
        const { keyword = 'software engineer', page = 1 } = searchParams;

        // JobsAlert uses WordPress search format
        const query = keyword.replace(/\s+/g, '+');
        let url = `${this.baseUrl}/?s=${query}`;

        // Add pagination if needed
        if (page > 1) {
            url += `&paged=${page}`;
        }

        return url;
    }

    /**
     * Extract job data from JobsAlert.pk page
     */
    async extractJobData() {
        try {
            const jobs = await this.page.evaluate(() => {
                const jobElements = document.querySelectorAll('article, div[class*="job"], .post, .entry');
                const extractedJobs = [];

                jobElements.forEach((el) => {
                    const allText = el.innerText;
                    if (!allText || allText.length < 50) return;

                    // Look for job indicators
                    const lowerText = allText.toLowerCase();
                    if (lowerText.includes('job') ||
                        lowerText.includes('vacancy') ||
                        lowerText.includes('position')) {

                        // Look for job title (usually in an <a> or <h>)
                        const titleElem = el.querySelector('h1, h2, h3, h4, a');
                        const title = titleElem ? titleElem.innerText.trim() : '';

                        // Get link
                        const linkElem = el.querySelector('a');
                        const url = linkElem ? linkElem.href : '';

                        // Look for organization/company
                        const orgMatch = allText.match(/(Government|Ministry|Department|Company|Organization|University|Hospital|Bank|Authority|Commission|Board|Agency|NADRA|PEC|PSEB|MUET|UET)/i);
                        const company = orgMatch ? orgMatch[0] : '';

                        // Look for location
                        const locationMatch = allText.match(/(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta|Pakistan|Sindh|Punjab|KPK|Balochistan|Jamshoro|Risalpur)/i);
                        const location = locationMatch ? locationMatch[0] : '';

                        // Look for date
                        const dateMatch = allText.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
                        const postedDate = dateMatch ? dateMatch[0] : '';

                        if (title && url && title.length > 10 && title.length < 150) {
                            // Filter out non-job content
                            if (!title.toLowerCase().includes('chand ki tarikh') &&
                                !title.toLowerCase().includes('login') &&
                                !title.toLowerCase().includes('search') &&
                                !title.toLowerCase().includes('contact')) {

                                extractedJobs.push({
                                    title,
                                    company: company || 'Various Organizations',
                                    location: location || 'Pakistan',
                                    url,
                                    postedDate: postedDate || 'Recently Posted',
                                    description: allText.substring(0, 250).replace(/\n/g, ' ').trim(),
                                    source: 'JobsAlert.pk'
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
            console.error('Error extracting job data from JobsAlert:', error.message);
            return [];
        }
    }

    /**
     * Normalize job data to standard format
     */
    normalizeJobData(rawJob) {
        return {
            title: rawJob.title,
            company: rawJob.company || 'Various Organizations',
            location: rawJob.location || 'Pakistan',
            description: rawJob.description || rawJob.title,
            url: rawJob.url,
            source: 'JobsAlert.pk',
            scrapedAt: new Date().toISOString(),
            jobType: this.extractJobType(rawJob.description),
            postedDate: rawJob.postedDate || 'Recently Posted'
        };
    }

    /**
     * Extract job type from description
     */
    extractJobType(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('full time') || lowerText.includes('full_time')) return 'Full-time';
        if (lowerText.includes('part time') || lowerText.includes('part_time')) return 'Part-time';
        if (lowerText.includes('contract')) return 'Contract';
        if (lowerText.includes('internship')) return 'Internship';
        return 'Full-time';
    }
}
