import puppeteer from 'puppeteer';

async function testRealScraping() {
    console.log('🧪 Testing Real Web Scraping with Puppeteer\n');

    let browser;
    try {
        console.log('1️⃣ Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('✅ Browser launched\n');

        console.log('2️⃣ Creating new page...');
        const page = await browser.newPage();

        // Set realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log('✅ Page created with user agent\n');

        console.log('3️⃣ Testing: Navigate to Google...');
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2', timeout: 15000 });
        const googleTitle = await page.title();
        console.log(`✅ Google loaded: "${googleTitle}"\n`);

        console.log('4️⃣ Testing: Navigate to Indeed Pakistan...');
        const indeedUrl = 'https://pk.indeed.com/jobs?q=software+engineer&l=Pakistan';
        await page.goto(indeedUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const indeedTitle = await page.title();
        console.log(`✅ Indeed page loaded: "${indeedTitle}"\n`);

        console.log('5️⃣ Checking page content...');
        const bodyText = await page.evaluate(() => document.body.innerText);
        const hasJobListings = bodyText.includes('job') || bodyText.includes('Job');
        console.log(`   Page has "job" text: ${hasJobListings}`);
        console.log(`   Body text length: ${bodyText.length} characters\n`);

        console.log('6️⃣ Looking for job cards...');
        const selectors = [
            '[data-jk]',
            '.job_seen_beacon',
            '.jobCard',
            '.job-result',
            'div[class*="job"]'
        ];

        for (const selector of selectors) {
            const found = await page.$(selector);
            console.log(`   Selector "${selector}": ${found ? '✅ FOUND' : '❌ Not found'}`);
        }

        console.log('\n7️⃣ Taking screenshot...');
        await page.screenshot({ path: 'logs/indeed-test.png', fullPage: false });
        console.log('✅ Screenshot saved to logs/indeed-test.png\n');

        console.log('8️⃣ Getting page HTML (first 500 chars)...');
        const html = await page.content();
        console.log(html.substring(0, 500) + '...\n');

        console.log('✅ TEST COMPLETE: Puppeteer is working!');
        console.log('\n📊 VERDICT:');
        console.log('   - Puppeteer: ✅ Working');
        console.log('   - Browser Launch: ✅ Working');
        console.log('   - Page Navigation: ✅ Working');
        console.log('   - Indeed Access: ✅ Can access the site');
        console.log('   - Job Extraction: ⚠️ Depends on Indeed\'s anti-bot measures\n');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.error('Error details:', error);
    } finally {
        if (browser) {
            await browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

testRealScraping();
