export interface Snapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  photos: {
    front: string;
    top: string;
  };
}

export interface CreateSnapshotRequest {
  frontImageDataUrl: string;
  topImageDataUrl: string;
}

export interface ErrorWithStatus extends Error {
  status?: number;
}
