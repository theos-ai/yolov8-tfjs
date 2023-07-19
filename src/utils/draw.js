const colors = {
  nose: 'cyan',
  leftEye: 'lime',
  rightEye: 'magenta',
  leftEar: 'yellow',
  rightEar: 'dodgerblue',
  leftShoulder: 'hotpink',
  rightShoulder: 'orange',
  leftElbow: 'turquoise',
  rightElbow: 'springgreen',
  leftWrist: 'deeppink',
  rightWrist: 'chartreuse',
  leftHip: 'skyblue',
  rightHip: 'coral',
  leftKnee: 'mediumspringgreen',
  rightKnee: 'deepskyblue',
  leftAnkle: 'orangered',
  rightAnkle: 'gold'
};

const connections = [
  ['nose', 'leftEye'],
  ['nose', 'rightEye'],
  ['leftEye', 'leftEar'],
  ['rightEye', 'rightEar'],
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['rightShoulder', 'rightElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightElbow', 'rightWrist'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['rightHip', 'rightKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightKnee', 'rightAnkle']
];

export function drawLabels(canvasRef, landmarks_data, boxes_data, scores_data, widthRatio, heightRatio) {
  const ctx = canvasRef.getContext('2d');
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  for (let i = 0; i < scores_data.length; ++i) {
    const score = (scores_data[i] * 100).toFixed(1);
    let [y1, x1, y2, x2] = boxes_data.slice(i * 4, (i + 1) * 4);
    x1 *= widthRatio;
    x2 *= widthRatio;
    y1 *= heightRatio;
    y2 *= heightRatio;
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.fillStyle = colors['nose'];
    ctx.strokeStyle = colors['nose']
    ctx.lineWidth = Math.max(Math.min(ctx.canvas.width, ctx.canvas.height) / 200, 2.5);
    ctx.strokeRect(x1, y1, width, height);
    let keypoints = landmarks_data.slice([i, 0, 0], [1, -1, -1]).reshape([17, 3]).arraySync();

    for (let j = 0; j < keypoints.length; j++) {
      const x = keypoints[j][0] * widthRatio;
      const y = keypoints[j][1] * heightRatio;
      const bodyPart = Object.keys(colors)[j];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = colors[bodyPart];
      ctx.fill();
      ctx.closePath();
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';

    for (const [partA, partB] of connections) {
      const x1 = keypoints[Object.keys(colors).indexOf(partA)][0] * widthRatio;
      const y1 = keypoints[Object.keys(colors).indexOf(partA)][1] * heightRatio;
      const x2 = keypoints[Object.keys(colors).indexOf(partB)][0] * widthRatio;
      const y2 = keypoints[Object.keys(colors).indexOf(partB)][1] * heightRatio;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
    }
  }
}