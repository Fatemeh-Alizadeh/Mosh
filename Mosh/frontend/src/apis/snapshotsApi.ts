import { Snapshot } from "../models/snapshot";
import { CreateSnapshotPayload } from "../models/createSnapshotPayload";

const API_BASE_URL = "/api/snapshots";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function getSnapshots(): Promise<Snapshot[]> {
  const response = await fetch(API_BASE_URL);
  return handleResponse<Snapshot[]>(response);
}

export async function createSnapshot(payload: CreateSnapshotPayload): Promise<Snapshot> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Snapshot>(response);
}

export async function updateSnapshot(id: string, payload: Partial<CreateSnapshotPayload>): Promise<Snapshot> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Snapshot>(response);
}

export async function deleteSnapshot(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  
  // 404 is acceptable for delete operations (idempotent)
  if (!response.ok && response.status !== 404) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody.message || "Failed to delete snapshot");
  }
}
