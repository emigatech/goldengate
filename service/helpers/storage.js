const { Storage }    = require('@google-cloud/storage');
const path           = require('path');
const {staticBucket} = require(path.join(__dirname, `/../../config/service.js`)); 

const storage = new Storage({ 
    keyFilename: path.join(__dirname, `/../../config/google-cloud/google-storage.json`) 
});

module.exports = {
    storage : storage,
    config : {
        bucket: {
            static: staticBucket
        }
    }
}
