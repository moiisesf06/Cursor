import type { ActivityContent, AgeGroup, DayPlan, Question } from "./types";

const COLORS = [
  { es: "rojo", en: "red", emoji: "🔴" },
  { es: "azul", en: "blue", emoji: "🔵" },
  { es: "verde", en: "green", emoji: "🟢" },
  { es: "amarillo", en: "yellow", emoji: "🟡" },
  { es: "naranja", en: "orange", emoji: "🟠" },
  { es: "morado", en: "purple", emoji: "🟣" },
];

const ANIMALS = [
  { es: "gato", en: "cat", emoji: "🐱" },
  { es: "perro", en: "dog", emoji: "🐶" },
  { es: "pájaro", en: "bird", emoji: "🐦" },
  { es: "pez", en: "fish", emoji: "🐟" },
  { es: "león", en: "lion", emoji: "🦁" },
  { es: "oso", en: "bear", emoji: "🐻" },
];

const NUMBER_WORDS_ES = [
  "",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
];
const NUMBER_WORDS_EN = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

const VERBS = [
  { base: "play", es: "jugar", past: "played", ing: "playing" },
  { base: "eat", es: "comer", past: "ate", ing: "eating" },
  { base: "go", es: "ir", past: "went", ing: "going" },
  { base: "read", es: "leer", past: "read", ing: "reading" },
  { base: "write", es: "escribir", past: "wrote", ing: "writing" },
  { base: "run", es: "correr", past: "ran", ing: "running" },
  { base: "study", es: "estudiar", past: "studied", ing: "studying" },
  { base: "help", es: "ayudar", past: "helped", ing: "helping" },
];

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function qid(prefix: string, day: number, n: number) {
  return `${prefix}-d${day}-q${n}`;
}

function makeTapNumber(day: number, n: number, target: number): Question {
  const soup = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], day * 17 + n);
  return {
    id: qid("tap", day, n),
    kind: "tap-number",
    promptEs: `Toca el número ${target}`,
    promptEn: `Touch the number ${target}`,
    hintEs: `Busca el ${NUMBER_WORDS_ES[target]}`,
    speakEs: `Toca el número ${NUMBER_WORDS_ES[target]}`,
    speakEn: `Touch the number ${NUMBER_WORDS_EN[target]}`,
    soupNumbers: soup,
    targetNumber: target,
    correctChoiceId: String(target),
  };
}

function makeColorQ(day: number, n: number): Question {
  const idx = (day + n) % COLORS.length;
  const correct = COLORS[idx];
  const choices = shuffle(COLORS, day + n * 3).slice(0, 4);
  if (!choices.find((c) => c.en === correct.en)) {
    choices[0] = correct;
  }
  return {
    id: qid("color", day, n),
    kind: "multiple-choice",
    promptEs: `¿Cuál es "${correct.en}"?`,
    promptEn: `Which one is ${correct.en}?`,
    hintEs: `${correct.en} significa ${correct.es}`,
    speakEs: `Cuál es ${correct.en}`,
    choices: choices.map((c) => ({
      id: c.en,
      label: c.en,
      imageEmoji: c.emoji,
    })),
    correctChoiceId: correct.en,
  };
}

function makeAnimalQ(day: number, n: number): Question {
  const idx = (day + n * 2) % ANIMALS.length;
  const correct = ANIMALS[idx];
  const choices = shuffle(ANIMALS, day * 5 + n).slice(0, 4);
  if (!choices.find((c) => c.en === correct.en)) choices[1] = correct;
  return {
    id: qid("animal", day, n),
    kind: "multiple-choice",
    promptEs: `¿Cómo se dice ${correct.es} en inglés?`,
    promptEn: `How do you say ${correct.es} in English?`,
    hintEs: `Empieza con la letra ${correct.en[0].toUpperCase()}`,
    speakEs: `Cómo se dice ${correct.es} en inglés`,
    choices: choices.map((c) => ({
      id: c.en,
      label: c.en,
      imageEmoji: c.emoji,
    })),
    correctChoiceId: correct.en,
  };
}

