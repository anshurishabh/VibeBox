"use client";
import { useEffect, useRef, useState } from "react";

// Maps face-api.js expression labels to our mood vocabulary.
const EXPRESSION_TO_MOOD = {
  happy: "happy",
  sad: "sad",
  angry: "stressed",
  fearful: "stressed",
  disgusted: "stressed",
  surprised: "energetic",
  neutral: "calm",
};

export default function FaceMoodDetector({ onResult }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;
    let intervalId;
    let cancelled = false;

    async function start() {
      setStatus("loading");
      try {
        const faceapi = await import("face-api.js");
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);

        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (cancelled) return;
        videoRef.current.srcObject = stream;
        setStatus("ready");

        intervalId = setInterval(async () => {
          if (!videoRef.current) return;
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detection?.expressions) {
            const [topExpr, score] = Object.entries(detection.expressions).sort(
              (a, b) => b[1] - a[1]
            )[0];
            const mood = EXPRESSION_TO_MOOD[topExpr] || "neutral";
            onResult({ mood, confidence: score });
          }
        }, 1500);
      } catch (err) {
        console.error(err);
        setError(
          "Couldn't access the camera or load face models. Make sure model files are in /public/models (see README) and camera permission is granted."
        );
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className="flex flex-col gap-2">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full max-w-xs rounded-xl border border-paper/20 scale-x-[-1]"
      />
      {status === "loading" && <p className="text-paper/60 text-sm font-body">Starting camera…</p>}
      {status === "error" && <p className="text-moods-stressed text-sm font-body">{error}</p>}
    </div>
  );
}
