import * as tf from '@tensorflow/tfjs';
import { drawLabels } from './draw';

function preProcessImage(source, modelWidth, modelHeight) {
  let widthRatio, heightRatio;
  const input = tf.tidy(() => {
    const img = tf.browser.fromPixels(source);
    const [h, w] = img.shape.slice(0, 2);
    const maxSize = Math.max(w, h);
    const imgPadded = img.pad([
      [0, maxSize - h],
      [0, maxSize - w],
      [0, 0],
    ]);
    widthRatio = maxSize / w;
    heightRatio = maxSize / h;
    return tf.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight])
      .div(255.0)
      .expandDims(0);
  });
  return [input, widthRatio, heightRatio];
};

export async function detect(source, model, canvasRef, callback = () => { }) {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3);
  tf.engine().startScope();
  const [input, widthRatio, heightRatio] = preProcessImage(source, modelWidth, modelHeight);
  const predictions = model.network.execute(input);
  const transpose = predictions.transpose([0, 2, 1]);
  const boxes = tf.tidy(() => {
    const w = transpose.slice([0, 0, 2], [-1, -1, 1]);
    const h = transpose.slice([0, 0, 3], [-1, -1, 1]);
    const x1 = tf.sub(transpose.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2));
    const y1 = tf.sub(transpose.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2));
    return tf.concat(
        [
          y1,
          x1,
          tf.add(y1, h),
          tf.add(x1, w),
        ],
        2
      ).squeeze();
  });
  const scores = tf.tidy(() => {
    const rawScores = transpose.slice([0, 0, 4], [-1, -1, 1]).squeeze();
    return rawScores;
  });
  const landmarks = tf.tidy(() => { return transpose.slice([0, 0, 5], [-1, -1, -1]).squeeze(); });
  const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.3);
  const boxes_data = boxes.gather(nms, 0).dataSync();
  const scores_data = scores.gather(nms, 0).dataSync();
  let landmarks_data = landmarks.gather(nms, 0).dataSync();
  landmarks_data = tf.reshape(landmarks_data, [-1, 3, 17]);
  drawLabels(canvasRef, landmarks_data, boxes_data, scores_data, widthRatio, heightRatio);
  tf.dispose([predictions, transpose, boxes, scores, nms]);
  callback();
  tf.engine().endScope();
};

export async function detectVideo(vidSource, model, canvasRef) {
  if (vidSource.videoWidth === 0 && vidSource.srcObject === null) {
    const ctx = canvasRef.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  detect(vidSource, model, canvasRef, () => {
    requestAnimationFrame(detectFrame);
  });
};
