import puppeteer from 'puppeteer';

async function testRozeeDetailed() {
    console.log('🔍 DETAILED ROZEE.PK TEST - Finding Real Jobs\n');

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

        console.log('🌐 Navigating to Rozee.pk job search...');
        await page.goto('https://www.rozee.pk/job/jsearch/q/software-engineer/fpn/1', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForTimeout(4000);

        const title = await page.title();
        console.log(`📄 Page Title: ${title}\n`);

        // Get all possible job containers
        console.log('🔎 Analyzing page structure...\n');

        const analysis = await page.evaluate(() => {
            // Find all divs that might contain jobs
            const allDivs = document.querySelectorAll('div');
            const jobLikeElements = [];

            allDivs.forEach((div, index) => {
                const text = div.innerText;
                const classes = div.className;

                // Check if contains job-like text
                if (text && text.length > 50 && text.length < 500) {
                    if (text.toLowerCase().includes('engineer') ||
                        text.toLowerCase().includes('developer') ||
                        text.toLowerCase().includes('experience') ||
                        text.toLowerCase().includes('skills')) {

                        const links = div.querySelectorAll('a');
                        const hasLink = links.length > 0;

                        jobLikeElements.push({
                            index,
                            className: classes,
                            textPreview: text.substring(0, 150),
                            hasLink,
                            linkHref: hasLink ? links[0].href : null
                        });
                    }
                }
            });

            return jobLikeElements.slice(0, 10); // First 10 potential jobs
        });

        if (analysis.length > 0) {
            console.log(`✅ Found ${analysis.length} potential job listings:\n`);

            analysis.forEach((item, i) => {
                console.log(`${i + 1}. Class: "${item.className}"`);
                console.log(`   Text: ${item.textPreview}...`);
                console.log(`   Has Link: ${item.hasLink}`);
                if (item.linkHref) {
                    console.log(`   URL: ${item.linkHref}`);
                }
                console.log('');
            });

            // Now extract actual job data
            console.log('📋 Extracting structured job data...\n');

            const jobs = await page.evaluate(() => {
                const jobElements = document.querySelectorAll('div[class*="job"], article, li[class*="job"]');
                const extracted = [];

                jobElements.forEach((el) => {
                    const allText = el.innerText;
                    if (!allText || allText.length < 50) return;

                    // Look for job title (usually in an <a> or <h>)
                    const titleElem = el.querySelector('h2, h3, h4, a[href*="job"]');
                    const title = titleElem ? titleElem.innerText.trim() : '';

                    // Look for company name
                    const companyElem = el.querySelector('[class*="company"], span, .text-muted');
                    const company = companyElem ? companyElem.innerText.trim() : '';

                    // Look for location
                    const locationMatch = allText.match(/(Karachi|Lahore|Islamabad|Rawalpindi|Faisalabad|Multan|Peshawar)/i);
                    const location = locationMatch ? locationMatch[0] : '';

                    // Get link
                    const linkElem = el.querySelector('a[href*="job"]');
                    const url = linkElem ? linkElem.href : '';

                    if (title && title.length > 5 && title.length < 100) {
                        extracted.push({
                            title,
                            company: company || 'Company name not found',
                            location: location || 'Pakistan',
                            url: url || 'URL not found',
                            description: allText.substring(0, 150)
                        });
                    }
                });

                return extracted.slice(0, 10);
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
                console.log(`\n🎉 RESULT: Found ${jobs.length} real jobs from Rozee.pk!`);

                return jobs;
            }
        }

        console.log('\n❌ Could not extract structured job data');

        // Save screenshot for debugging
        await page.screenshot({ path: 'logs/rozee-debug.png', fullPage: true });
        console.log('📸 Screenshot saved to logs/rozee-debug.png');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) await browser.close();
    }
}

testRozeeDetailed();
