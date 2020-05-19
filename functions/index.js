
const https = require('https');
const Stream = require('stream').Transform;
// IBM API
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const NaturalLanguageCLassifierV1 = require('ibm-watson/natural-language-classifier/v1');
const fs = require('fs');
const { IamAuthenticator } = require('ibm-watson/auth');
const parameters = require("./parameters.json");


//IBM FUNCTIONS

const VisualRecognition = new VisualRecognitionV3({
    version: '2018-03-19',
    authenticator: new IamAuthenticator({ apikey: parameters.VR_API_KEY }),
    url: parameters.VR_URL
});


const NaturalLanguageCLassifier = new NaturalLanguageCLassifierV1({
    authenticator: new IamAuthenticator({apikey: parameters.LC_API_KEY}),
    url: parameters.LC_URL
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
    // FOLDER COVER STREAMINGS --> VR_EXPLICIT, VR_GENERAL
    const load = firebaseAdmin.storage().bucket();
    load.getFiles(async (error, files) => {
        url = await  files[files.length-1].getSignedUrl({
            action: 'read',
            expires: '09-20-2021'
        });
    console.log(files[files.length-1].name)        
    // if (files[10].name.slice(0,7)=="profile"){ //files.length-1
    //     let image = new Stream();
    //     https.get(url[0], response => {
    //         console.log(url[0])
    //         response.on('data', chunk => {
    //             image.push(chunk);
    //         });
    
    //         response.on('end', () => {
    //             //NEW (1)
    //             const VisualClassifyParams_Explicit = {
    //                 imagesFile: image.read(),
    //                 classifierIds: parameters.VR_MODEL_ID_EXPLICIT,
    //                 threshold: 0.6,
    //             };    
    //             VisualRecognition.classify(VisualClassifyParams_Explicit, function (err, response) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     const vr = JSON.stringify(response, null, 2)
    //                     const classes = response.result.images[0].classifiers[0].classes;
    //                     //console.log(classes)
    //                     if (classes[0] == 'explicit'){
    //                         console.log('0') //No aprobada
    //                     }else{
    //                         console.log('1') //Aprobada
    //                     }
    //                 }
    //             });
    //         })
    //     });
    // } else if(files[10].slice(0,5)=='cover'){//files.length-1
    //     let image = new Stream();
    //     https.get(url[0], response => {
    //         console.log(url[0])
    //         response.on('data', chunk => {
    //             image.push(chunk);
    //         });
    
    //         response.on('end', () => {
    //             //console.log(image);
    //             const VisualClassifyParams_General = {
    //                 imagesFile: image.read(),
    //                 classifierIds: parameters.VR_MODEL_ID,
    //                 threshold: 0.6,
    //             };
    //             //NEW (1)
    //             const VisualClassifyParams_Explicit = {
    //                 imagesFile: image.read(),
    //                 classifierIds: parameters.VR_MODEL_ID_EXPLICIT,
    //                 threshold: 0.6,
    //             };
    
    //             VisualRecognition.classify(VisualClassifyParams_Explicit, function (err, response) {
    //                 if (err) {
    //                     console.log(err);
    //                 } else {
    //                     const vr = JSON.stringify(response, null, 2)
    //                     const classes = response.result.images[0].classifiers[0].classes;
    //                     if (classes[0]=='explicit'){
    //                         console.log('0') //No aprobada
    //                     } else{
    //                         VisualRecognition.classify(VisualClassifyParams_General, function (err,response){
    //                             if (err){
    //                                 console.log(err);
    //                             } else {
    //                                 const vr2 = JSON.stringify(response, null, 2)
    //                                 const classes2 = response.result.images[0].classifiers[0].classes;
    //                                 console.log(classes2)
    //                             };

    //                         });
    //                     }
    //                     //console.log(classes)
    //                 }
    //             });
    //         })
    //     });
    // } else if (files[files.length-1].slice(0,5)=='texto'){
    //     const classifyParamsText = {
    //         text: 'Me gusta la cuk',
    //         classifierId: parameters.LC_MODEL_ID
    //     };

    //     NaturalLanguageCLassifier.classify(classifyParamsText, function (err,response){
    //         if(err){
    //             console.log(err);
    //         } else{
    //             const lc = JSON.stringify(response, null, 2)
    //             const classesLC = response.result.classes;
    //             console.log(classesLC)
    //         };

    //     });
    // };

     });
    //console.log(url);
}
bucket();






// const functions = require("firebase-functions");
// exports.ImageClassification = functions.storage.object().onFinalize((event) => {
//     const url = event.url;
// });
// object.name.startsWith('cover_streamings/')


