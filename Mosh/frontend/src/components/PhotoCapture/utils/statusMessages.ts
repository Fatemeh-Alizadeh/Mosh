import { CaptureStep } from "../../../models";

export function getStatusMessage(
  step: CaptureStep,
  validPosition: boolean,
  lightingGood: boolean,
  hasFace: boolean,
  isCapturing: boolean,
  countdown?: number
): string {
  if (isCapturing) {
    return step === "face" ? "📸 Capturing face photo..." : "📸 Capturing top photo...";
  }

  if (!hasFace) {
    return "❌ No face detected";
  }

  if (!lightingGood) {
    return "💡 Please improve lighting";
  }

  if (!validPosition) {
    if (step === "face") {
      return "⬜ Please move your face into the oval";
    } else {
      return "⬜ Tilt your head back and position the top of your head (hair/scalp) in the oval";
    }
  }

  if (countdown !== undefined && countdown > 0) {
    const stepName = step === "face" ? "Face" : "Top of head";
    return `✅ ${stepName} ready - Capturing in ${countdown} second${countdown > 1 ? "s" : ""}...`;
  }

  if (step === "face") {
    return "✅ Face ready";
  } else {
    return "✅ Top of head ready";
  }
}

export function getTransitionMessage(step: CaptureStep): string {
  if (step === "top") {
    return "Tilt your head back and position the top of your head (hair/scalp) in the oval";
  }
  return "";
}
