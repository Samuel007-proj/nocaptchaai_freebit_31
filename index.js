const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { login, load_cookies } =  require('./login/login');
const {doSolvingWith_noCaptchaAi_API} = require('./no_captcha/nocaptchaai');
puppeteer.use(StealthPlugin())


const main = async () => {
    const browser = await puppeteer.launch({
        headless: true,
       //executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', 
        ignoreHTTPSErrors: true,
        userDataDir: `data`,
        slowMo: 0,
        args: [
            '--disable-gpu', '--disable-dev-shm-usage', '--no-sandbox', '--lang=en-US',
            '--window-size=700,900',
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

    if(!(await page.$('.logout_link'))){
        console.log('trying to logging')
        await login(page)
    }

    try{
        await page.evaluate(() => {
            document.querySelector('.pushpad_deny_button').click();
        });
    }catch(e){
        console.log(e.message)
    }

    await sleep(1000)
    if(await page.evaluate(()=>document.querySelector('#time_remaining').innerHTML)){
        let time_rm  = Number(await page.evaluate(() => {return document.querySelector('div#time_remaining span.countdown_amount').innerHTML}));
        console.log(time_rm, time_rm+1)

        time_rm ?  scheduler(time_rm+1) : scheduler(120000)
        await page.screenshot({path: 'img.png', fullPage: true})
        console.log(`coming back in ${time_rm +1} minutes`)
        await browser.close()
        return
    }

    await page.waitForNetworkIdle(1000);
        
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