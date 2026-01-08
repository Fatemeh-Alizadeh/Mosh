import { useState } from "react";
import "./SnapshotCapture.css";
import PhotoCapture from "../PhotoCapture/PhotoCapture";
import { CreateSnapshotPayload } from "../../models/createSnapshotPayload";
import { PhotoCompleteData } from "../../models/photoCompleteData";

interface SnapshotCaptureProps {
  onSave: (payload: CreateSnapshotPayload) => Promise<void>;
  onCancel: () => void;
}

export function SnapshotCapture({ onSave, onCancel }: SnapshotCaptureProps) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [topImage, setTopImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCapturing, setIsCapturing] = useState(true);

  async function handlePhotoComplete(data: PhotoCompleteData): Promise<void> {
    setFrontImage(data.frontImageDataUrl);
    setTopImage(data.topImageDataUrl);
    setIsCapturing(false);
  }

  async function handleSave(): Promise<void> {
    if (!frontImage || !topImage) return;
    setIsSaving(true);
    try {
      await onSave({ frontImageDataUrl: frontImage, topImageDataUrl: topImage });
    } finally {
      setIsSaving(false);
    }
  }

  function handleRetake(): void {
    setFrontImage(null);
    setTopImage(null);
    setIsCapturing(true);
  }

  const canSave = Boolean(frontImage && topImage && !isSaving);

  return (
    <div className="capture-shell">
      <h2><i className="fas fa-camera-retro"></i> New snapshot</h2>
      
      {isCapturing ? (
        <div className="photo-capture-container">
          <p className="helper-text" style={{ marginBottom: "16px" }}>
            Position your face in the box. The photo will be captured automatically when your face is in the correct position.
          </p>
          <PhotoCapture onComplete={handlePhotoComplete} />
          <div className="capture-controls">
            <button
              className="secondary-button"
              type="button"
              onClick={onCancel}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="capture-grid">
          <section className="capture-summary">
            <h3><i className="fas fa-clipboard-list"></i> Snapshot summary</h3>
            <div className="capture-summary-grid">
              <figure>
                {frontImage ? (
                  <img src={frontImage} alt="Front preview" />
                ) : (
                  <div className="placeholder">Front photo not captured yet</div>
                )}
                <figcaption>Front</figcaption>
              </figure>
              <figure>
                {topImage ? (
                  <img src={topImage} alt="Top preview" />
                ) : (
                  <div className="placeholder">Top photo not captured yet</div>
                )}
                <figcaption>Top</figcaption>
              </figure>
            </div>

            <div className="capture-footer-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleRetake}
              >
                <i className="fas fa-redo"></i> Retake photos
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={!canSave}
                onClick={handleSave}
              >
                <i className={`fas ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {isSaving ? "Saving..." : "Save snapshot"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
