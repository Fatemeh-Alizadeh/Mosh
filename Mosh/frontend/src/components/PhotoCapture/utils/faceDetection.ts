import { CaptureStep } from "../../../models";
import { FaceLandmark, FacePoints } from "../../../models/photoCaptureModels";
import {
  FACE_LANDMARKS,
  TOP_OF_HEAD_ESTIMATE,
  RESPONSIVE_MARGINS,
  VALIDATION_THRESHOLDS,
  OVAL_DIMENSIONS,
} from "./constants";

export function extractFacePoints(
  landmarks: Array<FaceLandmark>,
  canvasWidth: number,
  canvasHeight: number
): FacePoints {
  const forehead = landmarks[FACE_LANDMARKS.FOREHEAD];
  const chin = landmarks[FACE_LANDMARKS.CHIN];
  const leftCheek = landmarks[FACE_LANDMARKS.LEFT_CHEEK];
  const rightCheek = landmarks[FACE_LANDMARKS.RIGHT_CHEEK];

  // Convert to canvas coordinates and mirror (flip x coordinates)
  const foreheadX = canvasWidth - forehead.x * canvasWidth;
  const foreheadY = forehead.y * canvasHeight;
  const chinX = canvasWidth - chin.x * canvasWidth;
  const chinY = chin.y * canvasHeight;
  const leftCheekX = canvasWidth - leftCheek.x * canvasWidth;
  const leftCheekY = leftCheek.y * canvasHeight;
  const rightCheekX = canvasWidth - rightCheek.x * canvasWidth;
  const rightCheekY = rightCheek.y * canvasHeight;

  // Estimate top of head (scalp) - about 15% of face height above forehead
  const faceHeightEstimate = Math.abs(chinY - foreheadY);
  const topOfHeadY = foreheadY - faceHeightEstimate * TOP_OF_HEAD_ESTIMATE;
  const topOfHeadX = foreheadX;

  // Calculate face dimensions
  const faceWidth = Math.abs(rightCheekX - leftCheekX);
  const faceHeight = Math.abs(chinY - foreheadY);
  const faceCenterX = (leftCheekX + rightCheekX) / 2;
  const faceCenterY = (foreheadY + chinY) / 2;

  return {
    forehead: { x: foreheadX, y: foreheadY },
    chin: { x: chinX, y: chinY },
    leftCheek: { x: leftCheekX, y: leftCheekY },
    rightCheek: { x: rightCheekX, y: rightCheekY },
    topOfHead: { x: topOfHeadX, y: topOfHeadY },
    center: { x: faceCenterX, y: faceCenterY },
    width: faceWidth,
    height: faceHeight,
  };
}

export function validateFacePosition(
  step: CaptureStep,
  facePoints: FacePoints,
  ovalCenterX: number,
  ovalCenterY: number,
  ovalWidth: number,
  ovalHeight: number,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  if (step === "face") {
    return validateFacePhotoPosition(
      facePoints,
      ovalCenterX,
      ovalCenterY,
      ovalWidth,
      canvasWidth
    );
  } else {
    return validateTopPhotoPosition(
      facePoints,
      ovalCenterX,
      ovalCenterY,
      ovalWidth,
      ovalHeight,
      canvasWidth,
      canvasHeight
    );
  }
}

function validateFacePhotoPosition(
  facePoints: FacePoints,
  ovalCenterX: number,
  ovalCenterY: number,
  ovalWidth: number,
  canvasWidth: number
): boolean {
  // Calculate distance from face center to oval center
  const dx = facePoints.center.x - ovalCenterX;
  const dy = facePoints.center.y - ovalCenterY;

  // Check if face fits within oval (with some margin - responsive)
  const marginX = canvasWidth * RESPONSIVE_MARGINS.X;
  const marginY = canvasWidth * RESPONSIVE_MARGINS.Y; // Using width for consistency
  const ovalRadiusX = ovalWidth / 2 - marginX;
  const ovalRadiusY = (OVAL_DIMENSIONS.face.height / 2) - marginY;
  const normalizedDistance = Math.sqrt(
    (dx * dx) / (ovalRadiusX * ovalRadiusX) +
    (dy * dy) / (ovalRadiusY * ovalRadiusY)
  );

  // Check if face size is appropriate (not too small or too large)
  const sizeRatio = facePoints.width / ovalWidth;
  return (
    normalizedDistance < VALIDATION_THRESHOLDS.FACE_DISTANCE &&
    sizeRatio > VALIDATION_THRESHOLDS.FACE_SIZE_MIN &&
    sizeRatio < VALIDATION_THRESHOLDS.FACE_SIZE_MAX
  );
}

function validateTopPhotoPosition(
  facePoints: FacePoints,
  ovalCenterX: number,
  ovalCenterY: number,
  ovalWidth: number,
  ovalHeight: number,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  // For top view: we want to capture the top of the head (hair/scalp)
  const dx = facePoints.topOfHead.x - ovalCenterX;
  const dy = facePoints.topOfHead.y - ovalCenterY;
  const marginX = canvasWidth * RESPONSIVE_MARGINS.X;
  const marginY = canvasHeight * RESPONSIVE_MARGINS.Y;
  const ovalRadiusX = ovalWidth / 2 - marginX;
  const ovalRadiusY = ovalHeight / 2 - marginY;
  const normalizedDistance = Math.sqrt(
    (dx * dx) / (ovalRadiusX * ovalRadiusX) +
    (dy * dy) / (ovalRadiusY * ovalRadiusY)
  );

  // Top of head should be within the oval
  // Head should be tilted back (chin lower than forehead, but not too much)
  // Face should be visible but head should be tilted
  const headTilted =
    facePoints.chin.y >
    facePoints.forehead.y + canvasHeight * VALIDATION_THRESHOLDS.HEAD_TILT_THRESHOLD;
  const topInOval = normalizedDistance < VALIDATION_THRESHOLDS.TOP_DISTANCE;
  const faceVisible =
    facePoints.chin.y <
    canvasHeight - canvasHeight * VALIDATION_THRESHOLDS.FACE_VISIBILITY_THRESHOLD;

  return topInOval && headTilted && faceVisible;
}
