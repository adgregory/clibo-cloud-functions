/* eslint-disable promise/always-return */
const functions = require("firebase-functions");
const path = require("path");
const os = require("os");
const { Storage } = require("@google-cloud/storage"); // Creates a client const storage = new Storage();
const gcs = new Storage();
const Stream = require('stream').Transform;
// IBM API
const VisualRecognitionV3 = require("ibm-watson/visual-recognition/v3");
const NaturalLanguageCLassifierV1 = require("ibm-watson/natural-language-classifier/v1");
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const ToneAnalyzerV3 = require("ibm-watson/tone-analyzer/v3");
const fse = require("fs-extra");
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const parameters = require("./parameters.json");
const https = require('https')
const USER_COLLECTION = 'user';



//IBM FUNCTIONS

// Fotos explicitas
const VisualRecognition = new VisualRecognitionV3({
  version: "2018-03-19",
  authenticator: new IamAuthenticator({ apikey: parameters.VR_API_KEY }),
  url: parameters.VR_URL,
});

// Categorizacion del usuario segun sus preferencias
const NaturalLanguageCLassifier = new NaturalLanguageCLassifierV1({
  authenticator: new IamAuthenticator({ apikey: parameters.LC_API_KEY }),
  url: parameters.LC_URL,
});

const LanguageTranslator = new LanguageTranslatorV3({
  version: "2018-05-01",
  authenticator: new IamAuthenticator({ apikey: parameters.LT_API_KEY }),
  url: parameters.LT_URL,
});
3
const ToneAnalyzer = new ToneAnalyzerV3({
  version: "2017-09-21",
  authenticator: new IamAuthenticator({ apikey: parameters.TA_API_KEY }),
  url: parameters.TA_URL,
});

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./clibo_keys.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://ibm-challenge-d1eaa.firebaseio.com",
});

const db = firebaseAdmin.firestore();

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


/** WORKS
 *
 */
// exports.testImages = functions.storage.object().onFinalize(async (object) => {
//   const bucket = gcs.bucket(object.bucket);
//   const filePath = object.name;
//   console.log(filePath);
//   const fileName = filePath.split('/')[1];
//   const workingDir = path.join(os.tmpdir(), "images");
//   const tmpFilePath = path.join(workingDir, fileName);
//   await fse.ensureDir(workingDir);
//   await bucket.file(filePath).download({
//     destination: tmpFilePath,
//   });
//   const stream = fs.createReadStream(tmpFilePath);
//   const visualClassifyParamsExplicit = {
//     imagesFile: stream,
//     classifierIds: parameters.VR_MODEL_ID_EXPLICIT,
//     threshold: 0.6,
//   };
//   VisualRecognition.classify(visualClassifyParamsExplicit, (err, response) => {
//     if (err) throw err;
//     console.log(response);
//   });

//   fse.remove(workingDir);
// });



/** WORKS
 * Firebase Function Language Classifier 
 * {URL}: https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/languageClassifier
 */
exports.languageClassifier = functions.https.onRequest((req, res) => {
  const { preferences, clientId } = req.body;
  console.log(preferences);
  const params = { text: preferences, classifierId: parameters.LC_MODEL_ID };
  NaturalLanguageCLassifier.classify(params, (err, response) => {
    if (err) throw err;
    const { top_class } = response.result;
    db.collection(USER_COLLECTION)
      .doc(clientId)
      .update({
        preferences: top_class,
      })
      .then((value) => {
        return value;
      })
      .catch((err) => {
        throw err;
      });
    res.send({ response: "¡Tus preferencias han sido seleccionadas!" });
  });
});

/**
 * Returns translation from Es-En the comments of users in streamings. 
 * @param {String} translateText 
 */
const languageTranslatorFunction = async (translateText) => {
  const translateParams = {
    text: translateText,
    modelId: 'es-en',
  };
  LanguageTranslator.translate(translateParams)
    .then(translationResult => {
      let translation = translationResult.result.translations[0].translation;
      //console.log(translation);
      return translation;
    })
    .catch(err => {
      console.log('error:', err);
    });
};

/**
 * Returns Tones that describes the comments of users in streamings.
 * @param {Input from Translator} toneText 
 */
