import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Snapshot, CreateSnapshotRequest, ErrorWithStatus } from "./types/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

const DATA_DIR = join(__dirname, "..", "data");
const SNAPSHOTS_FILE = join(DATA_DIR, "snapshots.json");

let snapshots: Snapshot[] = [];
let nextId = 1;

// Load snapshots from file on startup
async function loadSnapshots(): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    // Load snapshots from file if it exists
    if (existsSync(SNAPSHOTS_FILE)) {
      const data = await readFile(SNAPSHOTS_FILE, "utf-8");
      const parsed = JSON.parse(data) as { snapshots: Snapshot[]; nextId: number };
      snapshots = parsed.snapshots || [];
      nextId = parsed.nextId || 1;
      // eslint-disable-next-line no-console
      console.log(`Loaded ${snapshots.length} snapshots from file`);
    } else {
      // Initialize empty file
      await saveSnapshots();
      // eslint-disable-next-line no-console
      console.log("Created new snapshots file");
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error loading snapshots:", error);
    // Continue with empty array if file read fails
    snapshots = [];
    nextId = 1;
  }
}

// Save snapshots to file
async function saveSnapshots(): Promise<void> {
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }

    const data = {
      snapshots,
      nextId,
    };
    await writeFile(SNAPSHOTS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error saving snapshots:", error);
    throw error;
  }
}

function createSnapshotPayload(body: CreateSnapshotRequest): Snapshot {
  const { frontImageDataUrl, topImageDataUrl } = body;

  if (!frontImageDataUrl || !topImageDataUrl) {
    const error = new Error("Both frontImageDataUrl and topImageDataUrl are required") as ErrorWithStatus;
    error.status = 400;
    throw error;
  }

  const now = new Date().toISOString();
  return {
    id: String(nextId++),
    createdAt: now,
    updatedAt: now,
    photos: {
      front: frontImageDataUrl,
      top: topImageDataUrl,
    },
  };
}

app.get("/api/snapshots", (req: Request, res: Response) => {
  res.json(snapshots);
});

app.post("/api/snapshots", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshot = createSnapshotPayload(req.body);
    snapshots.unshift(snapshot);
    await saveSnapshots();
    res.status(201).json(snapshot);
  } catch (err) {
    next(err);
  }
});

app.put("/api/snapshots/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const index = snapshots.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    const existing = snapshots[index];
    const { frontImageDataUrl, topImageDataUrl } = req.body as Partial<CreateSnapshotRequest>;
    const updated: Snapshot = {
      ...existing,
      photos: {
        front: frontImageDataUrl || existing.photos.front,
        top: topImageDataUrl || existing.photos.top,
      },
      updatedAt: new Date().toISOString(),
    };
    snapshots[index] = updated;
    await saveSnapshots();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/snapshots/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const index = snapshots.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Snapshot not found" });
    }
    snapshots.splice(index, 1);
    await saveSnapshots();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Basic health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Error handler
app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// Initialize and start server
async function startServer() {
  await loadSnapshots();
  
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
