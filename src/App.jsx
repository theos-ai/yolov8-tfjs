import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import Loader from './components/Loader';
import StreamController from './components/StreamController';
import { detect, detectVideo as originalDetectVideo } from './utils/detect';
import './style/App.css';

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState({
    network: null,
    inputShape: [1, 0, 0, 3],
  });
  const [fps, setFps] = useState(0);
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelName = 'yolov8n-pose';
  const modelURL = 'https://storage.googleapis.com/theos-development-static-v1/yolov8_pose_nano_192/model.json';
  const previousTimestamp = useRef(null);

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(modelURL, {
        onProgress: (fractions) => {
          setLoading({ loading: true, progress: fractions });
        },
      });
      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);
      setLoading({ loading: false, progress: 1 });
      setModel({
        network: yolov8,
        inputShape: yolov8.inputs[0].shape,
      });
      tf.dispose([warmupResults, dummyInput]);
    });
  }, []);

  const detectVideo = async (video, model, canvas) => {
    const now = performance.now();
    if (previousTimestamp.current) {
      const duration = now - previousTimestamp.current;
      const fpsValue = 1000 / duration;
      setFps(fpsValue);
    }
    previousTimestamp.current = now;

    await originalDetectVideo(video, model, canvas);  // Assuming this is your original detection code

    if (video.paused || video.ended) {
      return;
    }
    requestAnimationFrame(() => detectVideo(video, model, canvas));
  };

  return (
    <div className='App'>
      <div className='header'>
        <h1 style={{marginBottom:20}}>YOLOv8 TensorflowJS</h1>
        {loading.loading ? 
          <Loader>Loading model... {(loading.progress * 100).toFixed(0)}%</Loader>
          :
          <p>{modelName} loaded</p>
        }
        <p>FPS: {fps.toFixed(2)}</p>  {/* Display the FPS */}
      </div>
      <div className='content'>
        <img
          src='#'
          ref={imageRef}
          onLoad={() => detect(imageRef.current, model, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={() => detectVideo(cameraRef.current, model, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, canvasRef.current)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>
      {!loading.loading && <StreamController imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} />}
    </div>
  );
};

export default App;
