import { CaptureStep } from "../../../models";
import { FacePoints } from "../../../models/photoCaptureModels";
import { LIGHTING_THRESHOLDS } from "./constants";

export function checkLighting(
  ctx: CanvasRenderingContext2D,
  step: CaptureStep,
  facePoints: FacePoints,
  ovalCenterX: number,
  ovalCenterY: number,
  ovalWidth: number,
  ovalHeight: number
): boolean {
  let imageData: ImageData;

  if (step === "face") {
    // Sample from face area
    const minX = Math.min(
      facePoints.forehead.x,
      facePoints.chin.x,
      facePoints.leftCheek.x,
      facePoints.rightCheek.x
    );
    const maxX = Math.max(
      facePoints.forehead.x,
      facePoints.chin.x,
      facePoints.leftCheek.x,
      facePoints.rightCheek.x
    );
    const minY = Math.min(
      facePoints.forehead.y,
      facePoints.chin.y,
      facePoints.leftCheek.y,
      facePoints.rightCheek.y
    );
    const maxY = Math.max(
      facePoints.forehead.y,
      facePoints.chin.y,
      facePoints.leftCheek.y,
      facePoints.rightCheek.y
    );
    const width = maxX - minX;
    const height = maxY - minY;
    imageData = ctx.getImageData(minX, minY, width, height);
  } else {
    // For top view, sample from the oval area
    const sampleX = ovalCenterX - ovalWidth / 2;
    const sampleY = ovalCenterY - ovalHeight / 2;
    imageData = ctx.getImageData(sampleX, sampleY, ovalWidth, ovalHeight);
  }

  const pixels = imageData.data;
  let total = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    total += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
  }
  const avgBrightness = total / (pixels.length / 4);

  return (
    avgBrightness > LIGHTING_THRESHOLDS.MIN_BRIGHTNESS &&
    avgBrightness < LIGHTING_THRESHOLDS.MAX_BRIGHTNESS
  );
}
