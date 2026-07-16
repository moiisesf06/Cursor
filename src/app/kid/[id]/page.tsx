"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar30 } from "@/components/Calendar30";
import { SpeakButton } from "@/components/SpeakButton";
import { getAvatar, getMascot } from "@/lib/avatars";
import { getDayPlan } from "@/lib/content";
import { getCurrentDay, loadState } from "@/lib/storage";
import type { DayProgress, Profile } from "@/lib/types";

export default function KidDashboardPage() {
  const params = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    const state = loadState();
    const p = state.profiles.find((x) => x.id === params.id) ?? null;
    setProfile(p);
    if (p) {
      setProgress(state.dayProgress.filter((d) => d.profileId === p.id));
      setCurrentDay(getCurrentDay(p.id));
    }
  }, [params.id]);

  if (!profile) {
    return (
      <main className="app-shell">
        <p>No encontré este perfil.</p>
        <Link href="/" className="btn primary">
          Ir al inicio
        </Link>
      </main>
    );
  }

  const avatar = getAvatar(profile.avatarId);
  const mascot = getMascot(profile.mascotId);
  const plan = getDayPlan(profile.ageGroup, currentDay);
  const theme = profile.ageGroup === "kid5" ? "theme-kid5" : "theme-kid10";

  return (
    <main className={`app-shell ${theme}`}>
      <div className="dash-top">
        <Link href="/" className="linkish">
          ← Cambiar perfil
        </Link>
        <div className="mascot-chip">
          <span>{mascot.emoji}</span>
          <span>{mascot.cheer}</span>
        </div>
      </div>

      <header className="brand-hero" style={{ textAlign: "left", paddingLeft: 0 }}>
        <div style={{ fontSize: "3.5rem" }}>{avatar.emoji}</div>
        <h1>{avatar.label}</h1>
        <p>
          {profile.ageGroup === "kid5"
            ? "Tu aventura diaria: números, colores e inglés juntos."
            : "Hoy tienes matemáticas de 4.º e inglés."}
        </p>
      </header>

      <section className="panel">
        <div className="panel-title-row">
          <h2>Tarea del día {currentDay}</h2>
          <SpeakButton
            textEs={
              profile.ageGroup === "kid5"
                ? `Hoy es el día ${currentDay}. Completa tu bloque mixto.`
                : `Hoy es el día ${currentDay}. Completa matemáticas e inglés.`
            }
          />
        </div>
        <div className="home-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
          {plan.activities.map((act) => {
            const score = progress.find((p) => p.day === currentDay)?.scores[act.id];
            return (
              <Link
                key={act.id}
                href={`/kid/${profile.id}/day/${currentDay}/activity/${act.id}`}
                className="btn primary"
                style={{ textAlign: "center" }}
              >
                {act.titleEs}
                {typeof score === "number" ? ` · ${score}%` : ""}
              </Link>
            );
          })}
          <Link href={`/kid/${profile.id}/day/${currentDay}`} className="btn secondary">
            Ver detalle del día
          </Link>
        </div>
      </section>

      <section className="panel" style={{ marginTop: "1rem" }}>
        <Calendar30
          profileId={profile.id}
          currentDay={currentDay}
          progress={progress}
        />
      </section>
    </main>
  );
}
