require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer-extra');
const cron = require('node-cron');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const googleUsername = "sergeypetrov20012@gmail.com";
const googlePassword = "Cw:77~m~3'SAa/%";
const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const data = require("./getData");

let today = new Date();
let day = String(today.getDate()).padStart(2,'0') - 1;
let month = String(today.getMonth()+1).padStart(2,'0');
let year = today.getFullYear();
today = day + '.' + month + '.' + year;
let weekday = new Date().getDay();
console.log(weekday);

const getValues = async (date) => {
    let arrayData = await data();
    console.log(arrayData);
    let dateIndex;
    let resultArray = [];
    arrayData.map((element) => {
        element.map((el, index) => {
            if(el == date){
                dateIndex = index
            }
        })
    })

    arrayData.map((element) => {
        element.map((el, index) => {
            if(index == dateIndex){
                resultArray.push([element[0], el])
            }
        })
    })

    const arrayLength = resultArray.length
    resultArray[arrayLength-1][0] = "Итоговая прибыль";
    resultArray.shift()
    let message = `Прибыль по аккаунтам за ${date}: \n`;
    resultArray.forEach((el, i) => {
        i !== resultArray.length-1 ? message += `${el[0]}: ${el[1]}$\n` : `${el[0]}: ${el[1]}$\n`
    })
    console.log(message)

    bot.sendMessage(5573054825, message)
}

const getScreen = async (date) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '-disable-gpu',
            '--enable-webgl',
            '--window-size=1920,1080'
        ]
    });
        
    const url = "https://docs.google.com/spreadsheets/d/1niBZs6iW8_Awa3_0J-85xi0o9JyEJjSzg0JNm8F4M8Y/edit#gid=0";
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AplleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36'
        
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(ua);
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.type('input[type="email"]', googleUsername);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    await page.type('input[type="password"]', googlePassword);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(10000);
    const element = await page.$('#waffle-grid-container');
    await element.screenshot({path: `./screenshots/screenshot${date}.jpg`})
    await browser.close();
    await sendPhoto(date);
}

const sendPhoto = (date) => {
    bot.sendDocument(5573054825,`./screenshots/screenshot${date}.jpg`)
}

cron.schedule('30 15 * * 1,2,3,4,5', async () => {
    if(weekday == 1){
        let friday = day-2 + '.' + month + '.' + year;
        let saturday = day-1 + '.' + month + '.' + year;
        getValues(friday);
        getScreen(friday);

        getValues(saturday);
        getScreen(saturday);

        getValues(today);
        getScreen(today);
    }
    else{
        getValues(today)
        getScreen(today)
    }
})