function makeEasyMath(day: number, n: number): Question {
  const a = ((day + n) % 5) + 1;
  const b = ((day + n * 2) % 4) + 1;
  const isAdd = (day + n) % 2 === 0;
  const result = isAdd ? a + b : Math.max(a, b) - Math.min(a, b);
  const left = isAdd ? a : Math.max(a, b);
  const right = isAdd ? b : Math.min(a, b);
  const op = isAdd ? "+" : "−";
  const options = shuffle(
    Array.from(new Set([result, result + 1, Math.max(0, result - 1), result + 2])).slice(0, 4),
    day + n,
  );
  return {
    id: qid("emath", day, n),
    kind: "multiple-choice",
    promptEs: `¿Cuánto es ${left} ${op} ${right}?`,
    hintEs: isAdd ? "Junta las cantidades" : "Quita la cantidad más chica",
    speakEs: `Cuánto es ${left} ${isAdd ? "más" : "menos"} ${right}`,
    choices: options.map((v) => ({ id: String(v), label: String(v) })),
    correctChoiceId: String(result),
  };
}

function buildKid5Day(day: number): DayPlan {
  const target = ((day - 1) % 10) + 1;
  const practice: Question[] = [
    makeTapNumber(day, 1, target),
    makeColorQ(day, 2),
    makeAnimalQ(day, 3),
    makeEasyMath(day, 4),
  ];
  const testPool: Question[] = [];
  for (let i = 0; i < 12; i++) {
    const t = ((day + i) % 10) + 1;
    if (i % 4 === 0) testPool.push(makeTapNumber(day, 100 + i, t));
    else if (i % 4 === 1) testPool.push(makeColorQ(day, 100 + i));
    else if (i % 4 === 2) testPool.push(makeAnimalQ(day, 100 + i));
    else testPool.push(makeEasyMath(day, 100 + i));
  }
  const activity: ActivityContent = {
    id: `kid5-day-${day}-mixed`,
    subject: "mixed",
    titleEs: `Día ${day}: Números, colores y animales`,
    introEs:
      "Hoy practicarás números del 1 al 10, colores y animales en inglés, y sumas o restas fáciles.",
    exampleEs: `Ejemplo: el número ${target} se dice "${NUMBER_WORDS_ES[target]}" en español y "${NUMBER_WORDS_EN[target]}" en inglés.`,
    exampleEn: `Example: ${target} is "${NUMBER_WORDS_EN[target]}" in English.`,
    practice,
    testPool,
    testSize: 5,
  };
  return { day, activities: [activity] };
}

