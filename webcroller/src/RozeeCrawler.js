import { BaseCrawler } from './BaseCrawler.js';

export class RozeeCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('Rozee', options);
        this.baseUrl = 'https://www.rozee.pk';
    }

    buildSearchUrl(searchParams) {
        const {
            keyword = '',
            location = '',
            page = 1
        } = searchParams;

        // Use the jsearch URL format that works
        const query = keyword.replace(/\s+/g, '-').toLowerCase();
        let url = `${this.baseUrl}/job/jsearch/q/${query}`;

        if (page > 1) {
            url += `/fpn/${page}`;
        }

        return url;
    }

    async extractJobData() {
        try {
            // Wait a bit for JavaScript to load
            await this.page.waitForTimeout(3000);

            const jobs = await this.page.evaluate(() => {
                // Find all divs and articles that might contain jobs
                const allElements = document.querySelectorAll('div, article, li');
                const extractedJobs = [];

                allElements.forEach((el) => {
                    const allText = el.innerText;
                    if (!allText || allText.length < 50 || allText.length > 1000) return;

                    // Look for job indicators
                    if (allText.toLowerCase().includes('engineer') ||
                        allText.toLowerCase().includes('developer') ||
                        allText.toLowerCase().includes('manager') ||
                        allText.toLowerCase().includes('analyst')) {

                        // Look for job title in heading or link
                        const titleElem = el.querySelector('h2, h3, h4, a[href*="job"]');
                        if (!titleElem) return;

                        const title = titleElem.innerText.trim();
                        if (!title || title.length < 5 || title.length > 100) return;

                        // Skip filter/navigation elements
                        if (title.toLowerCase().includes('filter') ||
                            title.toLowerCase().includes('select one') ||
                            title.toLowerCase().includes('experience level')) {
                            return;
                        }

                        // Look for company name
                        const companyMatch = allText.match(/([A-Z][a-zA-Z\s&]+(?:Limited|Ltd|Inc|Corp|Software|Technologies|Solutions|Systems|Group|International)?)/);
                        const company = companyMatch ? companyMatch[0].trim() : 'Not specified';

                        // Look for location
                        const locationMatch = allText.match(/(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Hyderabad|Quetta|All Cities|Multiple Cities)/i);
                        const location = locationMatch ? locationMatch[0] : 'Pakistan';

                        // Look for posted date
                        const dateMatch = allText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/);
                        const postedDate = dateMatch ? dateMatch[0] : '';

                        // Get link
                        const linkElem = el.querySelector('a[href*="rozee.pk"]');
                        const url = linkElem ? linkElem.href : '';

                        // Get description (first 200 chars)
                        const description = allText.substring(0, 200).replace(/\n/g, ' ').trim();

                        // Only add if we have essential fields
                        if (title && title.length > 5 && url && url.includes('rozee.pk')) {
                            extractedJobs.push({
                                title,
                                company,
                                location,
                                salary: '',
                                description,
                                url,
                                datePosted: postedDate,
                                jobType: ''
                            });
                        }
                    }
                });

                // Remove duplicates based on URL
                const unique = [];
                const seen = new Set();
                extractedJobs.forEach(job => {
                    if (!seen.has(job.url)) {
                        seen.add(job.url);
                        unique.push(job);
                    }
                });

                return unique.slice(0, 10); // Return max 10 jobs
            });

            this.logger.info(`Extracted ${jobs.length} jobs from page`);
            return jobs.map(job => this.normalizeJobData(job));

        } catch (error) {
            this.logger.error(`Error extracting job data: ${error.message}`);
            return [];
        }
    }

    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize crawler');
            }

            this.logger.info(`Starting Rozee crawl with params: ${JSON.stringify(searchParams)}`);
            
            const maxPages = searchParams.maxPages || 5;
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

                const hasNextPage = await this.page.evaluate(() => {
                    const nextButton = document.querySelector('.next, .pagination .next, a[title*="Next"]');
                    return nextButton && !nextButton.classList.contains('disabled');
                });

                if (!hasNextPage && currentPage <= maxPages) {
                    this.logger.info('No next page found, stopping crawl');
                    break;
                }

                await this.randomDelay(4000, 6000);
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

    async crawlJobDetails(jobUrl) {
        try {
            if (!await this.navigateToPage(jobUrl)) {
                return null;
            }

            await this.page.waitForSelector('.job-detail, .job-description, .description', { timeout: 10000 });

            const jobDetails = await this.page.evaluate(() => {
                const descriptionElement = document.querySelector('.job-detail, .job-description, .description');
                const salaryElement = document.querySelector('.salary, .package, .compensation');
                const requirementsElement = document.querySelector('.requirements, .qualifications');
                const benefitsElement = document.querySelector('.benefits, .perks');
                
                return {
                    fullDescription: descriptionElement?.textContent?.trim() || '',
                    salary: salaryElement?.textContent?.trim() || '',
                    requirements: requirementsElement?.textContent?.trim() || '',
                    benefits: benefitsElement?.textContent?.trim() || ''
                };
            });

            return jobDetails;
        } catch (error) {
            this.logger.error(`Error crawling job details: ${error.message}`);
            return null;
        }
    }

    normalizeJobData(job) {
        const normalized = super.normalizeJobData(job);
        
        if (job.url && !job.url.startsWith('http')) {
            normalized.url = `${this.baseUrl}${job.url}`;
        }

        if (normalized.location) {
            normalized.location = normalized.location
                .replace(/\s*,\s*Pakistan/i, '')
                .replace(/\s*,\s*PK/i, '')
                .trim();
        }

        if (job.salary && job.salary.includes('Rs')) {
            normalized.salary = job.salary.replace(/Rs\.?\s*/g, 'PKR ');
        }

        if (job.datePosted) {
            try {
                const dateText = job.datePosted.toLowerCase();
                if (dateText.includes('today') || dateText.includes('آج')) {
                    normalized.datePosted = new Date().toISOString();
                } else if (dateText.includes('yesterday') || dateText.includes('کل')) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    normalized.datePosted = yesterday.toISOString();
                } else if (dateText.match(/\d+ days? ago/) || dateText.match(/\d+ دن/)) {
                    const days = parseInt(dateText.match(/\d+/)[0]);
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    normalized.datePosted = date.toISOString();
                }
            } catch (error) {
                this.logger.warn(`Failed to parse date: ${job.datePosted}`);
            }
        }

        return normalized;
    }
}