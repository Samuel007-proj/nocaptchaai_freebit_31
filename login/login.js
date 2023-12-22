const fs = require('fs');

const save_cookies = async (page) => {
    const cookies = JSON.stringify(await page.cookies(),null, 2)
    const sessionStorage = await page.evaluate(()=> JSON.stringify(sessionStorage,null, 2))
    const localStorage = await page.evaluate(()=> JSON.stringify(localStorage,null, 2))


    await fs.writeFileSync('./login/cookies.json', cookies)
    await fs.writeFile('./login/sessionStorage.json', sessionStorage)
    await fs.writeFile('./login/localStorage.json', localStorage)
}

const load_cookies = async(page) => {
    if(fs.existsSync('./login/cookies.json')){
        const cookieString = await fs.readFileSync('./login/cookies.json', 'utf-8')
        let cookies = JSON.parse(cookieString);

        await page.setCookie(...cookies);
    }else{console.log('no cookie found')}
    

    const sessionStorageString = await fs.readFileSync('./login/sessionStorage.json', 'utf-8')
    let sessionStorage;
    if(sessionStorageString) sessionStorage = JSON.parse(sessionStorageString);

    const localStorageString = await fs.readFileSync('./login/localStorage.json', 'utf-8')
    let localStorage;
    if (localStorageString) localStorage = JSON.parse(localStorageString);

    

    if(sessionStorage){
        await page.evaluate(data => {
        for(const [key,value] of Object.entries(data))
        sessionStorage[key] = value
    }, sessionStorage)
    }
    
    if(localStorage){
       await page.evaluate(data => {
        for(const [key,value] of Object.entries(data))
        localStorage[key] = value
    }, localStorage) 
    }
    
}

const login = async (page) =>{
    await page.evaluate(() => {
        document.querySelector('.login_menu_button').click();
    });
    await page.type('#login_form_btc_address', 'oyelamisamuel0@gmail.com', {delay: 250})
    await page.type('#login_form_password', 'sahmurhel', {delay: 250})

    await page.evaluate(() => {
        document.querySelector('#login_button').click();
    });

    await save_cookies(page)
    await page.waitForNavigation()
    await save_cookies(page)
    console.log('done')
}

module.exports=  {load_cookies, login}