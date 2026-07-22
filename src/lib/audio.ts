"use client";

export function speak(text: string, lang: "es-ES" | "en-US" = "es-ES") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

export function speakBilingual(es: string, en?: string) {
  speak(es, "es-ES");
  if (en) {
    setTimeout(() => speak(en, "en-US"), 1600);
  }
}

function beep(freq: number, durationMs: number, type: OscillatorType = "sine", gain = 0.08) {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
  osc.stop(ctx.currentTime + durationMs / 1000);
  osc.onended = () => ctx.close();
}

export function playSuccess() {
  beep(523.25, 120, "triangle", 0.07);
  setTimeout(() => beep(659.25, 140, "triangle", 0.07), 100);
  setTimeout(() => beep(783.99, 180, "triangle", 0.08), 200);
}

export function playError() {
  beep(220, 180, "square", 0.05);
  setTimeout(() => beep(180, 220, "square", 0.05), 140);
}

export function playReminder() {
  beep(440, 160, "sine", 0.09);
  setTimeout(() => beep(554.37, 200, "sine", 0.09), 220);
  setTimeout(() => beep(659.25, 260, "sine", 0.1), 440);
}
