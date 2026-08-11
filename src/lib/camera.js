// Snapshots a live <video> frame onto an offscreen canvas — usable both as a
// face-api.js detection input and (via canvas.toBlob) for upload.
export function captureFrame(videoEl) {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  canvas.getContext('2d').drawImage(videoEl, 0, 0);
  return canvas;
}
