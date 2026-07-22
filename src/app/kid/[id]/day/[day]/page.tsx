"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SpeakButton } from "@/components/SpeakButton";
import { getAvatar, getMascot } from "@/lib/avatars";
import { getDayPlan } from "@/lib/content";
import { getDayProgress, getLatestAttempt, refreshState } from "@/lib/storage";
import type { Profile } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/types";

export default function DayPage() {
  const params = useParams<{ id: string; day: string }>();
  const day = Number(params.day);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refreshState()
      .then((state) => {
        setProfile(state.profiles.find((p) => p.id === params.id) ?? null);
      })
      .finally(() => setReady(true));
  }, [params.id]);

  if (!ready) {
    return (
      <main className="app-shell">
        <p className="muted">Sincronizando…</p>
      </main>
    );
  }

  if (!profile || Number.isNaN(day)) {
    return (
      <main className="app-shell">
        <p>Día no encontrado.</p>
        <Link href="/">Inicio</Link>
      </main>
    );
  }

  const avatar = getAvatar(profile.avatarId);
  const mascot = getMascot(profile.mascotId);
  const plan = getDayPlan(profile.ageGroup, day);
  const progress = getDayProgress(profile.id, day);

  return (
    <main className={`app-shell theme-${profile.ageGroup}`}>
      <Link href={`/kid/${profile.id}`} className="linkish">
        ← Dashboard
      </Link>
      <header className="brand-hero" style={{ textAlign: "left", paddingLeft: 0 }}>
        <h1>
          {avatar.emoji} Día {day}
        </h1>
        <p>
          {progress?.completed
            ? `¡Día completado! ${mascot.emoji}`
            : `Completa todas las tareas con ${PASS_THRESHOLD}% o más.`}
        </p>
      </header>

      <section className="panel">
        <div className="panel-title-row">
          <h2>Actividades</h2>
          <SpeakButton textEs={`Día ${day}. Elige una actividad para comenzar.`} />
        </div>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {plan.activities.map((act) => {
            const attempt = getLatestAttempt(profile.id, day, act.id);
            return (
              <div
                key={act.id}
                style={{
                  background: "white",
                  borderRadius: "1rem",
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <strong>{act.titleEs}</strong>
                  <div className="muted">
                    {attempt?.passed
                      ? `Aprobado · ${attempt.score}%`
                      : attempt
                        ? `Último intento · ${attempt.score}% (repite)`
                        : "Pendiente"}
                  </div>
                </div>
                <Link
                  href={`/kid/${profile.id}/day/${day}/activity/${act.id}`}
                  className="btn primary"
                >
                  {attempt?.passed ? "Ver" : "Empezar"}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