const ToneAnalyzerFunction = async (toneText) => {
  const toneParams = {
    toneInput: { 'text': toneText },
    contentType: 'application/json',
  };
  ToneAnalyzer.tone(toneParams)
    .then(toneAnalysis => {
      const tone = toneAnalysis.result.document_tone.tones
      console.log(tone);
      return tone
    })
    .catch(err => {
      console.log('error', err);
    });
};

/**
 * Firebase Function Tone Analysis
 * {URL} https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/toneAnalysis
 */
exports.toneAnalysis = functions.https.onRequest((req, res) => {
  const { toneArray, streamingId } = req.body;
  console.log(preferences);
  let like = 0; //Counter for Joy tone in comments
  let dislike = 0; //Counter for Anger tone in comments
  let confidence = 0; //Counter for Confident tone in comments

  for (const toneText in toneArray) {
    const translaition = languageTranslarorFunction(toneText);
    const tones = ToneAnalyzerFunction(translaition)
    const scoreArray = [];
    for (var i = 0; i < tones.length(); i++) {
      scoreArray.concat(tones[i].score) //Get scores Array
      let idx = scoreArray.indexOf(Math.max(scoreArray)); //Get index of max value in Array
    }
    Tone_name = tones[idx].Tone_name
    if (Tone_name === 'Anger' || Tone_name === 'Fear' || Tone_name === 'Sadness') {
      dislike += 1;
    } else if (Tone_name === 'Joy' || Tone_name === 'Confident') {
      like += 1;
    } else if (Tone_name === 'Analytical' || Tone_name === 'Tentative') {
      confidence += 1;
    }
  }
  let tone_Export = [dislike, like, confidence];
  db.collection(STREAMING_COLLECTION)
    .doc(streamingId)
    .update({
      tones_Streaming: tone_Export,
    })
    .then((value) => {
      return value;
    })
    .catch((err) => {
      throw err;
    });
  res.send({ response: 'Tus comentarios han sido analizados' });
});



/**
 * Firebase Function Visual Recognition Profiels
 * {URL} https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/ImageProfileClassification
 */
exports.ImageProfileClassification = functions.https.onRequest((req, res) => {
  const { url } = req.body;
  // let image = new Stream();
  //  https.get(url, response => {
  //     console.log('Entro al get',url)
  //     response.on('data', chunk => {
  //       image.push(chunk);
  //     });
  //   });
  // response.on('end', () => {
  const VisualClassifyParams_Explicit = {
    url: url,
    classifiers: parameters.VR_MODEL_ID_EXPLICIT,
    threshold: 0.6,
  };
  console.log('Entra a on')
  VisualRecognition.classify(VisualClassifyParams_Explicit, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Entra a Clasificacion')
      const classes = response.result.images[0].classifiers[0].classes;
      let output = 0;
      //console.log(classes)
      if (classes[0] === 'explicit') {
        output = 1;
        res.sendStatus(output);//No aprobada
      } else {
        output = 0;
        res.sendStatus(output); //Aprobada
      }
    }
  });
  //});
});


/**
 * Firebase Function Visual Recognition Profiels
 * {URL} https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/ImageStreamingClassification
 */
exports.ImageStreamingClassification = functions.https.onRequest((req, res) => {
  const { url } = req.body;
  //console.log(url);
  let image = new Stream();
  https.get(url, response => {
    response.on('data', chunk => {
      image.push(chunk);

    });
  });
  response.on('end', () => {
    const VisualClassifyParams_General = {
      imagesFile: image.read(),
      classifiers: parameters.VR_MODEL_ID_GENERAL,
      threshold: 0.5,
    };
    VisualRecognition.classify(VisualClassifyParams_General, (err, response) => {
      if (err) {
        console.log(err);
      } else {
        const classes = response.result.images[0].classifiers[0].classes;
        let output = "";
        //console.log(classes)
        if (classes.indexOf('food') !== null) {
          output = 'Cocina'
          res.send(output)
        } else if (classes.indexOf('sports equipment') !== null) {
          output = 'Entrenamiento'
          res.send(output)
        }
      }
    });
  });
});


