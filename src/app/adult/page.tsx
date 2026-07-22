"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAvatar } from "@/lib/avatars";
import { getDayPlan } from "@/lib/content";
import {
  clearAdultSession,
  isAdultUnlocked,
  refreshState,
  saveDayProgress,
  setAdultSession,
} from "@/lib/storage";
import {
  ADULT_PIN,
  PASS_THRESHOLD,
  TOTAL_DAYS,
  type Profile,
} from "@/lib/types";

type ScoreRow = {
  activityId: string;
  title: string;
  score?: number;
  passed: boolean;
};

type DayRow = {
  day: number;
  completed: boolean;
  scores: ScoreRow[];
};

export default function AdultPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);

  function buildRows(profile: Profile, state: Awaited<ReturnType<typeof refreshState>>): DayRow[] {
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const day = i + 1;
      const plan = getDayPlan(profile.ageGroup, day);
      const progress = state.dayProgress.find(
        (d) => d.profileId === profile.id && d.day === day,
      );
      const scores: ScoreRow[] = plan.activities.map((act) => {
        const attempt = state.attempts
          .filter(
            (a) =>
              a.profileId === profile.id &&
              a.day === day &&
              a.activityId === act.id,
          )
          .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
        return {
          activityId: act.id,
          title: act.titleEs,
          score: attempt?.score,
          passed: Boolean(attempt?.passed),
        };
      });
      return {
        day,
        completed: Boolean(progress?.completed),
        scores,
      };
    });
  }

  async function refresh(nextSelectedId?: string) {
    const state = await refreshState();
    setProfiles(state.profiles);
    const id = nextSelectedId || selectedId || state.profiles[0]?.id || "";
    if (id) setSelectedId(id);
    const profile = state.profiles.find((p) => p.id === id);
    setRows(profile ? buildRows(profile, state) : []);
  }

  useEffect(() => {
    setUnlocked(isAdultUnlocked());
    refresh()
      .catch(() => setError("No se pudo conectar con el servidor."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId || loading) return;
    refreshState().then((state) => {
      const profile = state.profiles.find((p) => p.id === selectedId);
      if (profile) setRows(buildRows(profile, state));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selected = profiles.find((p) => p.id === selectedId) ?? null;

  function tryUnlock() {
    if (pin === ADULT_PIN) {
      setAdultSession(90);
      setUnlocked(true);
      setError("");
      setPin("");
    } else {
      setError("PIN incorrecto");
    }
  }

  async function markDayComplete(day: number, complete: boolean) {
    if (!selected) return;
    const plan = getDayPlan(selected.ageGroup, day);
    const scores: Record<string, number> = {};
    for (const act of plan.activities) {
      scores[act.id] = complete ? Math.max(PASS_THRESHOLD, 100) : 0;
    }
    try {
      await saveDayProgress({
        profileId: selected.id,
        day,
        completed: complete,
        scores,
        updatedAt: new Date().toISOString(),
      });
      setMessage(
        complete
          ? `Día ${day} marcado como completado (sincronizado).`
          : `Día ${day} marcado como pendiente (sincronizado).`,
      );
      await refresh(selected.id);
    } catch {
      setMessage("Error al guardar en el servidor.");
    }
  }

  if (!unlocked) {
    return (
      <main className="app-shell">
        <Link href="/" className="linkish">
          ← Inicio
        </Link>
        <header className="brand-hero">
          <h1>Zona de adultos</h1>
          <p>Ingresa el PIN para ver progreso y calificaciones.</p>
        </header>
        <section className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
          <label htmlFor="pin">PIN</label>
          <input
            id="pin"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "0.85rem 1rem",
              borderRadius: 12,
              border: "2px solid #cbd5e1",
              fontSize: "1.4rem",
              letterSpacing: "0.35em",
              textAlign: "center",
            }}
          />
          {error && <p style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</p>}
          <button
            type="button"
            className="btn primary"
            style={{ marginTop: 12, width: "100%" }}
            onClick={tryUnlock}
          >
            Entrar
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="dash-top">
        <Link href="/" className="linkish">
          ← Inicio
        </Link>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            clearAdultSession();
            setUnlocked(false);
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <header className="brand-hero" style={{ textAlign: "left", paddingLeft: 0 }}>
        <h1>Progreso familiar</h1>
        <p>Datos en la PC: visibles igual en tablets y computadora.</p>
      </header>

      <section className="panel">
        <h2>Perfiles</h2>
        {loading && <p className="muted">Sincronizando…</p>}
        <div className="home-actions">
          {profiles.map((p) => {
            const a = getAvatar(p.avatarId);
            return (
              <button
                key={p.id}
                type="button"
                className={`btn ${selectedId === p.id ? "primary" : "secondary"}`}
                onClick={() => setSelectedId(p.id)}
              >
                {a.emoji} {a.label}
              </button>
            );
          })}
          {!loading && profiles.length === 0 && (
            <p className="muted">No hay perfiles todavía.</p>
          )}
        </div>
        {message && <p style={{ color: "#065f46", fontWeight: 700 }}>{message}</p>}
      </section>

      {selected && (
        <section className="panel" style={{ marginTop: "1rem", overflowX: "auto" }}>
          <h2>
            {getAvatar(selected.avatarId).emoji} Historial ·{" "}
            {selected.ageGroup === "kid5" ? "5 años" : "10 años"}
          </h2>
          <table className="adult-table">
            <thead>
              <tr>
                <th>Día</th>
                <th>Estado</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>{row.completed ? "✅ Completo" : "⏳ Pendiente"}</td>
                  <td>
                    {row.scores.map((s) => (
                      <div key={s.activityId}>
                        {s.title}: {typeof s.score === "number" ? `${s.score}%` : "—"}
                        {s.passed ? " ✓" : ""}
                      </div>
                    ))}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn secondary"
                        onClick={() => markDayComplete(row.day, true)}
                      >
                        Marcar OK
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => markDayComplete(row.day, false)}
                      >
                        Pendiente
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
