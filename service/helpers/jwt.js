const expressJwt = require('express-jwt');
const path       = require('path');
const { secret } = require(path.join(__dirname, `/../../config/service`));

function jwt() {
    return expressJwt({ secret, algorithms: ['HS256'] })
    .unless({
        path: [
            '/api/auth/login',
            '/api/auth/register',
            '/api/worker/start'
        ]
    });
}

module.exports = { jwt };