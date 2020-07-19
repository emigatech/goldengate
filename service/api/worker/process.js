const {worker}  = require('./worker');
const express   = require('express');
const path      = require('path');
const validUrl  = require('valid-url').is_web_uri;
const router    = express.Router();
const { api }   = require(path.join(__dirname, `/../../../config/service`));

router.post('/start', (req, res) => {

    if (!validUrl(req.body.url) || typeof req.body.url !== 'string') 
    {
        res.status(400).json({
            status: 400,
            time: Date.now(),
            message: `invalid url`,
            data: null
        }) 
    }
    if (req.body.token === null || req.body.token === "" || typeof req.body.token !== "string") {
        res.status(400).json({
            status: 400,
            time: Date.now(),
            message: `value of token is empty or not a string`,
            data: null
        })
    }
    if(req.body.device !== "desktop")
    {
        if(req.body.device !== "mobile")
        {
            res.status(400).json({
                status: 400,
                time: Date.now(),
                message: "device is missing",
                data: null
            })
        } 
    }

    try{
        worker({api:api, token:req.body.token, device:req.body.device, url:req.body.url},req,res);
    }
    catch(err){
        res.status(500).json({
            status: 500,
            time: Date.now(),
            message: `${err}`,
            data: null
        })
    }
    
});    

module.exports = router;