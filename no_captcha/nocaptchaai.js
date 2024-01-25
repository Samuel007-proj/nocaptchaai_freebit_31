// npm install puppeteer axios request-promise-native
// Please https://github.com/berstend/puppeteer-extra if your using headless mode.
// Get Free api key here https://nocaptchaai.com
// Cheap promo 30k solves for 10$
// Selenium, puppeteer, python, playwright scripts https://github.com/shimuldn/hCaptchaSolverApi/tree/main/usage_examples

// https://free.nocaptchaai.com/api/solve for free user and https://pro.nocaptchaai.com/api/solve for paid user.

// Node selectors are different for most of the sites. Please adjust the selector accordingly.



const axios = require('axios');
const request_data = require('request-promise-native');

async function doSolvingWith_noCaptchaAi_API(browser, scheduler, page, fm, frame) {


    uid = 'pro', // Your uid
    apikey = 'acct2-e4b222c5-bca2-8b5b-4d7d-65fd11575b27', // Your apikey
    site = 'https://freebitco.in/'
    
    siteKey='2cae9d15-bde9-4a43-9e2a-5f4a1578d40b' // sitekey is mendotory for free user. Paid user please ask us for a exception code.
    console.log(siteKey)
    account_type='pro'

    if (uid === "" || apikey === "") {
        console.log("Please input uid and apikey");
        return;
    }

    if (account_type === "free") {
        api_url = 'https://free.nocaptchaai.com/api/solve'
    } else {
        api_url = 'https://pro.nocaptchaai.com/api/solve'
    }

    if (siteKey === "") {
        console.log("Please input sitekey| sitekey is mendotory for free user. Paid user please ask us for a exception code.")
        return null
    }
    const config = {
        uid: uid, // Your uid
        apikey: apikey, // Your apikey
        siteKey: siteKey, // sitekey is mendotory for free user. Paid user please ask us for a exception code.
        baseUrl: api_url,
        siteUrl: site
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    await noCaptchaAi(await getImages(), await getTarget())
        
    async function noCaptchaAi(images, target) {
        try {
                // console.log(images, target)
                if ((Object.keys(images).length) == 9) {
                    const ele = await fm.$$('.task-image');
                    const res = await axios({
                        method: 'post',
                        url: config.baseUrl,
                        headers: {
                            'Content-type': 'application/json',
                            'uid': config.uid,
                            'apikey': config.apikey
                        },
                        data: {
                            'images': images,
                            'target': target,
                            'method': 'hcaptcha_base64',
                            'sitekey': config.siteKey,
                            'site': config.siteUrl
                        }
                    })
                    .finally(() => console.log('initial call ready'))
                    .then((response) => {
                        console.log('Order', JSON.stringify(response.data))
                        return response.data
                    }, error => console.log(error.message, 'initial call'))
                    .catch(error => console.log(error.message, 'initial call'))
                    .finally(() => console.log('initial call ended'));

                    if (await res.status == 'new') {
                        console.log('new')
                        await sleep(2000)
                        const status = await axios({
                            method: 'get',
                            url: res.url,
                            headers: {
                                'Content-type': 'application/json',
                                'uid': config.uid,
                                'apikey': config.apikey
                            },
                        })
                        .then((response) => {
                            console.log('Status', JSON.stringify(response.data))
                            return response.data
                        })
                        .catch((error) => {
                            console.log(error.status);
                        });
                            
                        if (await status.status == 'solved') {
                            console.log('new was solved')
                            for (item of status.solution) {
                                // console.log(`Clicking ${item}`)
                                await ele[String(item)].click('.image')
                                await sleep(200)
                            }
                        }
                    } else if (await res.status == 'solved') {
                        console.log("Solved instantly!")
                        for (item of res.solution) {
                            await ele[String(item)].click('.image')
                            await sleep(400)
                        }
                    } else if (await res.status == 'skip') {
                        console.log(`API not able to solve this task ${target}, Skip`)
                    }
                    // console.log("Clicking submit.")
                    await sleep(2000)
    
                    const btn = await fm.evaluate(() => document.querySelector('.button-submit').textContent)
                    await sleep(200)
                    
    
                    if (await btn == 'Verify'){
                        await fm.evaluate(() => document.querySelector('.button-submit').click());
                        if ((Object.keys(await getImages()).length) == 9) {
                            console.log('calling at verify')
                            await noCaptchaAi(await getImages(), await getTarget())
                        } else {{
                            console.log("Solved successfully")
                        }}
                    } else if (await btn == 'Next') {
                        await fm.evaluate(() => document.querySelector('.button-submit').click());
                        console.log('calling at next')
                        await noCaptchaAi(await getImages(), await getTarget())
                    } else if (await btn == 'Skip') {
                        await fm.evaluate(() => document.querySelector('.button-submit').click());
                        console.log('calling at skip')
                        await noCaptchaAi(await getImages(), await getTarget())
                    } else {
                        console.log("Unknown error")
                    }
                } else {
                    // console.log("images not found")
                    TODO: "Fix ME"
                    await noCaptchaAi(await getImages(), await getTarget())
                }
        }catch(e) {
                console.log("Node selectors are different for most of the sites. Please adjust the selector accordingly.", 1)
                
                await browser.close()
                console.log('retrying in 1min')

                scheduler(60000)
                
        }
    }
    
        
    async function getImages() {
            let try_count = 0;
            const box_checked = async () => {
                page.evaluate(() => {
                    document.querySelector('#free_play_form_button').click();
                })
                await sleep(2000)
                await page.screenshot({path: 'img.png', fullPage: true})
                console.log('done!!!!')
                await browser.close()

                scheduler()
            }

            async function findImages() {
                try {
                    try_count = try_count+1
                    await sleep(3000)
                    let ele = await fm.$$('.task-image'); //selector need to change for other site.

                    while((await ele.length) != 9){

                        let checkbox = await frame.$eval(".check", el => el.style.display);
                        console.log(checkbox, 2)

                        if(checkbox ==='block'){
                            await box_checked()
                          break;
                            return;
                        }
                        console.log('not 3x3')
                        await fm.$eval('.refresh', e => {e.click(); console.log('refreshed')});
                        await sleep(3000)
                        ele = await fm.$$('.task-image')
                    }
                    
                    const data = {}
                        for (let i = 0; i < ele.length; i++) {
                            const urlData = await ele[i].$eval('.image', i => i.style.background)
                            // console.log(urlData)
                            url = urlData.match(/url\("(.*)"/)[1] || 0;
                            
                            TODO: "Need to make image download faster."
                            var d = await request_data({
                                url: url,
                                method: 'GET',
                                encoding: null // This is actually important, or the image string will be encoded to the default encoding
                            })
                                .then(result => {
                                    let imageBuffer  = Buffer.from(result);
                                    let imageBase64  = imageBuffer.toString('base64');
                                    return imageBase64
                                });
                            data[i]=d
                        }

                        console.log(Object.keys(data).length)

                    // console.log((Object.keys(data).length))
                    if ((Object.keys(data).length) != 9) {
                        if (try_count > 20){
                            
                            await findImages()
                        } else {
                            return false
                        }
                    } else {
                        console.log('data, obtained')
                        return data
                    }
                    
                } catch(e){
                    TODO: "Fix me"
                    console.log(e.message)
                    if (try_count > 20){
                        console.log("Selector are different based on the site. Please make sure selector are correct", 1)
                        return false
                    } else {
                        console.log('calling findImages at catch')
                        return await findImages()
                    }
                }
            }
            return await findImages()
    }
    
    async function getTarget() {
            try {
                const e = await fm.evaluate(() => document.querySelector('.prompt-text').textContent);
                // return e.replace('Please click each image containing an ', '').replace('Please click each image containing a ', '')
                return e
            } catch (e) {
                console.log(e)
                await sleep(500)
            }
    }
}
 // If your a paid user type 'paid' else 'free'

module.exports = {doSolvingWith_noCaptchaAi_API};
