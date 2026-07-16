import type { Avatar, Mascot } from "./types";

/** Original character packs — not affiliated with any franchise. */
export const AVATARS: Avatar[] = [
  { id: "hero-spark", label: "Héroe Chispa", emoji: "🦸", pack: "heroes", accent: "#E85D04" },
  { id: "hero-shield", label: "Guardiana", emoji: "🛡️", pack: "heroes", accent: "#0077B6" },
  { id: "hero-bolt", label: "Rayo", emoji: "⚡", pack: "heroes", accent: "#F4A261" },
  { id: "hero-cape", label: "Capa Roja", emoji: "🦸‍♀️", pack: "heroes", accent: "#D62828" },
  { id: "magic-star", label: "Estrella", emoji: "🌟", pack: "magic", accent: "#2A9D8F" },
  { id: "magic-crown", label: "Corona", emoji: "👑", pack: "magic", accent: "#E9C46A" },
  { id: "magic-wand", label: "Varita", emoji: "🪄", pack: "magic", accent: "#264653" },
  { id: "magic-moon", label: "Luna", emoji: "🌙", pack: "magic", accent: "#4CC9F0" },
  { id: "animal-fox", label: "Zorro", emoji: "🦊", pack: "animals", accent: "#F77F00" },
  { id: "animal-panda", label: "Panda", emoji: "🐼", pack: "animals", accent: "#2B2D42" },
  { id: "animal-owl", label: "Búho", emoji: "🦉", pack: "animals", accent: "#6D6875" },
  { id: "animal-dino", label: "Dino", emoji: "🦕", pack: "animals", accent: "#52B788" },
  { id: "anime-pilot", label: "Piloto", emoji: "🧑‍✈️", pack: "anime", accent: "#118AB2" },
  { id: "anime-ninja", label: "Ninja", emoji: "🥷", pack: "anime", accent: "#333533" },
  { id: "anime-robot", label: "Robot", emoji: "🤖", pack: "anime", accent: "#7209B7" },
  { id: "anime-knight", label: "Caballero", emoji: "⚔️", pack: "anime", accent: "#3A5A40" },
];

export const MASCOTS: Mascot[] = [
  { id: "buddy-bear", label: "Oso Buddy", emoji: "🧸", cheer: "¡Tú puedes!" },
  { id: "buddy-cat", label: "Gato Luna", emoji: "🐱", cheer: "¡Muy bien!" },
  { id: "buddy-dragon", label: "Dragón Mini", emoji: "🐲", cheer: "¡Fuego de éxito!" },
  { id: "buddy-star", label: "Estrellita", emoji: "✨", cheer: "¡Brillas hoy!" },
  { id: "buddy-frog", label: "Rana Salto", emoji: "🐸", cheer: "¡Salta al siguiente!" },
  { id: "buddy-rocket", label: "Cohete", emoji: "🚀", cheer: "¡A volar!" },
];

export function getAvatar(id: string) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}

export function getMascot(id: string) {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
