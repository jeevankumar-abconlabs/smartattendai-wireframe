import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';
import './WebcamCapture.css';

// Renders a live <video> fed by getUserMedia and exposes the video element
// itself via ref, so callers can pass it straight into face-api.js or
// captureFrame() below. One component covers both the enrollment snapshot
// flow and the dashboard's continuous recognition loop.
const WebcamCapture = forwardRef(function WebcamCapture(_props, ref) {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useImperativeHandle(ref, () => videoRef.current, []);

  useEffect(() => {
    let stream;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError('Camera access denied or unavailable.'));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (error) {
    return (
      <div className="webcam-box webcam-box--error">
        <VideoOff size={24} strokeWidth={1.5} />
        <p className="webcam-box__error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="webcam-box">
      <video ref={videoRef} className="webcam-box__video" autoPlay muted playsInline />
    </div>
  );
});

export default WebcamCapture;
