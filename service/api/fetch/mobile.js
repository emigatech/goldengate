const express    = require('express');
const validUrl   = require('valid-url').is_web_uri;
const router     = express.Router();
const puppeteer  = require('puppeteer');
const fs         = require('fs');
const path       = require('path');
const {v4:uuid4} = require('uuid');


router.post('/', (req, res) => {

    if (!validUrl(req.body.url) || typeof req.body.url !== 'string') 
    {
        res.status(400).json({
            status: 400,
            time: Date.now(),
            message: `invalid url`,
            data: null
        }) 
    }

    (async() => {
        try{
            /**
             * Settings
             */
            const browser = await puppeteer.launch({
                headless: true,
                ignoreHTTPSErrors: true,
                slowMo: 250,
                devtools: false,
                timeout:30000,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--disable-gpu',
                    '--ignore-certificate-errors',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    "--proxy-server='direct://'", 
                    '--proxy-bypass-list=*'
                ],
                defaultViewport: {
                    width: 411,
                    height: 823,
                    isMobile: true,
                }
            });

            const page  = await browser.newPage();

            /**
             * Render
             */
            await page.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36 GoldenGate/${process.env.VERSION}`);

            await page.waitFor(20000);
            
            /**
             *  Wait for loading
             */
            await page.goto(req.body.url, {waitUntil: 'networkidle2'})

            const html = await page.content();
            const uuid = uuid4();

            fs.writeFile(path.join(__dirname, `/../../public/storage/html/${uuid}.html`), html, 'utf8', function(err){
                if(err){
                    res.status(500).json({
                        status: 500,
                        time: Date.now(),
                        message: `${err}`,
                        data: null
                    });
                }
            });

            await page.screenshot({
                path: path.join(__dirname, `/../../public/storage/image/${uuid}.jpg`),
                type: "jpeg",
                fullPage: true
            });

            /**
             *  Result
             */
            res.status(201).json({
                status: 201,
                time: Date.now(),
                message: "success",
                url: req.body.url,
                device: req.body.device,
                data: {
                    key: uuid
                }
            });
            
            browser.close();
        }
        catch(e){
            res.status(500).json({
                status: 500,
                time: Date.now(),
                message: `${e}`,
                data: null
            }) 
        }
    })();
});


module.exports = router;