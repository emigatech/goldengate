const express = require('express');
const path    = require('path');
const router  = express.Router();
const { storage, config } = require(path.join(__dirname, `/../../functions/storage`));


router.post('/migrate', (req, res) => {

    if (req.body.key === null || req.body.key === "" || typeof req.body.key !== "string") {
        res.status(400).json({
            status: 400,
            time: Date.now(),
            message: `value of key is empty or not a string`,
            data: null
        })
    }
    
    (async() => {
        /**
         *  Google Storage Integration
         */
        try{
            await storage.bucket(config.bucket.static)
            .upload(path.join(__dirname, `/../../public/storage/html/${req.body.key}.html`), {
                gzip: true,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });

            await storage.bucket(config.bucket.static)
                .upload(path.join(__dirname, `/../../public/storage/image/${req.body.key}.jpg`), {
                    gzip: true,
                    metadata: {
                        cacheControl: 'public, max-age=31536000',
                    },
                });

            const [html_url] = await storage.bucket(config.bucket.static)
                .file(`${req.body.key}.html`)
                .getSignedUrl({
                    version: 'v2',
                    action: 'read',
                    expires: Date.now() + 1000 * 60 * 60,
                });

            const [image_url] = await storage.bucket(config.bucket.static)
                .file(`${req.body.key}.jpg`)
                .getSignedUrl({
                    version: 'v2',
                    action: 'read',
                    expires: Date.now() + 1000 * 60 * 60,
                });

            /**
             *  Result
             */
            res.status(201).json({
                status: 201,
                time: Date.now(),
                message: "success",
                data: {
                    html: html_url,
                    image: image_url
                }
            });
        }
        catch(err){
            res.status(500).json({
                status: 500,
                time: Date.now(),
                message: `${err}`,
                data: null
            });
        }
    })();
    
});


module.exports = router;