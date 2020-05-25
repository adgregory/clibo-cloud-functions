/* eslint-disable promise/always-return */
const express = require("express");
const cors = require("cors");
const app = express();
const functions = require("firebase-functions");
const path = require("path");
const os = require("os");
const { Storage } = require("@google-cloud/storage"); // Creates a client const storage = new Storage();
const gcs = new Storage();
const Stream = require("stream").Transform;
// IBM API
const VisualRecognitionV3 = require("ibm-watson/visual-recognition/v3");
const NaturalLanguageCLassifierV1 = require("ibm-watson/natural-language-classifier/v1");
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const ToneAnalyzerV3 = require("ibm-watson/tone-analyzer/v3");
const fse = require("fs-extra");
const fs = require("fs");
const { IamAuthenticator } = require("ibm-watson/auth");
const parameters = require("./parameters.json");
const https = require("https");
const USER_COLLECTION = "user";

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
3;
const ToneAnalyzer = new ToneAnalyzerV3({
  version: "2017-09-21",
  authenticator: new IamAuthenticator({ apikey: parameters.TA_API_KEY }),
  url: parameters.TA_URL,
});

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("./clibo_keys.json");

app.use(cors());

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: "https://ibm-challenge-d1eaa.firebaseio.com",
});

const db = firebaseAdmin.firestore();

/** WORKS
 * Firebase Function Language Classifier
 * {URL}: https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/languageClassifier
 */
const languageClassifier = (req, res) => {
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
};

/** WORKS
 * Firebase Function Tone Analysis
 * {URL} https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/toneAnalysis
 */
const toneAnalysis = async(req, res) => {
  const { comments } = req.body;
   translateAndAnalyse(comments)
    .then((response) => res.status(200).send(response))
    .catch((error) => res.status(404).send("Ha ocurrido un error" + error));
};
const translateAndAnalyse = (comments) => {
  let promises = [];
  return new Promise((resolve, reject) => {
    let like = 0; //Counter for Joy tone in comments
    let dislike = 0; //Counter for Anger tone in comments
    let confidence = 0; //Counter for Confident tone in comments
      for (let index = 0; index < comments.length; index++) {
        const comment = comments[index];
        const translateParams = {
          text: comment.text,
          modelId: "es-en",
        };
        // eslint-disable-next-line no-loop-func
         promises.push(new Promise((resolve, reject) => {
          LanguageTranslator.translate(translateParams, (err, response) => {
            if (err) {
              throw reject(err);
            } else {
              const translation = response.result.translations[0].translation;
              const toneParams = {
                toneInput: { text: translation },
                contentType: "application/json",
              };
              ToneAnalyzer.tone(toneParams, (err, response) => {
                if (err) {
                  throw reject(err);
                } else {
                  console.log('Tone ana...');
                  const tone = response.result.document_tone.tones;
                  tone.sort((x, y) => {
                    y.score - x.score;
                  });
                  let higherTone = tone[0].tone_name;
                  let output = "";
                  if (higherTone === "Confident" || higherTone === "Joy") {
                    like += 1;
                    console.log(like);
                  } else if (
                    higherTone === "Anger" ||
                    higherTone === "Sadness" ||
                    higherTone === "Fear"
                  ) {
                    dislike += 1;
                    console.log(dislike);
                  } else if (
                    higherTone === "Analytical" ||
                    higherTone === "Tentative"
                  ) {
                    confidence += 1;
                    console.log(confidence);
                  }
                }
                resolve(true);
              });
            }
          });
        }));
      }
      Promise.all(promises).then(values => {
        resolve({like,dislike, thoughtful: confidence});
      })
      .catch(error => reject(error));
      });
};

/** WORKS
 * Firebase Function Visual Recognition Profiels
 * {URL} https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/ImageProfileClassification
 */
const imageProfileClassification = (req, res) => {
  console.log(req.method);
  const { url } = req.body;
  if (req.method === "OPTIONS") {
    res.status(204).send("");
  }
  var classifier_ids = ["explicit"];
  const VisualClassifyParams_Explicit = {
    url: url,
    classifierIds: classifier_ids, //parameters.VR_MODEL_ID_EXPLICIT,
    threshold: 0.5,
  };
  VisualRecognition.classify(VisualClassifyParams_Explicit, (err, response) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      const classes = response.result.images[0].classifiers[0].classes[0].class;
      if (classes === "explicit") {
        const output = 1;
        console.log("Explicita", output);
        res.status(200).send(output.toString()); //No aprobada
      } else {
        const output = 0;
        console.log("No Explicita", output);
        res.status(200).send(output.toString()); //Aprobada
      }
    }
  });
};

/**
 * Firebase Function Visual Recognition Profiels
 * {URL} https://us-central1-ibm-challenge-d1eaa.cloudfunctions.net/ImageStreamingClassification
 */
const imageStreamingClassification = (req, res) => {
  const { url } = req.body;
  //console.log(url);
  let image = new Stream();
  https.get(url, (response) => {
    response.on("data", (chunk) => {
      image.push(chunk);
    });
  });
  response.on("end", () => {
    const VisualClassifyParams_General = {
      imagesFile: image.read(),
      classifier_ids: parameters.VR_MODEL_ID_GENERAL,
      threshold: 0.5,
    };
    VisualRecognition.classify(
      VisualClassifyParams_General,
      (err, response) => {
        if (err) {
          console.log(err);
        } else {
          const classes = response.result.images[0].classifiers[0].classes;
          let output = "";
          //console.log(classes)
          if (classes.indexOf("food") !== null) {
            output = "Cocina";
            res.status(200).send(output);
          } else if (classes.indexOf("sports equipment") !== null) {
            output = "Entrenamiento";
            res.status(200).send(output);
          }
        }
      }
    );
  });
};

app.post("/imageClassification", (req, res) =>
  imageProfileClassification(req, res)
);
app.post("/languageClassifier", (req, res) => languageClassifier(req, res));
app.post("/toneAnalyser", (req, res) => toneAnalysis(req, res));
app.post("/imageStreamingClassifier", (req, res) =>
  imageStreamingClassification(req, res)
);

exports.routes = functions.https.onRequest(app);
