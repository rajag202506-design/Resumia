import puppeteer from 'puppeteer';

async function testMultipleSites() {
    console.log('🧪 Testing Multiple Job Sites for Real Jobs\n');

    const sitesToTest = [
        {
            name: 'Rozee.pk',
            url: 'https://www.rozee.pk/job/jsearch/q/software-engineer',
            selectors: [
                '.job-listing',
                '.job-card',
                'div[data-job-id]',
                'article',
                '.list-group-item'
            ]
        },
        {
            name: 'Mustakbil.com',
            url: 'https://www.mustakbil.com/jobs/search?q=software+engineer',
            selectors: [
                '.job-listing',
                '.job-item',
                'div.job',
                'article'
            ]
        },
        {
            name: 'Bayrozgar.com',
            url: 'https://bayrozgar.com/jobs/search/software-engineer',
            selectors: [
                '.job-listing',
                '.job-card',
                'div.job'
            ]
        }
    ];

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        for (const site of sitesToTest) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`Testing: ${site.name}`);
            console.log(`URL: ${site.url}`);
            console.log('='.repeat(60));

            try {
                const page = await browser.newPage();

                // Anti-detection
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                await page.evaluateOnNewDocument(() => {
                    Object.defineProperty(navigator, 'webdriver', { get: () => false });
                });

                console.log('⏳ Loading page...');
                await page.goto(site.url, {
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                await page.waitForTimeout(3000);

                const title = await page.title();
                console.log(`📄 Page Title: ${title}`);

                // Check for blocking
                const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());

                if (bodyText.includes('blocked') || bodyText.includes('captcha')) {
                    console.log('❌ BLOCKED by anti-bot protection\n');
                    await page.close();
                    continue;
                }

                // Try each selector
                let foundJobs = false;
                for (const selector of site.selectors) {
                    const elements = await page.$$(selector);
                    if (elements.length > 0) {
                        console.log(`✅ Found ${elements.length} elements with selector: "${selector}"`);

                        // Extract job data
                        const jobs = await page.evaluate((sel) => {
                            const jobElements = document.querySelectorAll(sel);
                            const extracted = [];

                            jobElements.forEach((el, index) => {
                                if (index < 5) { // First 5 jobs
                                    const text = el.innerText;
                                    const links = el.querySelectorAll('a');
                                    const title = links.length > 0 ? links[0].innerText : '';

                                    extracted.push({
                                        title: title || text.substring(0, 50),
                                        fullText: text.substring(0, 200)
                                    });
                                }
                            });

                            return extracted;
                        }, selector);

                        if (jobs.length > 0) {
                            console.log(`\n📋 Sample Jobs Found:`);
                            jobs.forEach((job, i) => {
                                console.log(`\n${i + 1}. ${job.title}`);
                                console.log(`   ${job.fullText.split('\n')[0]}`);
                            });
                            foundJobs = true;
                            break;
                        }
                    }
                }

                if (!foundJobs) {
                    console.log('❌ No job elements found with any selector');
                    console.log('Body text preview:', bodyText.substring(0, 300));
                }

                await page.close();

            } catch (error) {
                console.log(`❌ Error: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('\n✅ Testing complete!');
        }
    }
}

testMultipleSites();
