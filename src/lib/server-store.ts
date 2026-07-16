import { promises as fs } from "fs";
import path from "path";
import type { AppState } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "formykids-state.json");

export function emptyState(): AppState {
  return {
    profiles: [],
    attempts: [],
    dayProgress: [],
  };
}

let writeChain: Promise<void> = Promise.resolve();

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readServerState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...emptyState(),
      ...parsed,
      profiles: parsed.profiles ?? [],
      attempts: parsed.attempts ?? [],
      dayProgress: parsed.dayProgress ?? [],
    };
  } catch {
    return emptyState();
  }
}

async function writeServerStateNow(state: AppState) {
  await ensureDataDir();
  const tmp = `${DATA_FILE}.tmp`;
  const payload = JSON.stringify(
    {
      profiles: state.profiles,
      attempts: state.attempts,
      dayProgress: state.dayProgress,
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  );
  await fs.writeFile(tmp, payload, "utf8");
  await fs.rename(tmp, DATA_FILE);
}

/** Serialize writes so concurrent tablet requests don't clobber each other. */
export function writeServerState(state: AppState): Promise<void> {
  writeChain = writeChain.then(
    () => writeServerStateNow(state),
    () => writeServerStateNow(state),
  );
  return writeChain;
}

export async function updateServerState(
  updater: (state: AppState) => AppState,
): Promise<AppState> {
  let result = emptyState();
  writeChain = writeChain.then(async () => {
    const current = await readServerState();
    result = updater(current);
    await writeServerStateNow(result);
  });
  await writeChain;
  return result;
}
