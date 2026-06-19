export type AiSource = "demo" | "fallback" | "ai";

export type AiRunMetadata = {
  operation: AiOperation;
  source: AiSource;
  policyVersion: string;
  schemaVersion: string;
  fallbackReason?: string;
};

export type AiEnvelope<T> = {
  data: T;
  source: AiSource;
  metadata: AiRunMetadata;
};

export type AiOperation =
  | "daily-decision"
  | "generate-workout"
  | "replace-exercise"
  | "analyze-meal"
  | "pattern-analysis"
  | "health-navigator";

export type DailyCheckInInput = {
  energy: number;
  mood: number;
  sleep: "Плохо" | "Нормально" | "Хорошо";
  stress: number;
  painLevel: number;
  symptoms: string[];
  workload: "Лёгкая" | "Обычная" | "Высокая";
};

export type DailyDecisionInput = {
  checkIn: DailyCheckInInput;
  availableMinutes: 12 | 25 | 40;
};

export type DailyDecisionOutput = {
  intent: "recovery" | "light_movement" | "strength";
  rationale: string;
  movement: string;
  nutrition: string;
  recovery: string;
  safetyFlags: string[];
};

export type WorkoutExercise = {
  name: string;
  prescription: string;
  rest: string;
  cue: string;
};

export type GenerateWorkoutInput = DailyDecisionInput & {
  goal?: string;
};

export type GenerateWorkoutOutput = {
  title: string;
  durationMinutes: 12 | 25 | 40;
  intensity: "low" | "moderate";
  explanation: string;
  exercises: WorkoutExercise[];
};

export type ReplaceExerciseInput = {
  exercise: WorkoutExercise;
  reason: "pain" | "easier" | "preference";
};

export type ReplaceExerciseOutput = {
  replacement: WorkoutExercise;
  explanation: string;
};

export type AnalyzeMealInput = {
  imageName?: string;
  energy?: number;
  symptoms?: string[];
};

export type AnalyzeMealOutput = {
  foods: string[];
  calories: { min: number; max: number };
  macros: {
    protein: { min: number; max: number };
    carbs: { min: number; max: number };
    fat: { min: number; max: number };
  };
  confidence: number;
  uncertaintyFactors: string[];
  note: string;
};

export type PatternAnalysisInput = {
  windowDays: 7 | 28 | 90;
};

export type PatternAnalysisOutput = {
  patterns: Array<{
    title: string;
    explanation: string;
    confidence: "low" | "medium";
  }>;
};

export type HealthNavigatorInput = {
  painLevel: number;
  symptoms: string[];
  cycleRegularity?: "Регулярный" | "Нерегулярный";
};

