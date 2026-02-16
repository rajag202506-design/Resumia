import puppeteer from 'puppeteer';

async function testOtherPakistaniJobSites() {
    console.log('🧪 Testing OTHER Pakistani Job Sites\n');

    const sitesToTest = [
        {
            name: 'PakJobs.pk',
            url: 'https://www.pakjobs.pk/jobs/software-engineer',
        },
        {
            name: 'Mustakbil.com',
            url: 'https://mustakbil.com/jobs/in-pakistan',
        },
        {
            name: 'JobsAlert.pk',
            url: 'https://www.jobsalert.pk/?s=software+engineer',
        },
        {
            name: 'Bayrozgar.com',
            url: 'https://www.bayrozgar.com/',
        },
        {
            name: 'Careers360.pk',
            url: 'https://careers360.pk/jobs',
        }
    ];

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        });

        for (const site of sitesToTest) {
            console.log(`\n${'='.repeat(70)}`);
            console.log(`Testing: ${site.name}`);
            console.log(`URL: ${site.url}`);
            console.log('='.repeat(70));

            try {
                const page = await browser.newPage();
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                await page.evaluateOnNewDocument(() => {
                    Object.defineProperty(navigator, 'webdriver', { get: () => false });
                });

                console.log('⏳ Loading...');
                await page.goto(site.url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                await page.waitForTimeout(3000);

                const title = await page.title();
                console.log(`📄 Title: ${title}`);

                // Check for blocking
                const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());

                if (bodyText.includes('blocked') || bodyText.includes('captcha') || bodyText.includes('cloudflare')) {
                    console.log('❌ BLOCKED by protection\n');
                    await page.close();
                    continue;
                }

                // Look for job-related content
                const hasJobs = await page.evaluate(() => {
                    const text = document.body.innerText.toLowerCase();
                    const hasJobWords = text.includes('job') || text.includes('vacancy') || text.includes('career');

                    // Look for common job listing elements
                    const jobElements = document.querySelectorAll('a[href*="job"], div[class*="job"], article, .listing');

                    return {
                        hasJobWords,
                        elementCount: jobElements.length,
                        sample: Array.from(jobElements).slice(0, 3).map(el => ({
                            text: el.innerText.substring(0, 100),
                            href: el.href || el.querySelector('a')?.href
                        }))
                    };
                });

                if (hasJobs.hasJobWords && hasJobs.elementCount > 0) {
                    console.log(`✅ ACCESSIBLE - Found ${hasJobs.elementCount} potential job elements`);
                    console.log('\nSample jobs:');
                    hasJobs.sample.forEach((job, i) => {
                        if (job.text) {
                            console.log(`${i + 1}. ${job.text}...`);
                            if (job.href) console.log(`   URL: ${job.href}`);
                        }
                    });
                } else {
                    console.log('⚠️ Site accessible but no jobs found');
                    console.log('Body preview:', bodyText.substring(0, 200));
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

testOtherPakistaniJobSites();
