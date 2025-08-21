from fastapi import FastAPI,File,UploadFile
from fastapi.responses import JSONResponse
from typing import Dict,Any
from label_map import LABEL_MAP
from fastapi.middleware.cors import CORSMiddleware

import tensorflow as tf
import numpy as np 
import cv2
import os 

os.environ["TF_ENABLE_ONEDNN_OPTS"] = '0'

MODEL_DIR = 'ssd_mobilenet_v2_coco_2018_03_29/saved_model'
model = tf.saved_model.load(str(MODEL_DIR))
infer = model.signatures['serving_default']

def run_inference(image: np.ndarray) ->  Dict[str, Any]:
    input_tensor = tf.convert_to_tensor(image)
    input_tensor = input_tensor[tf.newaxis, ...]
    
    detections = infer(input_tensor)
    
    return detections

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://127.0.0.1:5173','http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> JSONResponse:
    contents = await file.read()
    image = np.array(cv2.imdecode(np.frombuffer(contents,np.uint8),cv2.IMREAD_COLOR))
    image_rgb = cv2.cvtColor(image,cv2.COLOR_BGR2RGB)
    
    detections = run_inference(image_rgb)
    
    # num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0].numpy() for key, value in detections.items()}
    num_detections = int(detections['num_detections'])
    
    for key in detections:
        detections[key] = detections[key].tolist()
        
    results = []
    for i in range(num_detections):
        if detections['detection_scores'][i] >= 0.5:
            class_id = int(detections['detection_classes'][i])
            category = LABEL_MAP.get(class_id,'unknown')
            box = detections['detection_boxes'][i]
            score = detections['detection_scores'][i]
            results.append({'box':box,'category':category,'score':score})
    print('Final',results)
    return JSONResponse(content=results)    
    
    
@app.get("/")
async def join():
    return {"message" : "Hi What are you doing right now.."}

