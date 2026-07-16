"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AVATARS, MASCOTS } from "@/lib/avatars";
import { refreshState, upsertProfile } from "@/lib/storage";
import type { AgeGroup, Profile } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();
  const [existing, setExisting] = useState<Profile[]>([]);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [mascotId, setMascotId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshState()
      .then((s) => setExisting(s.profiles))
      .catch(() => setError("No se pudo conectar con el servidor."));
  }, []);

  async function save() {
    if (!ageGroup || !avatarId || !mascotId) {
      setError("Elige edad, avatar y mascota.");
      return;
    }
    if (existing.length >= 2) {
      setError("Ya hay 2 perfiles.");
      return;
    }
    if (existing.some((p) => p.ageGroup === ageGroup)) {
      setError("Ya existe un perfil para esa edad. Elige la otra.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = `p-${ageGroup}-${Date.now()}`;
      await upsertProfile({
        id,
        ageGroup,
        avatarId,
        mascotId,
        createdAt: new Date().toISOString(),
      });
      router.push(`/kid/${id}`);
    } catch {
      setError("No se pudo guardar el perfil en el servidor.");
      setSaving(false);
    }
  }

  const packs = ["heroes", "magic", "animals", "anime"] as const;
  const packNames = {
    heroes: "Héroes",
    magic: "Magia",
    animals: "Animales",
    anime: "Aventura",
  };

  return (
    <main className="app-shell">
      <Link href="/" className="linkish">
        ← Inicio
      </Link>
      <header className="brand-hero" style={{ textAlign: "left", paddingLeft: 0 }}>
        <h1>Crear perfil</h1>
        <p>Elige tu edad, un avatar y una mascota. Se guarda en la PC para todas las tablets.</p>
      </header>

      <section className="panel setup-section">
        <h3>1. ¿Cuántos años tienes?</h3>
        <div className="profile-grid">
          <button
            type="button"
            className={`setup-option ${ageGroup === "kid5" ? "selected" : ""}`}
            onClick={() => setAgeGroup("kid5")}
          >
            <span className="profile-emoji">5️⃣</span>
            <strong>5 años</strong>
            <div className="muted">Bloque mixto diario</div>
          </button>
          <button
            type="button"
            className={`setup-option ${ageGroup === "kid10" ? "selected" : ""}`}
            onClick={() => setAgeGroup("kid10")}
          >
            <span className="profile-emoji">🔟</span>
            <strong>10 años</strong>
            <div className="muted">Mate + inglés</div>
          </button>
        </div>
      </section>

      <section className="panel setup-section">
        <h3>2. Elige tu avatar</h3>
        {packs.map((pack) => (
          <div key={pack}>
            <div className="pack-label">{packNames[pack]}</div>
            <div className="profile-grid">
              {AVATARS.filter((a) => a.pack === pack).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`setup-option ${avatarId === a.id ? "selected" : ""}`}
                  onClick={() => setAvatarId(a.id)}
                >
                  <span className="profile-emoji">{a.emoji}</span>
                  <strong>{a.label}</strong>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="panel setup-section">
        <h3>3. Elige tu mascota</h3>
        <div className="profile-grid">
          {MASCOTS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`setup-option ${mascotId === m.id ? "selected" : ""}`}
              onClick={() => setMascotId(m.id)}
            >
              <span className="profile-emoji">{m.emoji}</span>
              <strong>{m.label}</strong>
            </button>
          ))}
        </div>
      </section>

      {error && <p style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</p>}

      <button type="button" className="btn primary" onClick={save} disabled={saving}>
        {saving ? "Guardando…" : "Guardar y entrar"}
      </button>
    </main>
  );
}
