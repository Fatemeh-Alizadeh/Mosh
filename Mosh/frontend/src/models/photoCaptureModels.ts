export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export interface FaceMeshResults {
  multiFaceLandmarks?: Array<Array<FaceLandmark>>;
}

export interface FacePoints {
  forehead: { x: number; y: number };
  chin: { x: number; y: number };
  leftCheek: { x: number; y: number };
  rightCheek: { x: number; y: number };
  topOfHead: { x: number; y: number };
  center: { x: number; y: number };
  width: number;
  height: number;
}

export interface OvalDimensions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface ValidationResult {
  validPosition: boolean;
  lightingGood: boolean;
  hasFace: boolean;
}
