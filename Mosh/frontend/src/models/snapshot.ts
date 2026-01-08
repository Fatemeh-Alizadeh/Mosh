export interface Snapshot {
  id: string;
  createdAt: string;
  updatedAt: string;
  photos: {
    front: string;
    top: string;
  };
}