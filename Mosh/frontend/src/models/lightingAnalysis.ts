export interface LightingAnalysis {
  averageBrightness: number;
  status: "ok" | "too-dark" | "too-bright";
  label: string;
}