function makeGrade4Math(day: number, n: number): Question {
  const mode = (day + n) % 5;
  if (mode === 0) {
    const a = 12 + ((day * 3 + n) % 40);
    const b = 8 + ((day + n * 2) % 30);
    const result = a + b;
    const options = shuffle([result, result + 10, result - 5, result + 2], day + n);
    return {
      id: qid("g4add", day, n),
      kind: "multiple-choice",
      promptEs: `Resuelve: ${a} + ${b} = ?`,
      hintEs: "Suma las unidades y luego las decenas",
      speakEs: `Cuánto es ${a} más ${b}`,
      choices: options.map((v) => ({ id: String(v), label: String(v) })),
      correctChoiceId: String(result),
    };
  }
  if (mode === 1) {
    const a = 40 + ((day * 2 + n) % 50);
    const b = 10 + ((day + n) % 25);
    const result = a - b;
    const options = shuffle([result, result + 5, result - 3, result + 10], day * 2 + n);
    return {
      id: qid("g4sub", day, n),
      kind: "multiple-choice",
      promptEs: `Resuelve: ${a} − ${b} = ?`,
      hintEs: "Resta con cuidado las unidades",
      speakEs: `Cuánto es ${a} menos ${b}`,
      choices: options.map((v) => ({ id: String(v), label: String(v) })),
      correctChoiceId: String(result),
    };
  }
  if (mode === 2) {
    const a = 3 + ((day + n) % 8);
    const b = 2 + ((day * 3 + n) % 7);
    const result = a * b;
    const options = shuffle([result, result + a, result - b, result + 2], day + n * 7);
    return {
      id: qid("g4mul", day, n),
      kind: "multiple-choice",
      promptEs: `Resuelve: ${a} × ${b} = ?`,
      hintEs: `Piensa en sumar ${a} veces ${b}`,
      speakEs: `Cuánto es ${a} por ${b}`,
      choices: options.map((v) => ({ id: String(v), label: String(v) })),
      correctChoiceId: String(result),
    };
  }
  if (mode === 3) {
    const b = 2 + ((day + n) % 5);
    const result = 2 + ((day * 2 + n) % 8);
    const a = b * result;
    const options = shuffle([result, result + 1, result - 1, result + 2], day * 3 + n);
    return {
      id: qid("g4div", day, n),
      kind: "multiple-choice",
      promptEs: `Resuelve: ${a} ÷ ${b} = ?`,
      hintEs: `¿Cuántas veces cabe ${b} en ${a}?`,
      speakEs: `Cuánto es ${a} entre ${b}`,
      choices: options.map((v) => ({ id: String(v), label: String(v) })),
      correctChoiceId: String(result),
    };
  }
  // fractions: which is larger / equivalent simple
  const num = 1 + ((day + n) % 3);
  const den = 4;
  const options = [
    { id: "a", label: `${num}/${den}` },
    { id: "b", label: `${num + 1}/${den}` },
    { id: "c", label: `${num}/${den + 2}` },
    { id: "d", label: `${num + 2}/${den}` },
  ];
  return {
    id: qid("g4frac", day, n),
    kind: "multiple-choice",
    promptEs: `¿Cuál fracción es equivalente a ${num * 2}/${den * 2}?`,
    hintEs: "Simplifica dividiendo numerador y denominador por 2",
    speakEs: `Cuál fracción es equivalente a ${num * 2} sobre ${den * 2}`,
    choices: options,
    correctChoiceId: "a",
  };
}

function makeEnglishQ(day: number, n: number): Question {
  const verb = VERBS[(day + n) % VERBS.length];
  const mode = (day + n) % 4;
  if (mode === 0) {
    const choices = shuffle(VERBS, day + n).slice(0, 4);
    if (!choices.find((v) => v.base === verb.base)) choices[0] = verb;
    return {
      id: qid("enbase", day, n),
      kind: "multiple-choice",
      promptEs: `What is the English verb for "${verb.es}"?`,
      hintEs: `En español significa ${verb.es}`,
      speakEs: `Cuál es el verbo en inglés para ${verb.es}`,
      choices: choices.map((v) => ({ id: v.base, label: v.base })),
      correctChoiceId: verb.base,
    };
  }
  if (mode === 1) {
    return {
      id: qid("enpast", day, n),
      kind: "multiple-choice",
      promptEs: `Past tense of "${verb.base}"?`,
      hintEs: `Pasado de ${verb.es}`,
      speakEs: `Cuál es el pasado de ${verb.base}`,
      choices: shuffle(
        [
          { id: verb.past, label: verb.past },
          { id: verb.base + "ed", label: verb.base + "ed" },
          { id: verb.ing, label: verb.ing },
          { id: verb.base + "s", label: verb.base + "s" },
        ],
        day * 4 + n,
      ),
      correctChoiceId: verb.past,
    };
  }
  if (mode === 2) {
    return {
      id: qid("ening", day, n),
      kind: "multiple-choice",
      promptEs: `Choose the correct sentence:`,
      hintEs: `Usa -ing para acciones en progreso`,
      speakEs: "Elige la oración correcta",
      choices: [
        { id: "ok", label: `She is ${verb.ing}.` },
        { id: "bad1", label: `She ${verb.base}ing.` },
        { id: "bad2", label: `She are ${verb.ing}.` },
        { id: "bad3", label: `She is ${verb.past}.` },
      ],
      correctChoiceId: "ok",
    };
  }
  const choices = shuffle(VERBS, day * 9 + n).slice(0, 4);
  if (!choices.find((v) => v.es === verb.es)) choices[0] = verb;
  return {
    id: qid("envocab", day, n),
    kind: "multiple-choice",
    promptEs: `Translate to Spanish: "${verb.base}"`,
    hintEs: "Piensa en la acción principal del verbo",
    speakEs: `Traduce ${verb.base} al español`,
    choices: choices.map((v) => ({ id: v.es, label: v.es })),
    correctChoiceId: verb.es,
  };
}

