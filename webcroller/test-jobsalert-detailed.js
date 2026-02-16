import puppeteer from 'puppeteer';

async function testJobsAlertDetailed() {
    console.log('🔍 DETAILED JOBSALERT.PK TEST - Finding Real Jobs\n');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        console.log('🌐 Navigating to JobsAlert.pk job search...');
        await page.goto('https://www.jobsalert.pk/?s=software+engineer', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForTimeout(4000);

        const title = await page.title();
        console.log(`📄 Page Title: ${title}\n`);

        console.log('🔎 Analyzing page structure...\n');

        const jobs = await page.evaluate(() => {
            const jobElements = document.querySelectorAll('article, div[class*="job"], .post, .entry');
            const extractedJobs = [];

            jobElements.forEach((el) => {
                const allText = el.innerText;
                if (!allText || allText.length < 50) return;

                // Look for job indicators
                if (allText.toLowerCase().includes('job') ||
                    allText.toLowerCase().includes('vacancy') ||
                    allText.toLowerCase().includes('position')) {

                    // Look for job title (usually in an <a> or <h>)
                    const titleElem = el.querySelector('h1, h2, h3, h4, a');
                    const title = titleElem ? titleElem.innerText.trim() : '';

                    // Get link
                    const linkElem = el.querySelector('a');
                    const url = linkElem ? linkElem.href : '';

                    // Look for organization/company
                    const orgMatch = allText.match(/(Government|Ministry|Department|Company|Organization|University|Hospital|Bank|Authority|Commission|Board|Agency)/i);
                    const company = orgMatch ? orgMatch[0] : '';

                    // Look for location
                    const locationMatch = allText.match(/(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta|Pakistan|Sindh|Punjab|KPK|Balochistan)/i);
                    const location = locationMatch ? locationMatch[0] : '';

                    // Look for date
                    const dateMatch = allText.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
                    const postedDate = dateMatch ? dateMatch[0] : '';

                    if (title && url && title.length > 10 && title.length < 150) {
                        // Filter out non-job content
                        if (!title.toLowerCase().includes('chand ki tarikh') &&
                            !title.toLowerCase().includes('login') &&
                            !title.toLowerCase().includes('search')) {

                            extractedJobs.push({
                                title,
                                company: company || 'Various Organizations',
                                location: location || 'Pakistan',
                                url,
                                postedDate: postedDate || 'Recently Posted',
                                description: allText.substring(0, 200).replace(/\n/g, ' ')
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

        if (jobs.length > 0) {
            console.log(`\n✅ SUCCESS! Extracted ${jobs.length} REAL JOBS:\n`);
            console.log('='.repeat(70));

            jobs.forEach((job, i) => {
                console.log(`\n${i + 1}. ${job.title}`);
                console.log(`   Company: ${job.company}`);
                console.log(`   Location: ${job.location}`);
                console.log(`   Posted: ${job.postedDate}`);
                console.log(`   URL: ${job.url}`);
                console.log(`   Description: ${job.description}...`);
            });

            console.log('\n' + '='.repeat(70));
            console.log(`\n🎉 RESULT: Found ${jobs.length} real jobs from JobsAlert.pk!`);

            return jobs;
        } else {
            console.log('\n❌ Could not extract structured job data');
        }

        // Save screenshot for debugging
        await page.screenshot({ path: 'logs/jobsalert-debug.png', fullPage: true });
        console.log('📸 Screenshot saved to logs/jobsalert-debug.png');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) await browser.close();
    }
}

testJobsAlertDetailed();
