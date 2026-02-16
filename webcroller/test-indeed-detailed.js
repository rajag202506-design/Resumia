import puppeteer from 'puppeteer';

async function testIndeedDetailed() {
    console.log('🔍 DETAILED INDEED TEST\n');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        const page = await browser.newPage();

        // More realistic browser setup
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        // Remove webdriver flag
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => false,
            });
        });

        console.log('🌐 Navigating to Indeed Pakistan...');
        await page.goto('https://pk.indeed.com/jobs?q=software+engineer&l=Karachi', {
            waitUntil: 'networkidle0',
            timeout: 20000
        });

        await page.waitForTimeout(3000); // Wait for JS to load

        const pageTitle = await page.title();
        console.log(`📄 Page Title: ${pageTitle}\n`);

        // Check for CAPTCHA or blocking
        const bodyText = await page.evaluate(() => document.body.innerText);

        if (bodyText.toLowerCase().includes('captcha') || bodyText.toLowerCase().includes('robot')) {
            console.log('🤖 DETECTED: Page contains CAPTCHA or robot detection');
            console.log('Body text preview:', bodyText.substring(0, 300));
            return;
        }

        if (bodyText.toLowerCase().includes('sorry') || bodyText.toLowerCase().includes('blocked')) {
            console.log('🚫 DETECTED: Access is blocked');
            console.log('Body text preview:', bodyText.substring(0, 300));
            return;
        }

        // Try to find actual job cards with multiple selectors
        console.log('🔎 Searching for job listings...\n');

        const jobsFound = await page.evaluate(() => {
            const possibleSelectors = [
                'div[data-jk]',
                '.job_seen_beacon',
                '.jobsearch-ResultsList > li',
                'article',
                'div[id*="job"]',
                'div[class*="job_seen"]',
                '.slider_item',
                'div.cardOutline'
            ];

            const results = [];
            for (const selector of possibleSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    results.push({
                        selector: selector,
                        count: elements.length,
                        sample: elements[0]?.innerText?.substring(0, 100)
                    });
                }
            }
            return results;
        });

        if (jobsFound.length > 0) {
            console.log('✅ FOUND JOB ELEMENTS:');
            jobsFound.forEach(result => {
                console.log(`\n   Selector: ${result.selector}`);
                console.log(`   Count: ${result.count}`);
                console.log(`   Sample: ${result.sample}`);
            });
        } else {
            console.log('❌ NO JOB ELEMENTS FOUND');
            console.log('\nPossible reasons:');
            console.log('1. Indeed is showing "0 results" (no actual jobs match the query)');
            console.log('2. Indeed has changed their HTML structure');
            console.log('3. Indeed is serving a different page to bots');
            console.log('4. The page requires JavaScript that hasn\'t loaded yet');
        }

        // Get all text content
        console.log('\n📋 Page Content Analysis:');
        const stats = await page.evaluate(() => {
            const text = document.body.innerText;
            return {
                totalLength: text.length,
                hasJobWord: text.toLowerCase().includes('job'),
                hasSoftwareWord: text.toLowerCase().includes('software'),
                hasEngineerWord: text.toLowerCase().includes('engineer'),
                hasApplyWord: text.toLowerCase().includes('apply'),
                textPreview: text.substring(0, 500)
            };
        });

        console.log(`   Total text length: ${stats.totalLength} chars`);
        console.log(`   Contains "job": ${stats.hasJobWord}`);
        console.log(`   Contains "software": ${stats.hasSoftwareWord}`);
        console.log(`   Contains "engineer": ${stats.hasEngineerWord}`);
        console.log(`   Contains "apply": ${stats.hasApplyWord}`);
        console.log(`\n   Text preview:\n   ${stats.textPreview.split('\n').join('\n   ')}`);

        console.log('\n📸 Taking screenshot for manual inspection...');
        await page.screenshot({ path: 'logs/indeed-detailed.png', fullPage: true });
        console.log('✅ Saved to logs/indeed-detailed.png');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (browser) await browser.close();
    }
}

testIndeedDetailed();
