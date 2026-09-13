import logging
import os
import uuid
from datetime import datetime, timezone

import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from insightface.app import FaceAnalysis
from supabase import create_client

load_dotenv(override=True)  # .env is the source of truth, not a stray shell $env: var from an old session

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logging.getLogger("httpx").setLevel(logging.WARNING)  # supabase-py's client — noisy at INFO
logging.getLogger("httpcore").setLevel(logging.WARNING)
logger = logging.getLogger("smartattend")

THRESHOLD = 0.5  # cosine similarity — same tuning validated in the desktop prototype

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_ANON_KEY"]
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print(f"Loading InsightFace model ({os.environ.get('FACE_MODEL', 'buffalo_sc')}) ...")
face_app = FaceAnalysis(
    name=os.environ.get("FACE_MODEL", "buffalo_sc"),
    providers=["CPUExecutionProvider"],
    allowed_modules=["detection", "recognition"],  # skip landmark/genderage — dead weight for attendance
)
face_app.prepare(ctx_id=0, det_thresh=0.35, det_size=(int(os.environ.get("DET_SIZE", "960")),) * 2)

app = FastAPI(title="SmartAttend Face Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


def decode_image(raw: bytes):
    img = cv2.imdecode(np.frombuffer(raw, dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(400, "Could not decode image.")
    return img


def best_face(img):
    """Largest detected face, same tie-break as the desktop enrollment script."""
    faces = face_app.get(img)
    if not faces:
        return None
    return max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))


def identify(embedding, rows):
    """Best cosine similarity against every enrolled angle of every student.

    rows: face_embeddings rows, each with its embedding plus the joined
    student. Matching per-angle (not against a single averaged descriptor)
    is what lets a side-on camera frame match a stored profile shot instead
    of a blurred-out "mean face" — same reasoning as the desktop prototype.
    """
    best_student, best_score = None, -1.0
    for row in rows:
        ref = np.array(row["embedding"], dtype=np.float32)
        if ref.shape != embedding.shape:
            continue
        norm = np.linalg.norm(ref)
        if norm == 0:
            continue
        score = float(np.dot(embedding, ref / norm))
        if score > best_score:
            best_score, best_student = score, row["students"]
    if best_student is None or best_score < THRESHOLD:
        return None, "Unknown", best_score
    return best_student, best_student["name"], best_score


def already_logged_today(student_id: str) -> bool:
    start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    res = (
        supabase.table("attendance_logs")
        .select("id")
        .eq("student_id", student_id)
        .gte("created_at", start.isoformat())
        .limit(1)
        .execute()
    )
    return len(res.data) > 0


@app.get("/health")
def health():
    return {"status": "ok", "model": os.environ.get("FACE_MODEL", "buffalo_sc")}


@app.post("/enroll")
async def enroll(
    name: str = Form(...),
    roll: str = Form(""),
    student_class: str = Form(""),
    section: str = Form(""),
    photos: list[UploadFile] = File(...),
):
    embeddings = []
    profile_photo_bytes = None
    skipped = 0

    for photo in photos:
        img = decode_image(await photo.read())
        face = best_face(img)
        if face is None or face.normed_embedding is None:
            skipped += 1
            continue
        embeddings.append(face.normed_embedding)
        if profile_photo_bytes is None:
            ok, buf = cv2.imencode(".jpg", img)
            profile_photo_bytes = buf.tobytes()

    if not embeddings:
        raise HTTPException(422, "No face detected in any of the photos. Try better lighting / face the camera.")

    file_name = f"{uuid.uuid4()}.jpg"
    supabase.storage.from_("student-photos").upload(
        file_name, profile_photo_bytes, {"content-type": "image/jpeg"}
    )
    photo_url = supabase.storage.from_("student-photos").get_public_url(file_name)

    student_row = {
        "name": name,
        "roll": roll or None,
        "class": student_class or None,
        "section": section or None,
        "photo_url": photo_url,
        "face_descriptor": embeddings[0].tolist(),  # kept for the column's NOT NULL constraint / a quick preview
    }
    student = supabase.table("students").insert(student_row).execute().data[0]

    supabase.table("face_embeddings").insert([
        {"student_id": student["id"], "embedding": e.tolist()} for e in embeddings
    ]).execute()

    return {"student": student, "angles_enrolled": len(embeddings), "angles_skipped": skipped}


@app.post("/recognize")
async def recognize(photo: UploadFile = File(...)):
    img = decode_image(await photo.read())
    face = best_face(img)
    if face is None or face.normed_embedding is None:
        return {"status": "no_face"}

    # [x1, y1, x2, y2] in the pixel space of the uploaded frame — the frontend
    # maps this onto the displayed (mirrored, object-fit: cover) video itself.
    bbox = [round(v) for v in face.bbox.tolist()]

    rows = (
        supabase.table("face_embeddings")
        .select("embedding, students(id, name, class, roll)")
        .execute()
        .data
    )
    student, name, score = identify(face.normed_embedding, rows)
    confidence = round(max(score, 0) * 100)

    if student is None:
        logger.info("Unknown face detected (confidence=%d%%, best score=%.3f)", confidence, score)
        return {"status": "unknown", "confidence": confidence, "bbox": bbox}

    student_id = student["id"]
    already_logged = already_logged_today(student_id)
    logger.info(
        "Recognized name=%s student_id=%s class=%s roll=%s confidence=%d%% already_logged_today=%s",
        student["name"], student_id, student["class"], student["roll"], confidence, already_logged,
    )
    if not already_logged:
        supabase.table("attendance_logs").insert({
            "student_id": student_id,
            "name": student["name"],
            "class": student["class"],
            "roll": student["roll"],
            "confidence": confidence,
            "status": "Verified",
            "logged_by": "Camera",
        }).execute()

    return {
        "status": "matched",
        "student_id": student_id,
        "name": name,
        "confidence": confidence,
        "already_logged_today": already_logged,
        "bbox": bbox,
    }
