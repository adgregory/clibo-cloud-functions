
const https = require('https');
const Stream = require('stream').Transform;
const functions = require("firebase-functions");
//const gcs = require('@google-cloud/storage');
const path = require('path');
const os = require('os');
const spawn = require('child-process-promise').spawn;
const {Storage} = require('@google-cloud/storage'); // Creates a client const storage = new Storage();
const gcs = new Storage();
// IBM API
const VisualRecognitionV3 = require('ibm-watson/visual-recognition/v3');
const NaturalLanguageCLassifierV1 = require('ibm-watson/natural-language-classifier/v1');
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
const fs = require('fs-extra');
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


const LanguageTranslator = new LanguageTranslatorV3({
    version: '2018-05-01',
    authenticator: new IamAuthenticator({apikey: parameters.LT_API_KEY}),
    url: parameters.LT_URL
});


const ToneAnalyzer = new ToneAnalyzerV3({
    version: '2017-09-21',
    authenticator: new IamAuthenticator({apikey: parameters.TA_API_KEY}),
    url:parameters.TA_URL
});


// const firebaseAdmin = require('firebase-admin');
// const serviceAccount = require('./clibo_keys.json')

// firebaseAdmin.initializeApp({
//     credential: firebaseAdmin.credential.cert(serviceAccount),
//     databaseURL: "https://ibm-challenge-d1eaa.firebaseio.com",
//     storageBucket: 'ibm-challenge-d1eaa.appspot.com'
// });

// const bucket = async (imagen) => {
//     let url = '';
//     // FOLDER COVER STREAMINGS --> VR_EXPLICIT, VR_GENERAL
//     //const load = firebaseAdmin.storage().bucket();
//     console.log(imagen)
//     load.getFiles(async (error, files) => { //REVISAR
//         url = await  files[1].getSignedUrl({
//             action: 'read',
//             expires: '09-20-2021'
//         });
//     //console.log(url[0]) 
//     if (files[0].name.slice(0,7)=="profile"){ //files.length-1
//         console.log('Entro a Profile')
//         let image = new Stream();
//         https.get(url[0], response => {
//             console.log(url[0])
//             response.on('data', chunk => {
//                 image.push(chunk);
//             });
//             response.on('end', () => {
//                 //NEW (1)
//                 const VisualClassifyParams_Explicit = {
//                     imagesFile: image.read(),
//                     classifierIds: parameters.VR_MODEL_ID_EXPLICIT,
//                     threshold: 0.6,
//                 };    
//                 VisualRecognition.classify(VisualClassifyParams_Explicit, function (err, response) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         const vr = JSON.stringify(response, null, 2)
//                         const classes = response.result.images[0].classifiers[0].classes;
//                         //console.log(classes)
//                         if (classes[0] == 'explicit'){
//                             console.log('0') //No aprobada
//                         }else{
//                             console.log('1') //Aprobada
//                         }
//                     }
//                 });
//             })
//         });
//     } else if(files[0].name.slice(0,5)=='cover'){//files.length-1
//         console.log('Entro a Cover')
//         let image = new Stream();
//         https.get(url[0], response => {
//             //console.log(url[0])
//             response.on('data', chunk => {
//                 image.push(chunk);
//             });
//             response.on('end', () => {
//                 //console.log(image);
//                 const VisualClassifyParams_General = {
//                     imagesFile: image.read(),
//                     classifierIds: parameters.VR_MODEL_ID,
//                     threshold: 0.6,
//                 };
//                 //NEW (1)
//                 const VisualClassifyParams_Explicit = {
//                     imagesFile: image.read(),
//                     classifierIds: parameters.VR_MODEL_ID_EXPLICIT,
//                     threshold: 0.6,
//                 };
    
