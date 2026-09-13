// Snapshots a live <video> frame onto an offscreen canvas, for preview and
// (via canvas.toBlob) upload to the backend for face detection/recognition.
export function captureFrame(videoEl) {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  canvas.getContext('2d').drawImage(videoEl, 0, 0);
  return canvas;
}
