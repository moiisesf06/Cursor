"use client";

import type { ActivityAttempt, AppState, DayProgress, Profile } from "./types";

const LEGACY_KEY = "formykids-v1";
const ADULT_KEY = "formykids-adult-until";
const MIGRATED_KEY = "formykids-migrated-to-server";

const emptyState = (): AppState => ({
  profiles: [],
  attempts: [],
  dayProgress: [],
});

let cache: AppState = emptyState();
let loadPromise: Promise<AppState> | null = null;

function applyCache(state: AppState) {
  cache = {
    profiles: state.profiles ?? [],
    attempts: state.attempts ?? [],
    dayProgress: state.dayProgress ?? [],
  };
  return cache;
}

async function postMutation(body: unknown): Promise<AppState> {
  const res = await fetch("/api/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`No se pudo guardar en el servidor (${res.status})`);
  }
  return applyCache((await res.json()) as AppState);
}

/** Sync snapshot from PC server. Safe to call often. */
export async function refreshState(): Promise<AppState> {
  if (typeof window === "undefined") return emptyState();

  if (!loadPromise) {
    loadPromise = (async () => {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo leer el estado del servidor");
      const remote = applyCache((await res.json()) as AppState);

      // One-time migration from old localStorage → server if server empty
      const migrated = localStorage.getItem(MIGRATED_KEY);
      if (!migrated && remote.profiles.length === 0) {
        const legacyRaw = localStorage.getItem(LEGACY_KEY);
        if (legacyRaw) {
          try {
            const legacy = JSON.parse(legacyRaw) as AppState;
            if ((legacy.profiles?.length ?? 0) > 0) {
              const merged = await postMutation({
                op: "replace",
                state: {
                  profiles: legacy.profiles ?? [],
                  attempts: legacy.attempts ?? [],
                  dayProgress: legacy.dayProgress ?? [],
                },
              });
              localStorage.setItem(MIGRATED_KEY, "1");
              return merged;
            }
          } catch {
            // ignore bad legacy payload
          }
        }
      }
      localStorage.setItem(MIGRATED_KEY, "1");
      return remote;
    })().finally(() => {
      loadPromise = null;
    });
  }

  return loadPromise;
}

/** Latest known state (may be stale until refreshState). */
export function loadState(): AppState {
  return cache;
}

export async function upsertProfile(profile: Profile) {
  return postMutation({ op: "upsertProfile", profile });
}

export async function deleteProfile(id: string) {
  return postMutation({ op: "deleteProfile", profileId: id });
}

export async function saveAttempt(attempt: ActivityAttempt) {
  return postMutation({ op: "saveAttempt", attempt });
}

export function getLatestAttempt(
  profileId: string,
  day: number,
  activityId: string,
): ActivityAttempt | undefined {
  return loadState()
    .attempts.filter(
      (a) =>
        a.profileId === profileId && a.day === day && a.activityId === activityId,
    )
    .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
}

export async function saveDayProgress(progress: DayProgress) {
  return postMutation({ op: "saveDayProgress", progress });
}

export function getDayProgress(profileId: string, day: number) {
  return loadState().dayProgress.find(
    (d) => d.profileId === profileId && d.day === day,
  );
}

/** Adult unlock stays on the device session only (not synced). */
export function setAdultSession(minutes = 60) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    ADULT_KEY,
    new Date(Date.now() + minutes * 60_000).toISOString(),
  );
}

export function isAdultUnlocked() {
  if (typeof window === "undefined") return false;
  const until = sessionStorage.getItem(ADULT_KEY);
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

export function clearAdultSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADULT_KEY);
}

export function getCurrentDay(profileId: string): number {
  const state = loadState();
  for (let d = 1; d <= 30; d++) {
    const p = state.dayProgress.find(
      (x) => x.profileId === profileId && x.day === d && x.completed,
    );
    if (!p) return d;
  }
  return 30;
}
