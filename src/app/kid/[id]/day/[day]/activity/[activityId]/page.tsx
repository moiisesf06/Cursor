"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ActivityPlayer } from "@/components/ActivityPlayer";
import { getDayPlan } from "@/lib/content";
import { loadState } from "@/lib/storage";
import type { ActivityContent, Profile } from "@/lib/types";

export default function ActivityPage() {
  const params = useParams<{ id: string; day: string; activityId: string }>();
  const day = Number(params.day);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<ActivityContent | null>(null);

  useEffect(() => {
    const p = loadState().profiles.find((x) => x.id === params.id) ?? null;
    setProfile(p);
    if (p) {
      const plan = getDayPlan(p.ageGroup, day);
      setActivity(plan.activities.find((a) => a.id === params.activityId) ?? null);
    }
  }, [params.id, params.activityId, day]);

  if (!profile || !activity) {
    return (
      <main className="app-shell">
        <p>Actividad no encontrada.</p>
        <Link href="/">Inicio</Link>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <ActivityPlayer profile={profile} day={day} activity={activity} />
    </main>
  );
}
