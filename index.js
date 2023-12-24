require('dotenv').config();
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { login, load_cookies } =  require('./login/login');
const {doSolvingWith_noCaptchaAi_API} = require('./no_captcha/nocaptchaai');
puppeteer.use(StealthPlugin())


const main = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.NODE_ENV === 'production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(), 
       //executablePath: '/usr/bin/chromium-browser', 
        ignoreHTTPSErrors: true,
        userDataDir: `./login`,
        slowMo: 0,
        args: [
            '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox', '--lang=en-US',
            '--window-size=700,900','--single-process', '--no-zygote',
            '--start-maximized', '--disable-web-security', '--allow-running-insecure-content',
            '--disable-strict-mixed-content-checking', '--ignore-certificate-errors', '--disable-features=IsolateOrigins,site-per-process', '--blink-settings=imagesEnabled=true'
        ]
    })
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const page = await browser.newPage();
    await page.goto('https://freebitco.in/');
    await sleep(1000)

    if(await page.$('.cc_btn_accept_all')){
        await page.evaluate(() => {
            document.querySelector('.cc_btn_accept_all').click();
        });
    }

    //check for logging, if cookies.json exists

    await load_cookies(page)

    try{
        
        await page.evaluate(() => {
            document.querySelector('.pushpad_deny_button').click();
        }, {timeout: 2000});
        console.log('here')
    }catch(e){
        console.log(e.message)
    }

    if(!(await page.$('.logout_link'))){
        console.log('trying to logging')
        await login(page, sleep)
        console.log('here')
    }

    await sleep(1000)

    let time_rm = await page.evaluate(()=>{
        return Number(document.querySelector('div#time_remaining span.countdown_amount').innerHTML);
    })
    if(time_rm){
        console.log(time_rm, time_rm+1)

        time_rm ?  scheduler(time_rm+1) : scheduler(120000)
        await page.screenshot({path: 'img.png', fullPage: true})
        console.log(`coming back in ${time_rm +1} minutes`)
        await browser.close()
        return
    }

    const elementHandle = await page.waitForSelector(`div[class="h-captcha"] iframe`); //selector need to change for other site.
        
    const frame = await elementHandle.contentFrame();
    await frame.click('#checkbox')

    await sleep(3000)
    //click submit user details if no clicking images
    let checkbox = await frame.$eval(".check", el => el.style.display);
    console.log(checkbox, 1)
    let fm;

    if(checkbox ==='block'){
        await page.evaluate(() => {
            document.querySelector('#free_play_form_button').click();
        })
        await sleep(2000)
        await page.screenshot({path: 'img.png', fullPage: true})
        console.log('done!!!!')
        await browser.close()

        scheduler()
    }else{    
        fm = page.frames().find(f => f.url().startsWith('https://newassets.hcaptcha.com/captcha')); ////selector need to change for other site.
        await doSolvingWith_noCaptchaAi_API(browser,scheduler, page, fm)
    }
}

const scheduler = time => { 
   setTimeout( async () => {
    try{
        await main()
    }catch{console.log}}, time*60000||3660000) 
};

main()
