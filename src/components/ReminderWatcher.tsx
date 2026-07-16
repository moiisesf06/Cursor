"use client";

import { useEffect, useRef, useState } from "react";
import { playReminder } from "@/lib/audio";
import { getCurrentDay, getDayProgress, loadState } from "@/lib/storage";
import { REMINDER_HOURS } from "@/lib/types";
import { getAvatar } from "@/lib/avatars";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function ReminderWatcher() {
  const [alert, setAlert] = useState<string | null>(null);
  const lastFired = useRef<string>("");

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hour = now.getHours();
      if (!REMINDER_HOURS.includes(hour as (typeof REMINDER_HOURS)[number])) return;
      // only fire in the first 5 minutes of the hour window, once per hour/day
      if (now.getMinutes() > 5) return;

      const state = loadState();
      if (state.profiles.length === 0) return;

      const pending = state.profiles.filter((p) => {
        const day = getCurrentDay(p.id);
        const progress = getDayProgress(p.id, day);
        return !progress?.completed;
      });

      if (pending.length === 0) return;

      const fireKey = `${todayKey()}-${hour}`;
      if (lastFired.current === fireKey) return;
      // also persist across reloads
      const stored = sessionStorage.getItem("formykids-reminder");
      if (stored === fireKey) return;
      lastFired.current = fireKey;
      sessionStorage.setItem("formykids-reminder", fireKey);

      const names = pending
        .map((p) => getAvatar(p.avatarId).label)
        .join(" y ");
      const msg = `Recordatorio: ${names} aún no completó la tarea del día. ¡Vamos!`;
      setAlert(msg);
      playReminder();

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("ForMyKids", { body: msg });
      } else if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    };

    check();
    const id = setInterval(check, 30_000);
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
