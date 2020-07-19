const firebase      = require('firebase-admin');
const path          = require('path');
const {databaseURL} = require(path.join(__dirname, `/../../config/service`)); 

try{
    firebase.initializeApp({
        credential: firebase.credential.cert(path.join(__dirname, `/../../config/google-cloud/firebase.json`)),
        databaseURL: databaseURL
    });
    const db  = firebase.database();
    const ref = db.ref("goldengate");

    module.exports = {
        Firebase: firebase,
        DB: {
            init: db,
            ref: ref,
            child: ref.child
        }
    }
}
catch(e){
    throw new Error(e);
}