import type { MiraLocalData, DailyCheckIn, WorkoutLog, UserProfile, IslamicEntry, CyclePhase, WaterEntry } from "./types";
import { getCycleNorm } from "./cycleEngine";

const STORAGE_KEY = "mira:data";
const DATA_VERSION = 2;

// ── Date helpers ──

export function dateKey(date = new Date()): string {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 10);
}

// ── CRUD ──

export function createEmpty(): MiraLocalData {
  return {
    version: DATA_VERSION,
    checkIns: {},
    workouts: [],
    onboardingCompleted: false,
  };
}

export function readData(): MiraLocalData {
  if (typeof window === "undefined") return createEmpty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmpty();
    const parsed = JSON.parse(raw) as MiraLocalData;
    if (parsed.version !== DATA_VERSION) return createEmpty();
    return parsed;
  } catch {
    return createEmpty();
  }
}

export function writeData(data: MiraLocalData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

// ── Check-in helpers ──

export function saveCheckIn(data: MiraLocalData, checkIn: DailyCheckIn): MiraLocalData {
  return {
    ...data,
    checkIns: { ...data.checkIns, [checkIn.date]: checkIn },
  };
}

export function getCheckIn(data: MiraLocalData, date?: string): DailyCheckIn | undefined {
  return data.checkIns[date ?? dateKey()];
}

// ── Workout helpers ──

export function addWorkout(data: MiraLocalData, workout: Omit<WorkoutLog, "id" | "date">): MiraLocalData {
  return {
    ...data,
    workouts: [
      { ...workout, id: `w-${Date.now()}`, date: dateKey() },
      ...data.workouts,
    ],
  };
}

// ── Profile ──

export function saveProfile(data: MiraLocalData, profile: UserProfile): MiraLocalData {
  return { ...data, profile };
}

// ── Islamic entries ──

export function saveIslamicEntry(data: MiraLocalData, date: string, entry: IslamicEntry): MiraLocalData {
  return {
    ...data,
    islamicEntries: { ...data.islamicEntries, [date]: entry },
  };
}

export function getIslamicEntry(data: MiraLocalData, date?: string): IslamicEntry | undefined {
  return data.islamicEntries?.[date ?? dateKey()];
}

export function countQadaDays(data: MiraLocalData): number {
  if (!data.islamicEntries) return 0;
  let missed = 0;
  let madeUp = 0;
  for (const entry of Object.values(data.islamicEntries)) {
    if (entry.fasting === "missed" || entry.fasting === "exempt") missed++;
    if (entry.fasting === "makeup") madeUp++;
  }
  return Math.max(0, missed - madeUp);
}

export function countHaydDays(data: MiraLocalData): number {
  if (!data.islamicEntries) return 0;
  return Object.values(data.islamicEntries).filter(e => e.hayd).length;
}

export function isInHayd(data: MiraLocalData): boolean {
  return !!data.islamicEntries?.[dateKey()]?.hayd;
}

export function isInPurity(data: MiraLocalData): boolean {
  return !!data.islamicEntries?.[dateKey()]?.purity;
}

// ── Cycle calculations ──

export function getCycleDay(profile: UserProfile | undefined): number {
  if (!profile?.cycleConfig.periodStart) return 1;
  // Движок нормы: считает день цикла от реального последнего старта
  // и медианной длины из истории месячных, а не из онбординг-оценки.
  return getCycleNorm(profile).cycleDay;
}

export function getCyclePhase(day: number, periodLength = 5, cycleLength = 28): CyclePhase {
  if (day <= periodLength) return "menstruation";
  const remaining = cycleLength - periodLength;
  const follEnd = periodLength + Math.round(remaining * 0.4);
  const ovulEnd = follEnd + Math.round(remaining * 0.12);
  if (day <= follEnd) return "follicular";
  if (day <= ovulEnd) return "ovulation";
  return "luteal";
}

export function getPhaseLabel(phase: CyclePhase): string {
  const labels: Record<CyclePhase, string> = {
    menstruation: "Менструация",
    follicular: "Фолликулярная",
    ovulation: "Овуляция",
    luteal: "Лютеиновая",
  };
  return labels[phase];
}

export function getDaysUntilPeriod(profile: UserProfile | undefined): number {
  if (!profile) return 0;
  return getCycleNorm(profile).daysUntilPeriod;
}

// ── Water tracking ──

export function getWaterEntry(data: MiraLocalData, date?: string): WaterEntry {
  const key = date ?? dateKey();
  return data.waterLog?.[key] ?? { date: key, glasses: 0, goal: 8 };
}

export function addWaterGlass(data: MiraLocalData): MiraLocalData {
  const key = dateKey();
  const existing = getWaterEntry(data, key);
  return {
    ...data,
    waterLog: {
      ...data.waterLog,
      [key]: { ...existing, date: key, glasses: existing.glasses + 1 },
    },
  };
}

export function removeWaterGlass(data: MiraLocalData): MiraLocalData {
  const key = dateKey();
  const existing = getWaterEntry(data, key);
  return {
    ...data,
    waterLog: {
      ...data.waterLog,
      [key]: { ...existing, date: key, glasses: Math.max(0, existing.glasses - 1) },
    },
  };
}
