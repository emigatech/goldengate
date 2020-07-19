const express      = require('express');
const router       = express.Router();
const path         = require('path');
const jwt          = require('jsonwebtoken');
const { DB }       = require(path.join(__dirname, `/../../helpers/firebase`));
const crypto       = require('crypto');
const email        = require('email-validator');
const { secret, issuer } = require(path.join(__dirname, `/../../../config/service`));

router.post('/login', (req, res, next) => {

    if(req.body.email === null || req.body.email === "")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given email address is empty",
            data: null
        })
    }
    if(!email.validate(req.body.email))
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given email address is not validated",
            data: null
        })
    }
    if(req.body.password === null || req.body.password === "")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given password is empty",
            data: null
        })
    }
    if(typeof req.body.email !== "string" || 
        typeof req.body.password !== "string")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "value of body variables should be a string",
            data: null
        })
    }    

    const user = 
    {
        id:crypto.createHash('md5').update(secret+req.body.email).digest("hex"),
        email: req.body.email,
        password: crypto.createHash('md5').update(secret+req.body.password).digest("hex")
    }

    try{
        DB.ref.child(`auth/${user.id}`)
        .once("value", (data)=>{
            if(data.exists()) 
            {
                if((data.val()).password === user.password)
                {
                    const token = jwt.sign(
                        {
                            sub: (data.val()).id,
                            email: (data.val()).email,
                            firstname: (data.val()).firstname,
                            lastname: (data.val()).lastname
                        },
                        secret,
                        {
                            algorithm: 'HS256',
                            expiresIn: '24h',
                            issuer: issuer
                        }
                    );
                    res.status(200)
                    .json({
                        status: 200,
                        time: Date.now(),
                        message: "authenticated",
                        data: {
                            id: user.id,
                            email: user.email,
                            token: token, 
                            firstname: (data.val()).firstname || null,
                            lastname: (data.val()).lastname || null
                        }
                    });
                }
            }
            else {
                res.status(400)
                .json({
                    status: 400,
                    time: Date.now(),
                    message: "password or email is invalid",
                    data: null
                });
            }
        });
    }
    catch(err){
        res.status(500)
        .json({
            status: 500,
            time: Date.now(),
            message: `${err}`,
            data: null
        })
    }
    
});

router.post('/register', (req, res) => {

    if(req.body.firstname === null || req.body.firstname === "")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given firstname is empty",
            data: null
        })
    }
    if(req.body.lastname === null || req.body.lastname === "")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given lastname is empty",
            data: null
        })
    }
    if(req.body.email === null || req.body.email === "")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given email is empty",
            data: null
        })
    }
    if(!email.validate(req.body.email))
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given email is not validated",
            data: null
        })
    }
    if(req.body.password === null || req.body.password === "")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "given password is empty",
            data: null
        })
    }        
    if(typeof req.body.email !== "string" || 
        typeof req.body.password !== "string" ||
        typeof req.body.firstname !== "string" ||
        typeof req.body.lastname !== "string")
    {
        res.status(400)
        .json({
            status: 400,
            time: Date.now(),
            message: "value of body variables should be a string",
            data: null
        })
    } 

    const user = 
    {
        id: crypto.createHash('md5').update(secret+req.body.email).digest("hex"),
        email: req.body.email,
        password: crypto.createHash('md5').update(secret+req.body.password).digest("hex"),
        firstname: req.body.firstname,
        lastname: req.body.lastname
    };

    try{
        DB.ref.child(`auth/${user.id}`)
        .once("value", (data) => {
            if(!data.exists()) 
            {
                DB.ref.child(`auth/${user.id}`)
                .set({...user})
                .then(()=>{
                    res.status(200)
                    .json({
                        status: 200,
                        time: Date.now(),
                        message: "success",
                        data: {
                            id: user.id,
                            email: user.email,
                            firstname: user.firstname,
                            lastname: user.lastname
                        }
                    });
                })
            }
            else {
                res.status(400)
                .json({
                    status: 400,
                    time: Date.now(),
                    message: "this email address has been registered",
                    data: null
                })
            }
        });
    }
    catch(err){
        res.status(500)
        .json({
            status: 500,
            time: Date.now(),
            message: `${err}`,
            data: null
        })
    }
});

module.exports = router;