"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAvatar, getMascot } from "@/lib/avatars";
import { loadState } from "@/lib/storage";
import type { Profile } from "@/lib/types";

export default function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    setProfiles(loadState().profiles);
  }, []);

  return (
    <main className="app-shell">
      <header className="brand-hero">
        <h1>ForMyKids</h1>
        <p>Elige tu avatar y empieza la tarea del día. Inglés y matemáticas en casa.</p>
      </header>

      <div className="home-grid">
        <section className="panel">
          <h2>¿Quién eres?</h2>
          {profiles.length === 0 ? (
            <p className="muted">Aún no hay perfiles. Crea el primero para empezar.</p>
          ) : (
            <div className="profile-grid">
              {profiles.map((p) => {
                const avatar = getAvatar(p.avatarId);
                const mascot = getMascot(p.mascotId);
                return (
                  <Link key={p.id} href={`/kid/${p.id}`} className="profile-card">
                    <span className="profile-emoji" style={{ filter: `drop-shadow(0 8px 0 ${avatar.accent}33)` }}>
                      {avatar.emoji}
                    </span>
                    <strong>{avatar.label}</strong>
                    <div className="muted" style={{ marginTop: 6 }}>
                      {p.ageGroup === "kid5" ? "5 años" : "10 años"} · {mascot.emoji}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="home-actions">
            {profiles.length < 2 && (
              <Link href="/setup" className="btn primary">
                Crear perfil
              </Link>
            )}
            <Link href="/adult" className="btn secondary">
              Zona de adultos
            </Link>
          </div>
        </section>

        <aside className="panel">
          <h2>Hoy en ForMyKids</h2>
          <ul style={{ paddingLeft: "1.1rem", margin: 0, lineHeight: 1.7 }}>
            <li>Tareas diarias por 30 días</li>
            <li>Ejemplo → práctica → prueba</li>
            <li>Necesitas 80% o más para avanzar</li>
            <li>Recordatorios a las 10:00, 13:00 y 16:00</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
