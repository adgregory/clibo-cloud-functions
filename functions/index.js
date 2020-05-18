// FireBase
// const functions = require('firebase-functions');
// const gcs = require('@google-cloud/storage');
// const os = require('os');
// const path = require('path');
// const {Storage} = require('@google-cloud/storage');
// const storage = new Storage();

const https = require('https');
const Stream = require('stream').Transform;
// IBM API
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const fs = require('fs');
const { IamAuthenticator } = require('ibm-watson/auth');
const parameters = require("./parameters.json");

const VisualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    authenticator: new IamAuthenticator({ apikey: parameters.VR_API_KEY }),
    url: parameters.VR_URL
});


const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./clibo_keys.json')

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://ibm-challenge-d1eaa.firebaseio.com",
    storageBucket: 'ibm-challenge-d1eaa.appspot.com'
});

const bucket = async () => {
    let url = '';
    const load = firebaseAdmin.storage().bucket();
    load.getFiles(async (error, files) => {
        url = await  files[files.length-1].getSignedUrl({
            action: 'read',
            expires: '09-20-2021'
        });

        
    let image = new Stream();
    https.get(url[0], response => {
        response.on('data', chunk => {
            image.push(chunk);
        });

        response.on('end', () => {
            console.log(image);
            const classifyParams = {
                imagesFile: image.read(),
                classifierIds: parameters.VR_MODEL_ID,
                threshold: 0.6,
            };
        
            VisualRecognition.classify(classifyParams, function (err, response) {
                if (err) {
                    console.log(err);
                } else {
                    const vr = JSON.stringify(response, null, 2)
                    const classes = response.result.images[0].classifiers[0].classes[0];
                    console.log(classes)
                }
            });
        })
    });
 
    });
    console.log(url);
}
bucket();


