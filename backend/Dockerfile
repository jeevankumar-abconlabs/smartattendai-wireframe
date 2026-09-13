FROM python:3.11-slim

# insightface's optional 3D-mesh extension needs a C++ compiler to build from
# source on Linux (unlike the Windows dev box, there's no prebuilt wheel to
# fall back to here). libglib2.0-0 is a common runtime need for opencv-python-headless.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the model weights into the image at build time so a cold start on
# Render's ephemeral disk doesn't need to hit GitHub at runtime.
ARG FACE_MODEL=buffalo_sc
ENV FACE_MODEL=${FACE_MODEL}
RUN python -c "from insightface.app import FaceAnalysis; FaceAnalysis(name='${FACE_MODEL}', allowed_modules=['detection','recognition']).prepare(ctx_id=-1, det_size=(640, 640))"

COPY main.py .

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
