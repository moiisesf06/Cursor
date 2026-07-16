"use client";

import type { ActivityAttempt, AppState, DayProgress, Profile } from "./types";

const STORAGE_KEY = "formykids-v1";

const emptyState = (): AppState => ({
  profiles: [],
  attempts: [],
  dayProgress: [],
});

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) } as AppState;
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function upsertProfile(profile: Profile) {
  const state = loadState();
  const idx = state.profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) state.profiles[idx] = profile;
  else state.profiles.push(profile);
  // max 2 kids
  state.profiles = state.profiles.slice(0, 2);
  saveState(state);
  return state;
}

export function deleteProfile(id: string) {
  const state = loadState();
  state.profiles = state.profiles.filter((p) => p.id !== id);
  state.attempts = state.attempts.filter((a) => a.profileId !== id);
  state.dayProgress = state.dayProgress.filter((d) => d.profileId !== id);
  saveState(state);
  return state;
}

export function saveAttempt(attempt: ActivityAttempt) {
  const state = loadState();
  state.attempts = [
    ...state.attempts.filter(
      (a) =>
        !(
          a.profileId === attempt.profileId &&
          a.day === attempt.day &&
          a.activityId === attempt.activityId &&
          a.attemptNumber === attempt.attemptNumber
        ),
    ),
    attempt,
  ];
  saveState(state);
  return state;
}

export function getLatestAttempt(
  profileId: string,
  day: number,
  activityId: string,
): ActivityAttempt | undefined {
  const state = loadState();
  return state.attempts
    .filter(
      (a) =>
        a.profileId === profileId && a.day === day && a.activityId === activityId,
    )
    .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
}

export function saveDayProgress(progress: DayProgress) {
  const state = loadState();
  const idx = state.dayProgress.findIndex(
    (d) => d.profileId === progress.profileId && d.day === progress.day,
  );
  if (idx >= 0) state.dayProgress[idx] = progress;
  else state.dayProgress.push(progress);
  saveState(state);
  return state;
}

export function getDayProgress(profileId: string, day: number) {
  return loadState().dayProgress.find(
    (d) => d.profileId === profileId && d.day === day,
  );
}

export function setAdultSession(minutes = 60) {
  const state = loadState();
  state.adultUnlockedUntil = new Date(Date.now() + minutes * 60_000).toISOString();
  saveState(state);
}

export function isAdultUnlocked() {
  const state = loadState();
  if (!state.adultUnlockedUntil) return false;
  return new Date(state.adultUnlockedUntil).getTime() > Date.now();
}

export function clearAdultSession() {
  const state = loadState();
  delete state.adultUnlockedUntil;
  saveState(state);
}

/** Current curriculum day for a profile (1-30): first incomplete day, or 30. */
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
