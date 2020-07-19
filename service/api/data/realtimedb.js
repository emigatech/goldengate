const express    = require('express');
const path       = require('path');
const router     = express.Router();
const { DB }     = require(path.join(__dirname, `/../../helpers/firebase`));

router.get('/results/:key', (req, res) => {

    if (req.params.key === null || req.params.key === "" || typeof req.params.key !== "string") {
        res.status(400).json({
            status: 400,
            time: Date.now(),
            message: `value of key is empty or not a string`,
            data: null
        })
    }

    try{
        DB.ref.child(`data/${req.params.key}`).once("value", (data)=>{
            if(!data.exists()) {
                res.status(404).json({
                    status: 404,
                    time: Date.now(),
                    key: req.params.key,
                    message: "no data exists",
                    data: null
                });
            }
            else {
                res.status(200).json({
                    status: 200,
                    time: Date.now(),
                    key: req.params.key,
                    message: "success",
                    data: { ...data.val() }
                });
            }
        });
    }
    catch(err)
    {
        res.status(500).json({
            status: 500,
            time: Date.now(),
            key: req.params.key,
            message: `${err}`,
        });
    }
    
});

module.exports = router;