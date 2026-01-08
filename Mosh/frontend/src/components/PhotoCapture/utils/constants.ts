import { CaptureStep } from "../../../models";

export const PHOTO_CAPTURE_DELAY = 2000; // 2 seconds
export const MIN_TIME_BETWEEN_CAPTURES = 3000; // 3 seconds for top photo
export const CAPTURE_EXECUTION_DELAY = 300; // Small delay before actual capture

export const OVAL_DIMENSIONS: Record<CaptureStep, { width: number; height: number }> = {
  face: { width: 240, height: 320 },
  top: { width: 240, height: 180 },
};

export const OVAL_POSITIONS: Record<CaptureStep, (canvasWidth: number, canvasHeight: number) => { x: number; y: number }> = {
  face: (width, height) => ({ x: width / 2, y: height / 2 + 20 }),
  top: (width) => ({ x: width / 2, y: 100 }),
};

export const LIGHTING_THRESHOLDS = {
  MIN_BRIGHTNESS: 80,
  MAX_BRIGHTNESS: 200,
};

export const VALIDATION_THRESHOLDS = {
  FACE_DISTANCE: 0.7,
  FACE_SIZE_MIN: 0.6,
  FACE_SIZE_MAX: 1.2,
  TOP_DISTANCE: 0.8,
  HEAD_TILT_THRESHOLD: 0.063, 
  FACE_VISIBILITY_THRESHOLD: 0.104,
};

export const RESPONSIVE_MARGINS = {
  X: 0.031,
  Y: 0.042,
};

export const FACE_MESH_CONFIG = {
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
};

export const CAMERA_CONFIG = {
  width: 640,
  height: 480,
};

export const FACE_LANDMARKS = {
  FOREHEAD: 10,
  CHIN: 152,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
};

export const TOP_OF_HEAD_ESTIMATE = 0.15; // 15% of face height above forehead
