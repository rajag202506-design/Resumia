import puppeteer from 'puppeteer';

async function testMustakbilDetailed() {
    console.log('🔍 DETAILED MUSTAKBIL.COM TEST - Finding Real Jobs\n');

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

        // Try the main jobs page
        const urlsToTry = [
            'https://www.mustakbil.com/jobs',
            'https://mustakbil.com/jobs/software-engineer',
            'https://www.mustakbil.com/'
        ];

        for (const url of urlsToTry) {
            console.log(`\n🌐 Trying: ${url}`);

            try {
                await page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                await page.waitForTimeout(3000);

                const title = await page.title();
                console.log(`📄 Page Title: ${title}`);

                // Check if page loaded successfully
                const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());

                if (bodyText.includes('not found') || bodyText.includes('404')) {
                    console.log('❌ Page not found, trying next URL...');
                    continue;
                }

                if (bodyText.includes('blocked') || bodyText.includes('captcha')) {
                    console.log('❌ BLOCKED, trying next URL...');
                    continue;
                }

                console.log('✅ Page loaded successfully!');
                console.log('🔎 Searching for job listings...\n');

                const jobs = await page.evaluate(() => {
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
                                              lowerText.includes('analyst');

                        if (hasJobKeywords) {
                            // Look for job title
                            const titleElem = el.querySelector('h1, h2, h3, h4, h5, a[href*="job"]');
                            const title = titleElem ? titleElem.innerText.trim() : '';

                            // Get link
                            const linkElem = el.querySelector('a');
                            const url = linkElem ? linkElem.href : '';

                            // Look for company
                            const companyMatch = allText.match(/([A-Z][a-zA-Z\s&]+(?:Limited|Ltd|Pvt|Private|Software|Technologies|Solutions|Services|Group|International)?)/);
                            const company = companyMatch ? companyMatch[0].trim() : '';

                            // Look for location
                            const locationMatch = allText.match(/(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar|Quetta|Pakistan)/i);
                            const location = locationMatch ? locationMatch[0] : '';

                            if (title && url && title.length > 10 && title.length < 150) {
                                extractedJobs.push({
                                    title,
                                    company: company || 'Not specified',
                                    location: location || 'Pakistan',
                                    url,
                                    description: allText.substring(0, 200).replace(/\n/g, ' ')
                                });
                            }
                        }
                    });

                    // Remove duplicates
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
                        console.log(`   URL: ${job.url}`);
                        console.log(`   Description: ${job.description}...`);
                    });

                    console.log('\n' + '='.repeat(70));
                    console.log(`\n🎉 RESULT: Found ${jobs.length} real jobs from Mustakbil.com!`);

                    await browser.close();
                    return;
                } else {
                    console.log('⚠️ No jobs found, trying next URL...');
                }

            } catch (error) {
                console.log(`❌ Error with ${url}: ${error.message}`);
            }
        }

        console.log('\n❌ Could not find jobs on any Mustakbil.com URL');

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    } finally {
        if (browser) await browser.close();
    }
}

testMustakbilDetailed();
