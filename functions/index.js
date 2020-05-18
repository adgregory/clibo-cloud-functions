'use strict';


// FireBase
const functions = require('firebase-functions');
const Storage = require('@google-cloud/storage');
const os = require('os');
const path = require('path');
//const gcs = Storage();


// IBM API
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const fs = require('fs');
const { IamAuthenticator } = require('ibm-watson/auth');
const parameters = require("./parameters.json");


// const VisualRecognition = new VisualRecognitionV3({
//     version: '2018-03-19',
//     authenticator: new IamAuthenticator({apikey:parameters.VR_API_KEY}),
//     url: parameters.VR_URL
// });


// const classifyParams = {
//     imagesFile: fs.createReadStream('./images_Test/cooking.jpg'),
//     classifierIds: parameters.VR_MODEL_ID,
//     threshold: 0.6,
// };

// VisualRecognition.classify(classifyParams, function(err,response){
//     if (err){
//         console.log(err);
//     } else{
//         console.log(JSON.stringify(response,null,2))
//     }
// });

exports.imageChecking = functions.storage.object().onFinalize((event) => {
    if(!event.name.startsWith('cover_streamings/')){
        return console.log(event.name); 
    } else{
        return null
    }  
});