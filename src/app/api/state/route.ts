import { NextResponse } from "next/server";
import type { ActivityAttempt, DayProgress, Profile } from "@/lib/types";
import { emptyState, readServerState, updateServerState } from "@/lib/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Mutation =
  | { op: "replace"; state: { profiles: Profile[]; attempts: ActivityAttempt[]; dayProgress: DayProgress[] } }
  | { op: "upsertProfile"; profile: Profile }
  | { op: "deleteProfile"; profileId: string }
  | { op: "saveAttempt"; attempt: ActivityAttempt }
  | { op: "saveDayProgress"; progress: DayProgress };

function publicState(state: Awaited<ReturnType<typeof readServerState>>) {
  return {
    profiles: state.profiles,
    attempts: state.attempts,
    dayProgress: state.dayProgress,
  };
}

export async function GET() {
  const state = await readServerState();
  return NextResponse.json(publicState(state));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Mutation;

  const next = await updateServerState((state) => {
    const draft = {
      profiles: [...state.profiles],
      attempts: [...state.attempts],
      dayProgress: [...state.dayProgress],
    };

    switch (body.op) {
      case "replace": {
        return {
          ...emptyState(),
          profiles: body.state.profiles.slice(0, 2),
          attempts: body.state.attempts,
          dayProgress: body.state.dayProgress,
        };
      }
      case "upsertProfile": {
        const idx = draft.profiles.findIndex((p) => p.id === body.profile.id);
        if (idx >= 0) draft.profiles[idx] = body.profile;
        else draft.profiles.push(body.profile);
        draft.profiles = draft.profiles.slice(0, 2);
        return draft;
      }
      case "deleteProfile": {
        draft.profiles = draft.profiles.filter((p) => p.id !== body.profileId);
        draft.attempts = draft.attempts.filter((a) => a.profileId !== body.profileId);
        draft.dayProgress = draft.dayProgress.filter((d) => d.profileId !== body.profileId);
        return draft;
      }
      case "saveAttempt": {
        draft.attempts = [
          ...draft.attempts.filter(
            (a) =>
              !(
                a.profileId === body.attempt.profileId &&
                a.day === body.attempt.day &&
                a.activityId === body.attempt.activityId &&
                a.attemptNumber === body.attempt.attemptNumber
              ),
          ),
          body.attempt,
        ];
        return draft;
      }
      case "saveDayProgress": {
        const idx = draft.dayProgress.findIndex(
          (d) =>
            d.profileId === body.progress.profileId && d.day === body.progress.day,
        );
        if (idx >= 0) draft.dayProgress[idx] = body.progress;
        else draft.dayProgress.push(body.progress);
        return draft;
      }
      default:
        return state;
    }
  });

  return NextResponse.json(publicState(next));
}
