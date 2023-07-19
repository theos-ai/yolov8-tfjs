import React, { useState, useRef } from 'react';
import { Webcam } from '../utils/webcam';

function StreamController(props) {
  const { imageRef, cameraRef, videoRef } = props;
  const [currentStream, updateStream] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const webcamInstance = new Webcam();

  function terminateImage() {
    const url = imageRef.current.src;
    imageRef.current.src = '#';
    URL.revokeObjectURL(url);

    updateStream(null);
    imageInputRef.current.value = '';
    imageRef.current.style.display = 'none';
  };

  function terminateVideo() {
    const url = videoRef.current.src;
    videoRef.current.src = '';
    URL.revokeObjectURL(url);
    updateStream(null);
    videoInputRef.current.value = '';
    videoRef.current.style.display = 'none';
  };

  return (
    <div className='btn-container'>
      <input
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]);
          imageRef.current.src = url;
          imageRef.current.style.display = 'block';
          updateStream('image');
        }}
        ref={imageInputRef}
      />
      <button
        onClick={() => {
          if (currentStream === null) imageInputRef.current.click();
          else if (currentStream === 'image') terminateImage();
          else alert(`Can't handle more than 1 stream\nCurrently streaming : ${currentStream}`);
        }}
      >
        {currentStream === 'image' ? 'Close' : 'Open'} Image
      </button>
      <input
        type='file'
        accept='video/*'
        style={{ display: 'none' }}
        onChange={(e) => {
          if (currentStream === 'image') terminateImage();
          const url = URL.createObjectURL(e.target.files[0]);
          videoRef.current.src = url;
          videoRef.current.addEventListener('ended', () => terminateVideo());
          videoRef.current.style.display = 'block';
          updateStream('video');
        }}
        ref={videoInputRef}
      />
      <button
        onClick={() => {
          if (currentStream === null || currentStream === 'image') videoInputRef.current.click();
          else if (currentStream === 'video') terminateVideo();
          else alert(`Can't handle more than 1 stream\nCurrently streaming : ${currentStream}`);
        }}
      >
        {currentStream === 'video' ? 'Close' : 'Open'} Video
      </button>
      <button
        onClick={() => {
          if (currentStream === null || currentStream === 'image') {
            if (currentStream === 'image') terminateImage();
            webcamInstance.open(cameraRef.current);
            cameraRef.current.style.display = 'block';
            updateStream('camera');
          }
          else if (currentStream === 'camera') {
            webcamInstance.close(cameraRef.current);
            cameraRef.current.style.display = 'none';
            updateStream(null);
          } else alert(`Can't handle more than 1 stream\nCurrently streaming : ${currentStream}`);
        }}
      >
        {currentStream === 'camera' ? 'Close' : 'Open'} Webcam
      </button>
    </div>
  );
};

export default StreamController;
