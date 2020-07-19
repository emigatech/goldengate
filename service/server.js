'use strict';
/**
 * Libraries
 */
const express     = require('express');
const path        = require('path');
const app         = express();
const helmet      = require('helmet');
const cors        = require('cors');
const morgan      = require('morgan');
const compression = require('compression');
const timeout     = require('connect-timeout')
const api         = require('./api/router');
const dotenv      = require('dotenv');
const { jwt }     = require('./helpers/jwt');
const cache       = require('apicache').middleware;
const ErrorHandler= require('api-error-handler');
const slowDown    = require("express-slow-down");

/**
 * Helpers
 */
app.disable('x-powered-by');
dotenv.config({ path: path.join(__dirname, '../.env') });
app.set('json spaces', 40);
app.use(helmet());
app.use(timeout('60s'));
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api',jwt());
app.use('/api/data',cache('60 minutes'));
app.use(ErrorHandler());
app.use('/api/auth/login',slowDown({
    windowMs: 60 * 60 * 1000, 
    delayAfter: 2,
    delayMs: 2000
}))
app.use('/api/auth/register',slowDown({
    windowMs: 60 * 60 * 1000, 
    delayAfter: 2,
    delayMs: 5000
}))
app.use('/api',api);
app.use(express.static(path.join(__dirname, './public/static')));
app.use((req,res,next)=> { if (!req.timedout) next() });

app.listen(process.env.PORT, (error) => {
    if(!error){
        console.log(`
            \n-------------------------------------------------------------------------------\n
            GoldenGate service started : http://%s:%s
            \n-------------------------------------------------------------------------------
        \nLogger started...`,'goldengate',process.env.PORT)
    }
})