function buildKid10Day(day: number): DayPlan {
  const mathPractice = Array.from({ length: 4 }, (_, i) => makeGrade4Math(day, i + 1));
  const mathPool = Array.from({ length: 12 }, (_, i) => makeGrade4Math(day, 50 + i));
  const engPractice = Array.from({ length: 4 }, (_, i) => makeEnglishQ(day, i + 1));
  const engPool = Array.from({ length: 12 }, (_, i) => makeEnglishQ(day, 50 + i));

  return {
    day,
    activities: [
      {
        id: `kid10-day-${day}-math`,
        subject: "math",
        titleEs: `Día ${day}: Matemáticas 4.º`,
        introEs:
          "Practica sumas, restas, multiplicaciones, divisiones y fracciones sencillas de cuarto grado.",
        exampleEs: "Ejemplo: 12 × 4 = 48. Puedes pensar 12 + 12 + 12 + 12.",
        practice: mathPractice,
        testPool: mathPool,
        testSize: 5,
      },
      {
        id: `kid10-day-${day}-english`,
        subject: "english",
        titleEs: `Día ${day}: English — verbs & tenses`,
        introEs:
          "Practica verbos en inglés, pasado y presente continuo. Las preguntas están en inglés; usa las ayudas en español.",
        exampleEs: 'Example: play → played (pasado). "She is playing." (presente continuo).',
        exampleEn: "Example: play → played. She is playing.",
        practice: engPractice,
        testPool: engPool,
        testSize: 5,
      },
    ],
  };
}

const kid5Plans: DayPlan[] = Array.from({ length: 30 }, (_, i) => buildKid5Day(i + 1));
const kid10Plans: DayPlan[] = Array.from({ length: 30 }, (_, i) => buildKid10Day(i + 1));

export function getDayPlan(ageGroup: AgeGroup, day: number): DayPlan {
  const plans = ageGroup === "kid5" ? kid5Plans : kid10Plans;
  return plans[Math.min(Math.max(day, 1), 30) - 1];
}

export function pickTestQuestions(
  activity: ActivityContent,
  attemptNumber: number,
): Question[] {
  const seed = attemptNumber * 97 + activity.testPool.length;
  return shuffle(activity.testPool, seed).slice(0, activity.testSize);
}

export function scoreAnswers(
  questions: Question[],
  answers: Record<string, string>,
): number {
  if (questions.length === 0) return 0;
  let correct = 0;
  for (const q of questions) {
    const ans = answers[q.id];
    if (!ans) continue;
    if (q.kind === "tap-number") {
      if (ans === String(q.targetNumber)) correct += 1;
    } else if (q.correctChoiceId && ans === q.correctChoiceId) {
      correct += 1;
    } else if (q.correctText && ans.trim().toLowerCase() === q.correctText.toLowerCase()) {
      correct += 1;
    }
  }
  return Math.round((correct / questions.length) * 100);
}
