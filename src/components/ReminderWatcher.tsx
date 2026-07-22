"use client";

import { useEffect, useRef, useState } from "react";
import { playReminder } from "@/lib/audio";
import { getAvatar } from "@/lib/avatars";
import { getCurrentDay, getDayProgress, refreshState } from "@/lib/storage";
import { REMINDER_HOURS } from "@/lib/types";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function ReminderWatcher() {
  const [alert, setAlert] = useState<string | null>(null);
  const lastFired = useRef<string>("");

  useEffect(() => {
    const check = async () => {
      const now = new Date();
      const hour = now.getHours();
      if (!REMINDER_HOURS.includes(hour as (typeof REMINDER_HOURS)[number])) return;
      if (now.getMinutes() > 5) return;

      try {
        const state = await refreshState();
        if (state.profiles.length === 0) return;

        const pending = state.profiles.filter((p) => {
          const day = getCurrentDay(p.id);
          const progress = getDayProgress(p.id, day);
          return !progress?.completed;
        });

        if (pending.length === 0) return;

        const fireKey = `${todayKey()}-${hour}`;
        if (lastFired.current === fireKey) return;
        const stored = sessionStorage.getItem("formykids-reminder");
        if (stored === fireKey) return;
        lastFired.current = fireKey;
        sessionStorage.setItem("formykids-reminder", fireKey);

        const names = pending.map((p) => getAvatar(p.avatarId).label).join(" y ");
        const msg = `Recordatorio: ${names} aún no completó la tarea del día. ¡Vamos!`;
        setAlert(msg);
        playReminder();

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("ForMyKids", { body: msg });
        } else if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      } catch {
        // server offline — skip reminder silently
      }
    };

    void check();
    const id = setInterval(() => void check(), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!alert) return null;

  return (
    <div className="reminder-banner" role="alert">
      <div>
        <strong>⏰ Recordatorio</strong>
        <p>{alert}</p>
      </div>
      <button type="button" onClick={() => setAlert(null)}>
        Cerrar
      </button>
    </div>
  );
}
