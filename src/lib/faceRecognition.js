import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';
const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions();

// Distance threshold below which a match counts as "Verified" (face-api.js default is 0.6).
export const MATCH_DISTANCE_THRESHOLD = 0.5;

let modelsLoadedPromise = null;

export function loadModels() {
  if (!modelsLoadedPromise) {
    modelsLoadedPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  }
  return modelsLoadedPromise;
}

// All faces found in a video/image/canvas element, each with a 128-d descriptor.
export function detectAllFaces(input) {
  return faceapi.detectAllFaces(input, DETECTOR_OPTIONS).withFaceLandmarks().withFaceDescriptors();
}

// The single best-scoring face's descriptor, or null if no face was found.
export async function detectSingleDescriptor(input) {
  const result = await faceapi.detectSingleFace(input, DETECTOR_OPTIONS).withFaceLandmarks().withFaceDescriptor();
  return result ? result.descriptor : null;
}

// students: [{ id, face_descriptor: number[] }]. Returns null if nobody is enrolled yet.
export function buildMatcher(students) {
  const labeled = students
    .filter((s) => Array.isArray(s.face_descriptor) && s.face_descriptor.length > 0)
    .map((s) => new faceapi.LabeledFaceDescriptors(s.id, [Float32Array.from(s.face_descriptor)]));
  return labeled.length > 0 ? new faceapi.FaceMatcher(labeled, MATCH_DISTANCE_THRESHOLD) : null;
}

export function confidenceFromDistance(distance) {
  return Math.max(0, Math.round((1 - distance) * 100));
}
