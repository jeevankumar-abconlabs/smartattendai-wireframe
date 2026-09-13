// Talks to the FastAPI face-recognition backend (backend/main.py) instead of
// running face-api.js in the browser.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function postForm(path, formData) {
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail?.[0]?.msg || data.detail || 'Request failed');
  return data;
}

// form: { fullName, roll, class, section }, photoBlobs: Blob[] (one per captured angle)
export function enrollStudent(form, photoBlobs) {
  const body = new FormData();
  body.append('name', form.fullName);
  body.append('roll', form.roll);
  body.append('student_class', form.class);
  body.append('section', form.section);
  photoBlobs.forEach((blob, i) => body.append('photos', blob, `photo-${i}.jpg`));
  return postForm('/enroll', body);
}

// Returns { status: 'matched'|'unknown'|'no_face', student_id?, name?, confidence?, already_logged_today? }
export function recognizeFace(photoBlob) {
  const body = new FormData();
  body.append('photo', photoBlob, 'frame.jpg');
  return postForm('/recognize', body);
}
