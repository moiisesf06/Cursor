export type AgeGroup = "kid5" | "kid10";

export type Subject = "mixed" | "math" | "english";

export type QuestionKind =
  | "tap-number"
  | "multiple-choice"
  | "true-false"
  | "fill-blank";

export interface Choice {
  id: string;
  label: string;
  imageEmoji?: string;
}

export interface Question {
  id: string;
  kind: QuestionKind;
  promptEs: string;
  promptEn?: string;
  hintEs?: string;
  speakEs?: string;
  speakEn?: string;
  choices?: Choice[];
  correctChoiceId?: string;
  correctText?: string;
  /** For tap-number soup */
  soupNumbers?: number[];
  targetNumber?: number;
}

export interface ActivityContent {
  id: string;
  subject: Subject;
  titleEs: string;
  introEs: string;
  exampleEs: string;
  exampleEn?: string;
  practice: Question[];
  /** Pool used to build scored tests; reshuffled on retry */
  testPool: Question[];
  testSize: number;
}

export interface DayPlan {
  day: number;
  activities: ActivityContent[];
}

export interface Avatar {
  id: string;
  label: string;
  emoji: string;
  pack: "heroes" | "magic" | "animals" | "anime";
  accent: string;
}

export interface Mascot {
  id: string;
  label: string;
  emoji: string;
  cheer: string;
}

export interface Profile {
  id: string;
  ageGroup: AgeGroup;
  avatarId: string;
  mascotId: string;
  createdAt: string;
}

export interface ActivityAttempt {
  profileId: string;
  day: number;
  activityId: string;
  score: number;
  passed: boolean;
  locked: boolean;
  answers: Record<string, string>;
  questionIds: string[];
  completedAt: string;
  attemptNumber: number;
}

export interface DayProgress {
  profileId: string;
  day: number;
  completed: boolean;
  scores: Record<string, number>;
  updatedAt: string;
}

export interface AppState {
  profiles: Profile[];
  attempts: ActivityAttempt[];
  dayProgress: DayProgress[];
  adultUnlockedUntil?: string;
}

export const ADULT_PIN = "0692";
export const PASS_THRESHOLD = 80;
export const TOTAL_DAYS = 30;
export const REMINDER_HOURS = [10, 13, 16] as const;
