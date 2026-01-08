import { useRef, useState, useCallback } from "react";
import { CaptureStep } from "../models";
import { PhotoCompleteData } from "../models/photoCompleteData";
import {
  PHOTO_CAPTURE_DELAY,
  CAPTURE_EXECUTION_DELAY,
} from "../components/PhotoCapture/utils/constants";
import { capturePhotoFromVideo } from "../components/PhotoCapture/utils/canvas";

interface UsePhotoCaptureReturn {
  photos: { face: string | null; top: string | null };
  step: CaptureStep;
  status: string;
  facePhotoRef: React.MutableRefObject<string | null>;
  facePhotoDelayTimerRef: React.MutableRefObject<number | null>;
  topPhotoDelayTimerRef: React.MutableRefObject<number | null>;
  lastCaptureTimeRef: React.MutableRefObject<number>;
  setStep: (step: CaptureStep) => void;
  setStatus: (status: string) => void;
  captureFacePhoto: (
    video: HTMLVideoElement,
    canvasWidth: number,
    canvasHeight: number,
    onComplete: (data: PhotoCompleteData) => void
  ) => void;
  captureTopPhoto: (
    video: HTMLVideoElement,
    canvasWidth: number,
    canvasHeight: number,
    facePhoto: string,
    onComplete: (data: PhotoCompleteData) => void
  ) => void;
  clearTimers: () => void;
}

export function usePhotoCapture(): UsePhotoCaptureReturn {
  const [photos, setPhotos] = useState<{ face: string | null; top: string | null }>({
    face: null,
    top: null,
  });
  const [step, setStep] = useState<CaptureStep>("face");
  const [status, setStatus] = useState<string>("Loading models...");
  
  const facePhotoRef = useRef<string | null>(null);
  const topPhotoDelayTimerRef = useRef<number | null>(null);
  const facePhotoDelayTimerRef = useRef<number | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);
  const countdownIntervalRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (facePhotoDelayTimerRef.current) {
      clearTimeout(facePhotoDelayTimerRef.current);
      facePhotoDelayTimerRef.current = null;
    }
    if (topPhotoDelayTimerRef.current) {
      clearTimeout(topPhotoDelayTimerRef.current);
      topPhotoDelayTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const captureFacePhoto = useCallback(
    (
      video: HTMLVideoElement,
      canvasWidth: number,
      canvasHeight: number,
      onComplete: (data: PhotoCompleteData) => void
    ) => {
      if (facePhotoDelayTimerRef.current) return;

      setStatus("✅ Face ready - Capturing in 2 seconds...");

      let countdown = 2;
      countdownIntervalRef.current = window.setInterval(() => {
        countdown--;
        if (countdown > 0) {
          setStatus(
            `✅ Face ready - Capturing in ${countdown} second${countdown > 1 ? "s" : ""}...`
          );
        }
      }, 1000);

      facePhotoDelayTimerRef.current = window.setTimeout(() => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setStatus("📸 Capturing...");
        lastCaptureTimeRef.current = Date.now();

        setTimeout(() => {
          const photo = capturePhotoFromVideo(video, canvasWidth, canvasHeight);
          facePhotoRef.current = photo;
          setPhotos((prev) => ({ ...prev, face: photo }));
          setStep("top");
          setStatus("Tilt your head back and position the top of your head (hair/scalp) in the oval");
          facePhotoDelayTimerRef.current = null;
        }, CAPTURE_EXECUTION_DELAY);
      }, PHOTO_CAPTURE_DELAY);
    },
    []
  );

  const captureTopPhoto = useCallback(
    (
      video: HTMLVideoElement,
      canvasWidth: number,
      canvasHeight: number,
      facePhoto: string,
      onComplete: (data: PhotoCompleteData) => void
    ) => {
      if (topPhotoDelayTimerRef.current) return;

      setStatus("✅ Top of head ready - Capturing in 2 seconds...");

      let countdown = 2;
      countdownIntervalRef.current = window.setInterval(() => {
        countdown--;
        if (countdown > 0) {
          setStatus(
            `✅ Top of head ready - Capturing in ${countdown} second${countdown > 1 ? "s" : ""}...`
          );
        }
      }, 1000);

      topPhotoDelayTimerRef.current = window.setTimeout(() => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setStatus("📸 Capturing...");
        lastCaptureTimeRef.current = Date.now();

        setTimeout(() => {
          const photo = capturePhotoFromVideo(video, canvasWidth, canvasHeight);
          setPhotos((prev) => ({ ...prev, top: photo }));
          setStatus("All photos captured ✅");
          topPhotoDelayTimerRef.current = null;

          if (onComplete && facePhoto) {
            onComplete({
              frontImageDataUrl: facePhoto,
              topImageDataUrl: photo,
            });
          }
        }, CAPTURE_EXECUTION_DELAY);
      }, PHOTO_CAPTURE_DELAY);
    },
    []
  );

  return {
    photos,
    step,
    status,
    facePhotoRef,
    facePhotoDelayTimerRef,
    topPhotoDelayTimerRef,
    lastCaptureTimeRef,
    setStep,
    setStatus,
    captureFacePhoto,
    captureTopPhoto,
    clearTimers,
  };
}
