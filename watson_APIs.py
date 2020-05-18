from ibm_watson import VisualRecognitionV3
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
import json
#Imagenes
import glob
import os
import skimage.io as io

#------------------------Upload Images--------------------------------
images=glob.glob(os.path.join('images_Test','*.jpg'))
#-------------------------------------------------------

authenticator = IAMAuthenticator('Vz5eLNJkxK9vTfgJDYtRqhjEIEA_3uqQFrnAswDQCXBQ')

visual_recognition = VisualRecognitionV3(
    version='2018-03-19',
    authenticator=authenticator
)

with open('images_Test/gym.jpg','rb') as images:
    classes = visual_recognition.classify(images_file=images,threshold=0.5,classifier_ids='default').get_result()

print(json.dumps(classes, indent=2))


#authenticator = IAMAuthenticator('Vz5eLNJkxK9vTfgJDYtRqhjEIEA_3uqQFrnAswDQCXBQ',url='https://api.us-south.visual-recognition.watson.cloud.ibm.com/instances/f9fecabe-c905-48d2-918a-3de935053c2c')

