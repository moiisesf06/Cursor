"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActivityContent, Profile, Question } from "@/lib/types";
import { PASS_THRESHOLD } from "@/lib/types";
import { pickTestQuestions, scoreAnswers } from "@/lib/content";
import {
  getDayProgress,
  getLatestAttempt,
  loadState,
  saveAttempt,
  saveDayProgress,
} from "@/lib/storage";
import { getDayPlan } from "@/lib/content";
import { playError, playSuccess } from "@/lib/audio";
import { getMascot } from "@/lib/avatars";
import { QuestionView } from "./QuestionView";
import { SpeakButton } from "./SpeakButton";

type Phase = "intro" | "practice" | "test" | "result";

export function ActivityPlayer({
  profile,
  day,
  activity,
}: {
  profile: Profile;
  day: number;
  activity: ActivityContent;
}) {
  const router = useRouter();
  const mascot = getMascot(profile.mascotId);
  const latest = getLatestAttempt(profile.id, day, activity.id);
  const initialAttemptNumber = latest
    ? latest.passed
      ? latest.attemptNumber
      : latest.attemptNumber + 1
    : 1;

  const [phase, setPhase] = useState<Phase>(
    latest?.passed ? "result" : "intro",
  );
  const [attemptNumber, setAttemptNumber] = useState(initialAttemptNumber);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(Boolean(latest?.passed));
  const [score, setScore] = useState(latest?.score ?? 0);
  const [passed, setPassed] = useState(Boolean(latest?.passed));
  const [testQuestions, setTestQuestions] = useState<Question[]>(() => {
    if (latest?.questionIds?.length) {
      const map = new Map(activity.testPool.map((q) => [q.id, q]));
      const qs = latest.questionIds.map((id) => map.get(id)).filter(Boolean) as Question[];
      if (qs.length) return qs;
    }
    return pickTestQuestions(activity, initialAttemptNumber);
  });

  const allTestAnswered = useMemo(
    () => testQuestions.every((q) => Boolean(testAnswers[q.id])),
    [testQuestions, testAnswers],
  );

  function finishTest() {
    if (!allTestAnswered || locked) return;
    const s = scoreAnswers(testQuestions, testAnswers);
    setLocked(true);
    setScore(s);
    const ok = s >= PASS_THRESHOLD;
    setPassed(ok);
    if (ok) playSuccess();
    else playError();

    saveAttempt({
      profileId: profile.id,
      day,
      activityId: activity.id,
      score: s,
      passed: ok,
      locked: true,
      answers: testAnswers,
      questionIds: testQuestions.map((q) => q.id),
      completedAt: new Date().toISOString(),
      attemptNumber,
    });

    // Update day progress if all activities passed
    const plan = getDayPlan(profile.ageGroup, day);
    const state = loadState();
    const scores: Record<string, number> = {
      ...(getDayProgress(profile.id, day)?.scores ?? {}),
      [activity.id]: s,
    };
    const allPassed = plan.activities.every((act) => {
      if (act.id === activity.id) return ok;
      const att = state.attempts
        .filter(
          (a) =>
            a.profileId === profile.id &&
            a.day === day &&
            a.activityId === act.id &&
            a.passed,
        )
        .sort((a, b) => b.attemptNumber - a.attemptNumber)[0];
      if (att) {
        scores[act.id] = att.score;
        return true;
      }
      return false;
    });

    saveDayProgress({
      profileId: profile.id,
      day,
      completed: allPassed,
      scores,
      updatedAt: new Date().toISOString(),
    });

    setPhase("result");
  }

  function retryWithNewQuestions() {
    const next = attemptNumber + 1;
    setAttemptNumber(next);
    setTestQuestions(pickTestQuestions(activity, next));
    setTestAnswers({});
    setLocked(false);
    setPassed(false);
    setScore(0);
    setPhase("test");
  }

  return (
    <div className={`activity-player theme-${profile.ageGroup}`}>
      <header className="activity-top">
        <button type="button" className="linkish" onClick={() => router.push(`/kid/${profile.id}/day/${day}`)}>
          ← Volver
        </button>
        <div className="mascot-chip">
          <span>{mascot.emoji}</span>
          <span>{mascot.cheer}</span>
        </div>
      </header>

      <h1>{activity.titleEs}</h1>

      {phase === "intro" && (
        <section className="panel">
          <div className="panel-title-row">
            <h2>1. Introducción</h2>
            <SpeakButton textEs={activity.introEs} />
          </div>
          <p>{activity.introEs}</p>
          <div className="example-box">
            <div className="panel-title-row">
              <strong>Ejemplo</strong>
              <SpeakButton textEs={activity.exampleEs} textEn={activity.exampleEn} />
            </div>
            <p>{activity.exampleEs}</p>
            {activity.exampleEn && <p className="prompt-en">{activity.exampleEn}</p>}
          </div>
          <button type="button" className="btn primary" onClick={() => setPhase("practice")}>
            Ir a la práctica
          </button>
        </section>
      )}

      {phase === "practice" && (
        <section className="panel">
          <h2>2. Práctica (sin nota)</h2>
          {activity.practice.map((q) => (
            <QuestionView
              key={q.id}
              question={q}
              value={practiceAnswers[q.id]}
              locked={false}
              onChange={(v) => {
                setPracticeAnswers((prev) => ({ ...prev, [q.id]: v }));
                const correct =
                  q.kind === "tap-number"
                    ? v === String(q.targetNumber)
                    : v === q.correctChoiceId;
                if (correct) playSuccess();
                else playError();
              }}
              showFeedback
            />
          ))}
          <button type="button" className="btn primary" onClick={() => setPhase("test")}>
            Empezar la prueba
          </button>
        </section>
      )}

      {phase === "test" && (
        <section className="panel">
          <h2>3. Prueba (nota 1–100)</h2>
          <p className="muted">
            Cuando pulses <strong>Terminar</strong>, no podrás cambiar las respuestas.
            Necesitas {PASS_THRESHOLD}% o más para aprobar.
          </p>
          {testQuestions.map((q) => (
            <QuestionView
              key={q.id}
              question={q}
              value={testAnswers[q.id]}
              locked={locked}
              onChange={(v) => setTestAnswers((prev) => ({ ...prev, [q.id]: v }))}
              showFeedback={locked}
            />
          ))}
          {!locked && (
            <button
              type="button"
              className="btn primary"
              disabled={!allTestAnswered}
              onClick={finishTest}
            >
              Terminar
            </button>
          )}
        </section>
      )}

      {phase === "result" && (
        <section className="panel result-panel">
          <h2>{passed ? "¡Lo lograste!" : "Casi... inténtalo de nuevo"}</h2>
          <div className={`score-bubble ${passed ? "pass" : "fail"}`}>
            {score}
          </div>
          <p>
            {passed
              ? `${mascot.emoji} ${mascot.cheer} Completaste esta tarea.`
              : `Obtuviste ${score}%. Necesitas al menos ${PASS_THRESHOLD}%. Repetirás la prueba con preguntas nuevas.`}
          </p>
          {passed ? (
            <button
              type="button"
              className="btn primary"
              onClick={() => router.push(`/kid/${profile.id}/day/${day}`)}
            >
              Continuar
            </button>
          ) : (
            <button type="button" className="btn primary" onClick={retryWithNewQuestions}>
              Repetir con nuevas preguntas
            </button>
          )}
        </section>
      )}
    </div>
  );
}
