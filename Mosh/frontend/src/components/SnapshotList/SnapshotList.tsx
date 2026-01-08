import { useMemo, useState } from "react";
import "./SnapshotList.css";
import { Snapshot } from "../../models/snapshot";

interface SnapshotListProps {
  snapshots: Snapshot[];
  onDelete: (id: string) => void;
}

export function SnapshotList({ snapshots, onDelete }: SnapshotListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => snapshots.find((s) => s.id === selectedId) || null,
    [snapshots, selectedId],
  );

  if (!snapshots.length) {
    return <p className="empty-state">No snapshots yet. Start by creating your first one.</p>;
  }

  return (
    <div className="snapshot-layout">
      <section className="snapshot-list">
        <h2><i className="fas fa-images"></i> Your snapshots</h2>
        <ul>
          {snapshots.map((snapshot) => (
            <li key={snapshot.id} className="snapshot-list-item">
              <button
                className={`snapshot-list-button ${
                  snapshot.id === selectedId ? "snapshot-list-button--active" : ""
                }`}
                onClick={() => setSelectedId(snapshot.id)}
              >
                <div className="snapshot-thumb-row">
                  <img
                    src={snapshot.photos.front}
                    alt="Front view"
                    className="snapshot-thumb"
                  />
                  <img src={snapshot.photos.top} alt="Top view" className="snapshot-thumb" />
                </div>
                <div className="snapshot-meta">
                  <span className="snapshot-date">
                    {new Date(snapshot.createdAt).toLocaleString()}
                  </span>
                </div>
              </button>
              <button
                className="snapshot-delete-button"
                onClick={() => onDelete(snapshot.id)}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="snapshot-detail">
        {selected ? (
          <>
            <h2><i className="fas fa-eye"></i> Snapshot detail</h2>
            <p className="snapshot-date-large">
              Captured on {new Date(selected.createdAt).toLocaleString()}
            </p>
            <div className="snapshot-detail-grid">
              <figure>
                <img src={selected.photos.front} alt="Front view" />
                <figcaption>Front</figcaption>
              </figure>
              <figure>
                <img src={selected.photos.top} alt="Top view" />
                <figcaption>Top</figcaption>
              </figure>
            </div>
          </>
        ) : (
          <div className="empty-detail">Select a snapshot to compare front and top views.</div>
        )}
      </section>
    </div>
  );
}