export type HealthNavigatorOutput = {
  level: "observe" | "consider" | "urgent";
  title: string;
  explanation: string;
  preparation: string[];
};

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const sleepValues = new Set<DailyCheckInInput["sleep"]>(["Плохо", "Нормально", "Хорошо"]);
const workloadValues = new Set<DailyCheckInInput["workload"]>(["Лёгкая", "Обычная", "Высокая"]);
const availableMinutesValues = new Set<DailyDecisionInput["availableMinutes"]>([12, 25, 40]);
const replacementReasons = new Set<ReplaceExerciseInput["reason"]>(["pain", "easier", "preference"]);
const windowDayValues = new Set<PatternAnalysisInput["windowDays"]>([7, 28, 90]);

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isOneOf<T extends string | number>(value: unknown, values: Set<T>): value is T {
  return values.has(value as T);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseCheckIn(value: unknown): ValidationResult<DailyCheckInInput> {
  if (!isRecord(value)) return { success: false, error: "checkIn must be an object" };
  const { energy, mood, sleep, stress, painLevel, symptoms, workload } = value;
  if (
    !isBoundedNumber(energy, 1, 10) ||
    !isBoundedNumber(mood, 1, 10) ||
    !isBoundedNumber(stress, 1, 10) ||
    !isBoundedNumber(painLevel, 0, 10) ||
    !isOneOf(sleep, sleepValues) ||
    !isOneOf(workload, workloadValues) ||
    !isStringArray(symptoms)
  ) {
    return { success: false, error: "checkIn has invalid fields" };
  }

  return {
    success: true,
    data: {
      energy,
      mood,
      sleep,
      stress,
      painLevel,
      symptoms,
      workload
    }
  };
}

export function parseDailyDecisionInput(value: unknown): ValidationResult<DailyDecisionInput> {
  if (!isRecord(value)) {
    return { success: false, error: "daily decision input must be an object" };
  }
  const availableMinutes = value.availableMinutes;
  if (!isOneOf(availableMinutes, availableMinutesValues)) {
    return { success: false, error: "availableMinutes must be 12, 25, or 40" };
  }
  const checkIn = parseCheckIn(value.checkIn);
  return checkIn.success
    ? { success: true, data: { checkIn: checkIn.data, availableMinutes } }
    : checkIn;
}

export function parseGenerateWorkoutInput(value: unknown): ValidationResult<GenerateWorkoutInput> {
  const decision = parseDailyDecisionInput(value);
  if (!decision.success) return decision;
  if (!isRecord(value) || (value.goal !== undefined && typeof value.goal !== "string")) {
    return { success: false, error: "goal must be a string when provided" };
  }
  return { success: true, data: { ...decision.data, goal: value.goal } };
}

export function parseReplaceExerciseInput(value: unknown): ValidationResult<ReplaceExerciseInput> {
  if (!isRecord(value) || !isRecord(value.exercise) || !isOneOf(value.reason, replacementReasons)) {
    return { success: false, error: "replace exercise input is invalid" };
  }
  const exercise = value.exercise;
  if (![exercise.name, exercise.prescription, exercise.rest, exercise.cue].every((item) => typeof item === "string")) {
    return { success: false, error: "exercise fields must be strings" };
  }
  return {
    success: true,
    data: {
      exercise: exercise as unknown as WorkoutExercise,
      reason: value.reason as ReplaceExerciseInput["reason"]
    }
  };
}

export function parseAnalyzeMealInput(value: unknown): ValidationResult<AnalyzeMealInput> {
  if (!isRecord(value)) return { success: false, error: "meal input must be an object" };
  if (
    (value.imageName !== undefined && typeof value.imageName !== "string") ||
    (value.energy !== undefined && !isBoundedNumber(value.energy, 1, 10)) ||
    (value.symptoms !== undefined && !isStringArray(value.symptoms))
  ) {
    return { success: false, error: "meal input has invalid fields" };
  }
  return { success: true, data: value as AnalyzeMealInput };
}

export function parsePatternAnalysisInput(value: unknown): ValidationResult<PatternAnalysisInput> {
  if (!isRecord(value) || !isOneOf(value.windowDays, windowDayValues)) {
    return { success: false, error: "windowDays must be 7, 28, or 90" };
  }
  return { success: true, data: { windowDays: value.windowDays } };
}

export function parseHealthNavigatorInput(value: unknown): ValidationResult<HealthNavigatorInput> {
  if (!isRecord(value) || !isBoundedNumber(value.painLevel, 0, 10) || !isStringArray(value.symptoms)) {
    return { success: false, error: "health navigator input is invalid" };
  }
  if (value.cycleRegularity !== undefined && value.cycleRegularity !== "Регулярный" && value.cycleRegularity !== "Нерегулярный") {
    return { success: false, error: "cycleRegularity is invalid" };
  }
  return { success: true, data: value as HealthNavigatorInput };
}

export function isDailyDecisionOutput(value: unknown): value is DailyDecisionOutput {
  return isRecord(value) && typeof value.intent === "string" && typeof value.rationale === "string" && typeof value.movement === "string" && typeof value.nutrition === "string" && typeof value.recovery === "string" && isStringArray(value.safetyFlags);
}

function isWorkoutExercise(value: unknown): value is WorkoutExercise {
  return isRecord(value) && typeof value.name === "string" && typeof value.prescription === "string" && typeof value.rest === "string" && typeof value.cue === "string";
}

function isRange(value: unknown) {
  return isRecord(value) && isBoundedNumber(value.min, 0, Number.MAX_SAFE_INTEGER) && isBoundedNumber(value.max, 0, Number.MAX_SAFE_INTEGER) && value.min <= value.max;
}

export function isWorkoutOutput(value: unknown): value is GenerateWorkoutOutput {
  return isRecord(value) && typeof value.title === "string" && isOneOf(value.durationMinutes, availableMinutesValues) && (value.intensity === "low" || value.intensity === "moderate") && typeof value.explanation === "string" && Array.isArray(value.exercises) && value.exercises.every(isWorkoutExercise);
}

export function isReplaceExerciseOutput(value: unknown): value is ReplaceExerciseOutput {
  return isRecord(value) && isWorkoutExercise(value.replacement) && typeof value.explanation === "string";
}

export function isMealAnalysisOutput(value: unknown): value is AnalyzeMealOutput {
  return isRecord(value) && isStringArray(value.foods) && isRange(value.calories) && isRecord(value.macros) && isRange(value.macros.protein) && isRange(value.macros.carbs) && isRange(value.macros.fat) && isBoundedNumber(value.confidence, 0, 1) && isStringArray(value.uncertaintyFactors) && typeof value.note === "string";
}

export function isPatternAnalysisOutput(value: unknown): value is PatternAnalysisOutput {
  return isRecord(value) && Array.isArray(value.patterns) && value.patterns.every((pattern) => isRecord(pattern) && typeof pattern.title === "string" && typeof pattern.explanation === "string" && (pattern.confidence === "low" || pattern.confidence === "medium"));
}

export function isHealthNavigatorOutput(value: unknown): value is HealthNavigatorOutput {
  return isRecord(value) && (value.level === "observe" || value.level === "consider" || value.level === "urgent") && typeof value.title === "string" && typeof value.explanation === "string" && isStringArray(value.preparation);
}

export function createEnvelope<T>(operation: AiOperation, data: T, source: AiSource = "demo", fallbackReason?: string): AiEnvelope<T> {
  return {
    data,
    source,
    metadata: {
      operation,
      source,
      policyVersion: "demo-policy-v1",
      schemaVersion: "ai-contracts-v1",
      fallbackReason
    }
  };
}

export function createDemoDailyDecision(input: DailyDecisionInput): DailyDecisionOutput {
  const recovery = input.checkIn.painLevel >= 5 || input.checkIn.energy <= 3 || input.checkIn.stress >= 8;
  return recovery
    ? {
        intent: "recovery",
        rationale: "Сегодня контекст указывает на более бережный темп. Это не медицинская оценка.",
        movement: "Комфортное движение или отдых без нагрузки через боль.",
        nutrition: "Выбери доступный и сытный приём пищи без строгих правил.",
        recovery: "Оставь место для спокойного вечера и пауз в течение дня.",
        safetyFlags: input.checkIn.painLevel > 0 ? ["pain-reported"] : []
      }
    : {
        intent: "light_movement",
        rationale: "Ресурс выглядит достаточным для умеренного, гибкого плана.",
        movement: `${input.availableMinutes} минут спокойного движения по самочувствию.`,
        nutrition: "Поддержи ритм удобным приёмом пищи и водой.",
        recovery: "Сохрани небольшую паузу перед сном.",
        safetyFlags: []
      };
}

export function createDemoWorkout(input: GenerateWorkoutInput): GenerateWorkoutOutput {
  const recovery = createDemoDailyDecision(input).intent === "recovery";
  const exercises: WorkoutExercise[] = recovery
    ? [
        { name: "Спокойное дыхание", prescription: "2 минуты", rest: "По самочувствию", cue: "Выбирай удобное положение и не задерживай дыхание." },
        { name: "Неспешная прогулка", prescription: "5-10 минут", rest: "По самочувствию", cue: "Остановись, если ощущения усиливаются." }
      ]
    : [
        { name: "Ягодичный мост", prescription: "2 × 10", rest: "45 сек", cue: "Двигайся в комфортной амплитуде." },
        { name: "Тяга ленты", prescription: "2 × 10", rest: "45 сек", cue: "Сохраняй плечи расслабленными." },
        { name: "Спокойная ходьба", prescription: "5 минут", rest: "По самочувствию", cue: "Выбирай разговорный темп." }
      ];
  const count = input.availableMinutes === 12 ? 2 : input.availableMinutes === 25 ? 3 : exercises.length;
  return {
    title: recovery ? "Восстановление без силовой нагрузки" : "Поддерживающая тренировка",
    durationMinutes: input.availableMinutes,
    intensity: recovery ? "low" : "moderate",
    explanation: recovery ? "Демо-план бережно снижает нагрузку после self-report боли или низкого ресурса." : "Демо-план использует время и текущий self-report, без жёстких обещаний.",
    exercises: exercises.slice(0, count)
  };
}

export function createDemoReplacement(input: ReplaceExerciseInput): ReplaceExerciseOutput {
  return {
    replacement: {
      name: input.reason === "pain" ? "Спокойная ходьба" : "Мягкая альтернатива с лентой",
      prescription: "2 × 8-10",
      rest: "По самочувствию",
      cue: "Остановись, если движение усиливает дискомфорт."
    },
    explanation: "Демо-замена сохраняет комфорт и не предлагает работать через боль."
  };
}

export function createDemoMealAnalysis(): AnalyzeMealOutput {
  return {
    foods: ["Запечённый лосось", "Рис", "Овощи"],
    calories: { min: 420, max: 560 },
    macros: {
      protein: { min: 28, max: 36 },
      carbs: { min: 42, max: 58 },
      fat: { min: 16, max: 24 }
    },
    confidence: 0.72,
    uncertaintyFactors: ["размер порции", "количество масла", "соус или заправка"],
    note: "Демо-оценка приблизительная и не заменяет ручное уточнение."
  };
}

export function createDemoPatternAnalysis(): PatternAnalysisOutput {
  return {
    patterns: [
      { title: "Рабочая нагрузка и энергия", explanation: "В demo-данных энергия чаще ниже после насыщенных дней.", confidence: "low" },
      { title: "Усталость и тяга", explanation: "В demo-данных эти отметки иногда появляются вместе, но это не доказывает причину.", confidence: "low" },
      { title: "Гибкая нагрузка", explanation: "Самоотчёт и симптомы важнее предположений по фазе цикла.", confidence: "medium" }
    ]
  };
}

export function createDemoHealthNavigator(input: HealthNavigatorInput): HealthNavigatorOutput {
  const level = input.painLevel >= 7 ? "consider" : "observe";
  return {
    level,
    title: level === "consider" ? "Повторяющаяся сильная боль - повод обсудить паттерн" : "Продолжай наблюдать за паттернами",
    explanation: level === "consider" ? "Это не диагноз. Если сильная боль повторяется или мешает обычным делам, consider discussing this with a qualified clinician." : "Записывай повторяющиеся симптомы и их контекст, если хочешь видеть паттерны яснее.",
    preparation: ["История цикла", "История симптомов", "Уровень боли", "Вопросы для специалиста"]
  };
}
