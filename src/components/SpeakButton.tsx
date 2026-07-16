"use client";

import { speak, speakBilingual } from "@/lib/audio";

export function SpeakButton({
  textEs,
  textEn,
  label = "Escuchar",
}: {
  textEs: string;
  textEn?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="speak-btn"
      aria-label={label}
      onClick={() => {
        if (textEn) speakBilingual(textEs, textEn);
        else speak(textEs, "es-ES");
      }}
    >
      <span aria-hidden>🔊</span>
      <span>{label}</span>
    </button>
  );
}
