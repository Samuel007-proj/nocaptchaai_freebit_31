const fs = require('fs');

const save_cookies = async (page) => {
    const cookies = JSON.stringify(await page.cookies(),null, 2)

    fs.writeFileSync('./login/cookies.json', cookies)

}

const load_cookies = async(page) => {
    if(fs.existsSync('./login/cookies.json')){
        const cookieString = fs.readFileSync('./login/cookies.json', 'utf-8')
        let cookies = JSON.parse(cookieString);

        await page.setCookie(...cookies);
    }else{console.log('no cookie found')}
    
}

const login = async (page) =>{
    await page.evaluate(() => {
        document.querySelector('.login_menu_button').click();
    });
    await page.type('#login_form_btc_address', 'soyelami019@stu.ui.edu.ng', {delay: 200})
    await page.type('#login_form_password', 'sahmurhel', {delay: 200})

    await Promise.all([
        page.waitForNavigation({timeout: 120000}), 
        page.evaluate(() => {
            document.querySelector('#login_button').click();
        })
      ])
    await save_cookies(page)
    console.log('done')
}

module.exports=  {load_cookies, login}