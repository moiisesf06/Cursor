"use client";

import type { Question } from "@/lib/types";
import { SpeakButton } from "./SpeakButton";

export function QuestionView({
  question,
  value,
  locked,
  onChange,
  showFeedback,
}: {
  question: Question;
  value?: string;
  locked: boolean;
  onChange: (v: string) => void;
  showFeedback?: boolean;
}) {
  const isCorrect =
    question.kind === "tap-number"
      ? value === String(question.targetNumber)
      : value === question.correctChoiceId;

  return (
    <article className="question-card">
      <div className="question-header">
        <h3>{question.promptEs}</h3>
        <SpeakButton
          textEs={question.speakEs || question.promptEs}
          textEn={question.speakEn || question.promptEn}
        />
      </div>
      {question.promptEn && <p className="prompt-en">{question.promptEn}</p>}
      {question.hintEs && <p className="hint">💡 Ayuda: {question.hintEs}</p>}

      {question.kind === "tap-number" && question.soupNumbers && (
        <div className="number-soup">
          {question.soupNumbers.map((n) => {
            const selected = value === String(n);
            return (
              <button
                key={`${question.id}-${n}`}
                type="button"
                disabled={locked}
                className={`soup-num ${selected ? "selected" : ""} ${
                  locked && showFeedback && selected
                    ? isCorrect
                      ? "correct"
                      : "wrong"
                    : ""
                }`}
                onClick={() => onChange(String(n))}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}

      {question.kind === "multiple-choice" && question.choices && (
        <div className="choices">
          {question.choices.map((c) => {
            const selected = value === c.id;
            return (
              <button
                key={c.id}
                type="button"
                disabled={locked}
                className={`choice ${selected ? "selected" : ""} ${
                  locked && showFeedback && selected
                    ? isCorrect
                      ? "correct"
                      : "wrong"
                    : ""
                }`}
                onClick={() => onChange(c.id)}
              >
                {c.imageEmoji && <span className="choice-emoji">{c.imageEmoji}</span>}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}
