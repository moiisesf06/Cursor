"use client";

import Link from "next/link";
import type { DayProgress } from "@/lib/types";
import { TOTAL_DAYS } from "@/lib/types";

export function Calendar30({
  profileId,
  currentDay,
  progress,
}: {
  profileId: string;
  currentDay: number;
  progress: DayProgress[];
}) {
  const completed = new Set(
    progress.filter((p) => p.completed).map((p) => p.day),
  );

  return (
    <div className="calendar30">
      <h3>Calendario de 30 días</h3>
      <div className="calendar-grid">
        {Array.from({ length: TOTAL_DAYS }, (_, i) => {
          const day = i + 1;
          const done = completed.has(day);
          const isCurrent = day === currentDay;
          const unlocked = day <= currentDay || done;
          return (
            <Link
              key={day}
              href={unlocked ? `/kid/${profileId}/day/${day}` : "#"}
              className={`cal-day ${done ? "done" : ""} ${isCurrent ? "current" : ""} ${
                !unlocked ? "locked" : ""
              }`}
              aria-disabled={!unlocked}
              onClick={(e) => {
                if (!unlocked) e.preventDefault();
              }}
            >
              {day}
              {done ? " ✓" : ""}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
