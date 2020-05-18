// const functions = require('firebase-functions');
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  console.log('Hello')
//  response.send("Hello from Firebase!");
// });

const VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
const fs = require('fs');
const { IamAuthenticator } = require('ibm-watson/auth');
const parameters = require("./parameters.json");

const VisualRecognition = new VisualRecognitionV3({
        version: '2018-03-19',
        authenticator: new IamAuthenticator({apikey:parameters.VR_API_KEY}),
        url: parameters.VR_URL
});


const classifyParams = {
    imagesFile: fs.createReadStream('./images_Test/cooking.jpg'),
    classifierIds: parameters.VR_MODEL_ID,
    threshold: 0.6,
};

VisualRecognition.classify(classifyParams, function(err,response){
    if (err){
        console.log(err);
    } else{
        console.log(JSON.stringify(response,null,2))
    }
});
