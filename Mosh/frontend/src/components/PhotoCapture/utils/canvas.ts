export function drawMirroredVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -canvasWidth, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

export function drawOvalGuide(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  isValid: boolean
): void {
  ctx.save();
  
  // Draw outer guide oval
  ctx.strokeStyle = isValid ? "#10b981" : "#ef4444";
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, width / 2, height / 2, 0, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Draw inner guide oval (slightly smaller)
  ctx.strokeStyle = isValid ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, width / 2 - 10, height / 2 - 10, 0, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.restore();
}

export function capturePhotoFromVideo(
  video: HTMLVideoElement,
  canvasWidth: number,
  canvasHeight: number
): string {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvasWidth;
  tempCanvas.height = canvasHeight;
  const tempCtx = tempCanvas.getContext("2d");
  
  if (!tempCtx) {
    throw new Error("Failed to get canvas context");
  }
  
  tempCtx.save();
  tempCtx.scale(-1, 1);
  tempCtx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
  tempCtx.restore();
  
  return tempCanvas.toDataURL("image/png");
}
