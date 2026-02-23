const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Navigating to login...');
    await page.goto('http://localhost:3001/admin/login');

    console.log('Waiting for network...');
    await new Promise(r => setTimeout(r, 2000));

    // Try to login (we can just click the button or trigger the handleLogin by typing dummy data if there's no error)
    // Or we can just evaluate createClient directly in the browser!
    console.log('Evaluating Supabase client in browser...');
    const cookiesBefore = await page.cookies();
    console.log('Cookies before:', cookiesBefore.map(c => c.name));

    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await new Promise(r => setTimeout(r, 2000));

    const cookiesAfter = await page.cookies();
    console.log('Cookies after login attempt:', cookiesAfter.map(c => c.name));

    // Let's get the localStorage
    const local = await page.evaluate(() => Object.keys(localStorage));
    console.log('LocalStorage keys:', local);

    await browser.close();
})();