//                 VisualRecognition.classify(VisualClassifyParams_Explicit, function (err, response) {
//                     if (err) {
//                         console.log(err);
//                     } else {
//                         const vr = JSON.stringify(response, null, 2)
//                         const classes = response.result.images[0].classifiers[0].classes;
//                         if (classes[0]=='explicit'){
//                             console.log('0') //No aprobada
//                         } else{
//                             VisualRecognition.classify(VisualClassifyParams_General, function (err,response){
//                                 if (err){
//                                     console.log(err);
//                                 } else {
//                                     const vr2 = JSON.stringify(response, null, 2)
//                                     const classes2 = response.result.images[0].classifiers[0].classes;
//                                     console.log(classes2)
//                                 };

//                             });
//                         }
//                         //console.log(classes)
//                     }
//                 });
//             })
//         });
//     } else if (files[files.length-1].slice(0,5)=='texto'){
//         const classifyParamsText = {
//             text: 'Me gusta la cuk',
//             classifierId: parameters.LC_MODEL_ID
//         };

//         NaturalLanguageCLassifier.classify(classifyParamsText, function (err,response){
//             if(err){
//                 console.log(err);
//             } else{
//                 const lc = JSON.stringify(response, null, 2)
//                 const classesLC = response.result.classes;
//                 console.log(classesLC)
//             };

//         });
//     };

//      });
//     //console.log(url);
// }



// exports.Classification = functions.storage.object().onFinalize(async event => {
//     const bucket = gcs.Bucket(event.bucket);
//     const path = event.name;
//     const fileName = path.split('/').pop();
//     const bucketDir = dirname(path);
    
//     await bucket.file(path).createReadStream()
//     .on('data', (data) => {
//         console.log(data)
//     })
// });

// const x = async(bucket2, filePath) => {
//     const bucket = storage.bucket(bucket2);
//     const fileName = filePath.split('/').pop();
//     const bucketDir = path.dirname(filePath);
//     const localFilename = './image.jpeg'
//     const stream = await bucket.file(filePath).createReadStream().on('response', response => {
//         console.log(response);
//     }).on('end', () => {
//         console.log('Here');
//     })
//     .pipe(fs.createWriteStream(localFilename));
// }
// x('ibm-challenge-d1eaa.appspot.com','profile/yvqingvusrc_200x200.jpeg');



// Function Translate
// const translateParams = {
//     text: 'Me parece muy vulgar este contenido',
//     modelId: 'es-en'
// };

// LanguageTranslator.translate(translateParams)
//   .then(translationResult => {
//     let translation = translationResult.result.translations[0].translation
//     //console.log(translation);
//     const toneParams = {
//         toneInput: { 'text': translation },
//         contentType: 'application/json',
//     };
//     ToneAnalyzer.tone(toneParams)
//       .then(toneAnalysis => {
//         let tone = toneAnalysis.result.document_tone.tones
//         console.log(tone);
//       })
//       .catch(err => {
//         console.log('error:', err);
//       });
//   })
//   .catch(err => {
//     console.log('error:', err);
//   });

//INTENTO 1
// exports.testImages = functions.storage.object().onFinalize((event) => {
//     const bucket = event.bucket;
//     const contentType = event.contentType;
//     const filePath = event.name;
//     console.log('File download started');
//     const destBucket = gcs.bucket(bucket);
//     const tmpFilePath = path.join(os.tmpdir(), path.basename(filePath))
//     const metadata = {contentType: contentType};
//     return destBucket.file(filePath).download({
//         destination: tmpFilePath
//     }).then(() => {
//         console.log(tmpFilePath)
//     });
// });

exports.testImages = functions.storage.object().onFinalize(async object => {
    const bucket = gcs.bucket(object.bucket);
    const filePath = object.name;
    const fileName = filePath.split('/').pop();
    const bucketDir = path.dirname(filePath);

    const workingDir = path.join(os.tmpdir(), 'thumbs');
    const tmpFilePath = path.join(workingDir, 'image.png');

    if (fileName.includes('thumb@') || !object.contentType.includes('image')){
        console.log('exiting function');
        return false
    }
    await bucket.file(filePath).download({
        destination: tmpFilePath
    });
    
    console.log(tmpFilePath)
    
    fs.remove(workingDir);
});


//testImages()