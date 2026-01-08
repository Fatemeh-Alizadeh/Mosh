import { useEffect, useState } from "react";
import { SnapshotList } from "./components/SnapshotList/SnapshotList";
import { SnapshotCapture } from "./components/SnapshotCapture/SnapshotCapture";
import moshLogo from "./assets/images/mosh.svg";
import blowDryGif from "./assets/gifs/hairgif-purplebg.avif";
import { Snapshot } from "./models/snapshot";
import { CreateSnapshotPayload } from "./models/createSnapshotPayload";
import { View } from "./models";
import { getSnapshots, createSnapshot, deleteSnapshot } from "./apis/snapshotsApi";

export function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [currentView, setCurrentView] = useState<View>("LIST");

  async function loadSnapshots(): Promise<void> {
    const data = await getSnapshots();
    setSnapshots(data);
  }

  useEffect(() => {
    loadSnapshots().catch((err) => {
      // eslint-disable-next-line no-console
      console.error("Failed to load snapshots", err);
    });
  }, []);

  async function handleCreateSnapshot(payload: CreateSnapshotPayload): Promise<void> {
    const created = await createSnapshot(payload);
    setSnapshots((prev) => [created, ...prev]);
    setCurrentView("LIST");
  }

  async function handleDeleteSnapshot(id: string): Promise<void> {
    await deleteSnapshot(id);
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="main">
      <header className="app-header">
        <img src={moshLogo} alt="Mosh" className="app-logo" />
      </header>
      <main>
        <div className="main-banner">
          <div className="banner-board">
            <h4 className="banner-desc">Clinically proven female hair regrowth solutions</h4>
            <h1 className="banner-title">Thicker, fuller hair starts here</h1>
            <button
              className="primary-button"
              onClick={() => setCurrentView("CAPTURE")}
            >
              <i className="fas fa-camera"></i> New snapshot
            </button>
          </div>
          <div className="banner-gif">
            <img src={blowDryGif} alt="women's hair blowdry" className="blowdry" />
          </div>
        </div>

        {currentView === "LIST" && (
          <>
            <SnapshotList
              snapshots={snapshots}
              onDelete={handleDeleteSnapshot}
            />
          </>
        )}

        {currentView === "CAPTURE" && (
          <div className="modal-backdrop">
            <div className="modal-window">
              <button
                className="modal-close-button"
                type="button"
                onClick={() => setCurrentView("LIST")}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
              <SnapshotCapture
                onCancel={() => setCurrentView("LIST")}
                onSave={handleCreateSnapshot}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
