import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import winston from 'winston';
import UserAgent from 'user-agents';

export class BaseCrawler {
    constructor(name, options = {}) {
        this.name = name;
        this.options = {
            headless: true,
            slowMo: 100,
            timeout: 30000,
            maxRetries: 3,
            delay: 2000,
            ...options
        };
        
        this.browser = null;
        this.page = null;
        this.jobs = [];
        
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${this.name}] ${level}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: `logs/${this.name}.log` })
            ]
        });
    }

    async initialize() {
        try {
            this.logger.info('Initializing browser with anti-detection...');
            this.browser = await puppeteer.launch({
                headless: "new", // Use new headless mode
                slowMo: this.options.slowMo,
                protocolTimeout: 60000,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-blink-features=AutomationControlled', // Hide automation
                    '--disable-features=VizDisplayCompositor',
                    '--window-size=1920,1080'
                ]
            });

            this.page = await this.browser.newPage();

            // Use realistic desktop user agent
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            await this.page.setViewport({ width: 1920, height: 1080 });

            // Remove webdriver flag and other detection signals
            await this.page.evaluateOnNewDocument(() => {
                // Overwrite the `navigator.webdriver` property
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });

                // Overwrite the `plugins` property
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });

                // Overwrite the `languages` property
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });

                // Mock Chrome runtime
                window.chrome = {
                    runtime: {},
                };

                // Mock permissions
                const originalQuery = window.navigator.permissions.query;
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        originalQuery(parameters)
                );
            });

            // Set extra HTTP headers
            await this.page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'max-age=0'
            });

            // Block unnecessary resources to speed up
            await this.page.setRequestInterception(true);
            this.page.on('request', (req) => {
                if (req.resourceType() === 'stylesheet' ||
                    req.resourceType() === 'image' ||
                    req.resourceType() === 'font' ||
                    req.resourceType() === 'media') {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            this.logger.info('Browser initialized successfully with anti-detection');
            return true;
        } catch (error) {
            this.logger.error(`Failed to initialize browser: ${error.message}`);
            return false;
        }
    }

    async navigateToPage(url, retries = 0) {
        try {
            this.logger.info(`Navigating to: ${url}`);

            // Navigate with longer timeout
            await this.page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for page to fully load
            await this.page.waitForTimeout(3000 + Math.random() * 2000);

            // Simulate human-like scrolling
            await this.page.evaluate(() => {
                window.scrollBy(0, Math.floor(Math.random() * 300));
            });

            await this.page.waitForTimeout(1000 + Math.random() * 1000);

            // Check if we got blocked
            const pageTitle = await this.page.title();
            const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase());

            if (pageTitle.toLowerCase().includes('blocked') ||
                pageText.includes('cloudflare') ||
                pageText.includes('request blocked') ||
                pageText.includes('access denied')) {
                throw new Error('Page blocked by anti-bot protection');
            }

            this.logger.info('Page loaded successfully');
            return true;
        } catch (error) {
            if (retries < this.options.maxRetries) {
                this.logger.warn(`Navigation failed, retrying... (${retries + 1}/${this.options.maxRetries})`);
                await this.delay(5000 + Math.random() * 5000); // Longer delay before retry
                return this.navigateToPage(url, retries + 1);
            }
            this.logger.error(`Failed to navigate to ${url}: ${error.message}`);
            return false;
        }
    }

    async extractJobData(selectors) {
        throw new Error('extractJobData method must be implemented by subclass');
    }

    async crawl(searchParams) {
        throw new Error('crawl method must be implemented by subclass');
    }

    normalizeJobData(job) {
        return {
            title: job.title?.trim() || 'N/A',
            company: job.company?.trim() || 'N/A',
            location: job.location?.trim() || 'N/A',
            salary: job.salary?.trim() || 'Not specified',
            description: job.description?.trim() || 'N/A',
            url: job.url || 'N/A',
            source: this.name,
            datePosted: job.datePosted || new Date().toISOString(),
            extractedAt: new Date().toISOString()
        };
    }

    async saveResults(format = 'json') {
        try {
            await fs.ensureDir('data');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `data/${this.name}-jobs-${timestamp}`;

            if (format === 'json') {
                const filepath = `${filename}.json`;
                await fs.writeJson(filepath, this.jobs, { spaces: 2 });
                this.logger.info(`Results saved to ${filepath}`);
            } else if (format === 'csv') {
                const createCsvWriter = (await import('csv-writer')).createObjectCsvWriter;
                const csvWriter = createCsvWriter({
                    path: `${filename}.csv`,
                    header: [
                        { id: 'title', title: 'Title' },
                        { id: 'company', title: 'Company' },
                        { id: 'location', title: 'Location' },
                        { id: 'salary', title: 'Salary' },
                        { id: 'description', title: 'Description' },
                        { id: 'url', title: 'URL' },
                        { id: 'source', title: 'Source' },
                        { id: 'datePosted', title: 'Date Posted' },
                        { id: 'extractedAt', title: 'Extracted At' }
                    ]
                });
                await csvWriter.writeRecords(this.jobs);
                this.logger.info(`Results saved to ${filename}.csv`);
            }

            return this.jobs.length;
        } catch (error) {
            this.logger.error(`Failed to save results: ${error.message}`);
            return 0;
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.delay(delay);
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                this.logger.info('Browser closed successfully');
            }
        } catch (error) {
            this.logger.error(`Error during cleanup: ${error.message}`);
        }
    }

    getJobCount() {
        return this.jobs.length;
    }

    clearJobs() {
        this.jobs = [];
    }
}