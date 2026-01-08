import { useRef, useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { PhotoCompleteData } from "../../models/photoCompleteData";
import { usePhotoCapture } from "../../hooks/usePhotoCapture";
import { extractFacePoints, validateFacePosition } from "./utils/faceDetection";
import { checkLighting } from "./utils/lighting";
import { drawMirroredVideo, drawOvalGuide } from "./utils/canvas";
import { getStatusMessage } from "./utils/statusMessages";
import {
  OVAL_DIMENSIONS,
  OVAL_POSITIONS,
  FACE_MESH_CONFIG,
  CAMERA_CONFIG,
  MIN_TIME_BETWEEN_CAPTURES,
} from "./utils/constants";
import { FaceMeshResults } from "../../models/photoCaptureModels";
import "./PhotoCapture.css";

interface PhotoCaptureProps {
  onComplete: (data: PhotoCompleteData) => void;
}

export default function PhotoCapture({ onComplete }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    step,
    status,
    facePhotoRef,
    facePhotoDelayTimerRef,
    topPhotoDelayTimerRef,
    lastCaptureTimeRef,
    setStatus,
    captureFacePhoto,
    captureTopPhoto,
    clearTimers,
  } = usePhotoCapture();

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !video || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get container dimensions for responsive sizing
    const updateCanvasSize = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      canvas.width = containerWidth;
      canvas.height = containerHeight;
    };

    // Set initial size
    updateCanvasSize();

    // Update on resize
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(container);

    let camera: Camera | null = null;

    const faceMesh = new FaceMesh({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions(FACE_MESH_CONFIG);

    faceMesh.onResults((results: FaceMeshResults) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw video mirrored (flip horizontally)
      drawMirroredVideo(ctx, video, canvas.width, canvas.height);

      // Get oval dimensions and position based on current step
      const ovalDimensions = OVAL_DIMENSIONS[step];
      const ovalPosition = OVAL_POSITIONS[step](canvas.width, canvas.height);
      const ovalCenterX = ovalPosition.x;
      const ovalCenterY = ovalPosition.y;
      const ovalWidth = ovalDimensions.width;
      const ovalHeight = ovalDimensions.height;

      let validPosition = false;
      let hasFace = false;
      let lightingGood = false;

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        hasFace = true;
        const landmarks = results.multiFaceLandmarks[0];

        // Extract face points
        const facePoints = extractFacePoints(landmarks, canvas.width, canvas.height);

        // Validate position
        validPosition = validateFacePosition(
          step,
          facePoints,
          ovalCenterX,
          ovalCenterY,
          ovalWidth,
          ovalHeight,
          canvas.width,
          canvas.height
        );

        // Check lighting
        lightingGood = checkLighting(
          ctx,
          step,
          facePoints,
          ovalCenterX,
          ovalCenterY,
          ovalWidth,
          ovalHeight
        );

        // Handle photo capture logic
        const now = Date.now();
        const timeSinceLastCapture = now - lastCaptureTimeRef.current;
        const minTimeBetweenCaptures = step === "top" ? MIN_TIME_BETWEEN_CAPTURES : 0;
        const isCapturing =
          (step === "face" && facePhotoDelayTimerRef.current !== null) ||
          (step === "top" && topPhotoDelayTimerRef.current !== null);

        if (
          validPosition &&
          lightingGood &&
          timeSinceLastCapture > minTimeBetweenCaptures &&
          !isCapturing
        ) {
          if (step === "face") {
            captureFacePhoto(video, canvas.width, canvas.height, onComplete);
          } else if (step === "top" && facePhotoRef.current) {
            captureTopPhoto(
              video,
              canvas.width,
              canvas.height,
              facePhotoRef.current,
              onComplete
            );
          }
        } else if (validPosition && lightingGood && timeSinceLastCapture <= minTimeBetweenCaptures) {
          // Too soon after last capture
          if (step === "top") {
            const remaining = Math.ceil(
              (minTimeBetweenCaptures - timeSinceLastCapture) / 1000
            );
            setStatus(
              `⏳ Please wait ${remaining} second${remaining > 1 ? "s" : ""} and position your head...`
            );
          } else {
            setStatus(`✅ ${step === "face" ? "Face" : "Top of head"} ready`);
          }
        } else if (!validPosition || !lightingGood) {
          // Clear delay timer if position or lighting becomes invalid
          if (step === "face" && facePhotoDelayTimerRef.current) {
            clearTimeout(facePhotoDelayTimerRef.current);
            facePhotoDelayTimerRef.current = null;
          }
          if (step === "top" && topPhotoDelayTimerRef.current) {
            clearTimeout(topPhotoDelayTimerRef.current);
            topPhotoDelayTimerRef.current = null;
          }

          // Update status based on validation
          const statusMsg = getStatusMessage(step, validPosition, lightingGood, hasFace, false);
          setStatus(statusMsg);
        }
      } else {
        setStatus("❌ No face detected");
      }

      // Draw target oval guide
      drawOvalGuide(ctx, ovalCenterX, ovalCenterY, ovalWidth, ovalHeight, validPosition);
    });

    camera = new Camera(video, {
      onFrame: async () => {
        await faceMesh.send({ image: video });
      },
      width: CAMERA_CONFIG.width,
      height: CAMERA_CONFIG.height,
    });
    camera.start();

    return () => {
      resizeObserver.disconnect();
      if (camera) {
        camera.stop();
      }
      faceMesh.close();
      clearTimers();
      if (facePhotoDelayTimerRef.current) {
        clearTimeout(facePhotoDelayTimerRef.current);
        facePhotoDelayTimerRef.current = null;
      }
      if (topPhotoDelayTimerRef.current) {
        clearTimeout(topPhotoDelayTimerRef.current);
        topPhotoDelayTimerRef.current = null;
      }
    };
  }, [step, onComplete, captureFacePhoto, captureTopPhoto, setStatus, clearTimers]);

  return (
    <div className="camera-container">
      <video className="video-frame" ref={videoRef} autoPlay muted playsInline />
      <canvas className="canvas-frame" ref={canvasRef} />
      <div className="status-text">{status}</div>
    </div>
  );
}
