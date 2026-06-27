import type { MiraLocalData, CyclePhase, DailyCheckIn } from "./types";
import { getCycleDay, getCyclePhase, getPhaseLabel, getDaysUntilPeriod, dateKey } from "./store";

// ── #1 Smart Reminders ──

export type SmartReminder = {
  type: "prepare" | "restock" | "period_start" | "delay" | "clothing" | "firstaid";
  title: string;
  body: string;
  items?: string[];
};

export function getSmartReminders(data: MiraLocalData): SmartReminder[] {
  const profile = data.profile;
  if (!profile) return [];

  const daysUntil = getDaysUntilPeriod(profile);
  const cycleDay = getCycleDay(profile);
  const cycleLength = profile.cycleConfig.cycleLength;
  const reminders: SmartReminder[] = [];

  if (daysUntil >= 2 && daysUntil <= 4) {
    reminders.push({
      type: "prepare",
      title: `Месячные через ${daysUntil} дня`,
      body: "Проверь, всё ли есть дома и в сумке",
      items: [
        "Прокладки / тампоны / менструальная чаша",
        "Средство от боли, если оно тебе подходит",
        "Грелка",
        "Перекус и вода на работу/учёбу",
      ],
    });

    reminders.push({
      type: "clothing",
      title: "👗 Одежда на ближайшие дни",
      body: "Пока месячные не начались — подготовь удобную одежду",
      items: [
        "Тёмное нижнее бельё (не новое, не светлое)",
        "Удобные штаны/юбка — без давления на живот",
        "Запасное бельё в сумку — на всякий случай",
        "Если на работу/учёбу — тёмный низ безопаснее",
      ],
    });

    reminders.push({
      type: "firstaid",
      title: "💊 Мини-аптечка в сумку",
      body: "Собери на случай если начнётся вне дома",
      items: [
        "2-3 прокладки/тампона в косметичку",
        "Средство от боли, если оно тебе подходит и уже согласовано",
        "Влажные салфетки",
        "Маленькая бутылка воды",
        "Пакетик для использованных средств",
      ],
    });
  }

  if (daysUntil === 1) {
    reminders.push({
      type: "period_start",
      title: "Месячные ожидаются завтра",
      body: "Положи средства гигиены в сумку. Надень тёмное бельё на ночь.",
    });
  }

  if (cycleDay > cycleLength + 3) {
    reminders.push({
      type: "delay",
      title: `Задержка ${cycleDay - cycleLength} дней`,
      body: `Цикл обычно длится ${cycleLength} дней. Сейчас ${cycleDay}-й день. Это может быть вариантом нормы, но если задержка продолжится — стоит обратить внимание.`,
    });
  }

  return reminders;
}

// ── #2 Red Flags ──

export type RedFlag = {
  severity: "warning" | "alert";
  title: string;
  body: string;
  action: string;
};

export function getRedFlags(data: MiraLocalData): RedFlag[] {
  const profile = data.profile;
  if (!profile) return [];

  const checkIns = Object.values(data.checkIns);
  if (checkIns.length < 14) return [];

  const flags: RedFlag[] = [];
  const cycleLength = profile.cycleConfig.cycleLength;
  const periodLength = profile.cycleConfig.periodLength;

  // Strong pain 3+ cycles
  const strongPainDays = checkIns.filter(c => c.pain?.level === "strong");
  if (strongPainDays.length >= 3) {
    const impactDays = strongPainDays.length;
    flags.push({
      severity: "alert",
      title: `Сильная боль повторяется (${impactDays} дней)`,
      body: "Боль, которая мешает обычной жизни, стоит обсудить с врачом. Отчёт поможет показать, как часто это повторяется.",
      action: "Создать отчёт для врача",
    });
  }

  // Very heavy periods
  const heavyPeriods = checkIns.filter(c => c.period?.intensity === "very_heavy");
  if (heavyPeriods.length >= 2) {
    flags.push({
      severity: "alert",
      title: "Очень обильные месячные повторяются",
      body: "При обильных месячных иногда снижаются запасы железа. Если есть усталость, бледность или выпадение волос, стоит обсудить ферритин с врачом.",
      action: "Обратить внимание на железо",
    });
  }

  // Period >7 days
  if (periodLength > 7) {
    flags.push({
      severity: "warning",
      title: "Месячные длятся дольше 7 дней",
      body: "Нормальная длительность — 3-7 дней. Если кровотечение регулярно дольше, стоит обсудить с врачом.",
      action: "Обсудить с врачом",
    });
  }

  // Cycle too short or too long
  if (cycleLength < 21) {
    flags.push({
      severity: "warning",
      title: "Цикл короче 21 дня",
      body: "Это может указывать на гормональные изменения. Стоит обсудить с гинекологом.",
      action: "Обсудить с врачом",
    });
  }
  if (cycleLength > 35) {
    flags.push({
      severity: "warning",
      title: "Цикл длиннее 35 дней",
      body: "Нерегулярные длинные циклы могут иметь разные причины. Лучше обсудить это с гинекологом.",
      action: "Обсудить с врачом",
    });
  }

  // Bad sleep >40% of days
  const sleepDays = checkIns.filter(c => c.sleep);
  const badSleep = sleepDays.filter(c => c.sleep!.quality === "bad" || c.sleep!.quality === "insomnia");
  if (sleepDays.length >= 14 && badSleep.length > sleepDays.length * 0.4) {
    flags.push({
      severity: "warning",
      title: "Хронически плохой сон",
      body: "Плохой сон отмечен в 40%+ дней. Это может быть связано с фазой цикла, стрессом или нагрузкой; хронические проблемы лучше обсудить со специалистом.",
      action: "Обсудить с врачом",
    });
  }

  return flags;
}

// ── #4 Symptom-Phase Correlation ──

export type PhaseCorrelation = {
  symptom: string;
  phase: string;
  frequency: number;
  total: number;
  explanation: string;
};

export function getPhaseCorrelations(data: MiraLocalData): PhaseCorrelation[] {
  const profile = data.profile;
  if (!profile) return [];

  const checkIns = Object.values(data.checkIns);
  if (checkIns.length < 14) return [];

  const cycleLength = profile.cycleConfig.cycleLength;
  const periodLength = profile.cycleConfig.periodLength;
  const correlations: PhaseCorrelation[] = [];

  function getPhaseForCheckIn(c: DailyCheckIn): CyclePhase {
    const start = new Date(profile!.cycleConfig.periodStart);
    const d = new Date(c.date);
    const days = Math.max(0, Math.floor((d.getTime() - start.getTime()) / 86_400_000));
    const cycleDay = (days % cycleLength) + 1;
    return getCyclePhase(cycleDay, periodLength, cycleLength);
  }

  // Mood by phase
  const anxietyByPhase: Record<string, number> = {};
  const sadnessByPhase: Record<string, number> = {};
  let totalAnxiety = 0;
  let totalSadness = 0;

  for (const c of checkIns) {
    if (!c.mood) continue;
    const phase = getPhaseForCheckIn(c);
    const pl = getPhaseLabel(phase);
    if (c.mood.value === "anxiety") { anxietyByPhase[pl] = (anxietyByPhase[pl] ?? 0) + 1; totalAnxiety++; }
    if (c.mood.value === "sadness") { sadnessByPhase[pl] = (sadnessByPhase[pl] ?? 0) + 1; totalSadness++; }
  }

  const topAnxiety = Object.entries(anxietyByPhase).sort((a, b) => b[1] - a[1])[0];
  if (topAnxiety && topAnxiety[1] >= 2) {
    correlations.push({
      symptom: "Тревога",
      phase: topAnxiety[0],
      frequency: topAnxiety[1],
      total: totalAnxiety,
      explanation: `Тревога чаще появляется в ${topAnxiety[0].toLowerCase()} фазе (${topAnxiety[1]} из ${totalAnxiety} раз). Это может быть связано с колебаниями цикла, стрессом или сном.`,
    });
  }

  const topSadness = Object.entries(sadnessByPhase).sort((a, b) => b[1] - a[1])[0];
  if (topSadness && topSadness[1] >= 2) {
    correlations.push({
      symptom: "Грусть",
      phase: topSadness[0],
      frequency: topSadness[1],
      total: totalSadness,
      explanation: `Грусть чаще в ${topSadness[0].toLowerCase()} фазе (${topSadness[1]} из ${totalSadness}). Это наблюдение по твоим данным, не диагноз.`,
    });
  }

  // Pain by phase
  const painByPhase: Record<string, number> = {};
  let totalPain = 0;
  for (const c of checkIns) {
    if (!c.pain || c.pain.kinds.every(k => k === "none")) continue;
    const phase = getPhaseForCheckIn(c);
    const pl = getPhaseLabel(phase);
    painByPhase[pl] = (painByPhase[pl] ?? 0) + 1;
    totalPain++;
  }
  const topPain = Object.entries(painByPhase).sort((a, b) => b[1] - a[1])[0];
  if (topPain && topPain[1] >= 2) {
    correlations.push({
      symptom: "Боль",
      phase: topPain[0],
      frequency: topPain[1],
      total: totalPain,
      explanation: `Боль концентрируется в ${topPain[0].toLowerCase()} фазе (${topPain[1]} из ${totalPain}). ${topPain[0] === "Менструация" ? "Тепло и мягкий режим некоторым помогают пережить спазмы." : "Боль вне менструации лучше не игнорировать, особенно если она повторяется."}`,
    });
  }

  // Bad sleep by phase
  const badSleepByPhase: Record<string, number> = {};
  let totalBadSleep = 0;
  for (const c of checkIns) {
    if (c.sleep?.quality !== "bad" && c.sleep?.quality !== "insomnia") continue;
    const phase = getPhaseForCheckIn(c);
    const pl = getPhaseLabel(phase);
    badSleepByPhase[pl] = (badSleepByPhase[pl] ?? 0) + 1;
    totalBadSleep++;
  }
  const topBadSleep = Object.entries(badSleepByPhase).sort((a, b) => b[1] - a[1])[0];
  if (topBadSleep && topBadSleep[1] >= 2) {
    correlations.push({
      symptom: "Плохой сон",
      phase: topBadSleep[0],
      frequency: topBadSleep[1],
      total: totalBadSleep,
      explanation: `Сон ухудшается в ${topBadSleep[0].toLowerCase()} фазе (${topBadSleep[1]} из ${totalBadSleep}). Попробуй отслеживать температуру комнаты, стресс и кофеин вечером.`,
    });
  }

  // Low energy by phase
  const lowEnergyByPhase: Record<string, number> = {};
  let totalLowEnergy = 0;
  for (const c of checkIns) {
    if (c.energy?.value !== "exhausted" && c.energy?.value !== "low") continue;
    const phase = getPhaseForCheckIn(c);
    const pl = getPhaseLabel(phase);
    lowEnergyByPhase[pl] = (lowEnergyByPhase[pl] ?? 0) + 1;
    totalLowEnergy++;
  }
  const topLowEnergy = Object.entries(lowEnergyByPhase).sort((a, b) => b[1] - a[1])[0];
  if (topLowEnergy && topLowEnergy[1] >= 2) {
    correlations.push({
      symptom: "Низкая энергия",
      phase: topLowEnergy[0],
      frequency: topLowEnergy[1],
      total: totalLowEnergy,
      explanation: `Энергия падает в ${topLowEnergy[0].toLowerCase()} фазе (${topLowEnergy[1]} из ${totalLowEnergy}). ${topLowEnergy[0] === "Менструация" ? "Если это повторяется, можно обсудить железо и ферритин с врачом." : "Это может быть связано с циклом, сном или нагрузкой."}`,
    });
  }

  return correlations;
}

// ── #6 Iron Alert ──

export type IronAlert = {
  show: boolean;
  title: string;
  body: string;
  foods: string[];
} | null;

export function getIronAlert(data: MiraLocalData): IronAlert {
  const checkIns = Object.values(data.checkIns);
  const heavyDays = checkIns.filter(c => c.period?.intensity === "heavy" || c.period?.intensity === "very_heavy");

  if (heavyDays.length < 2) return null;

  const lowEnergy = checkIns.filter(c => c.energy?.value === "exhausted" || c.energy?.value === "low");
  const hasLowEnergy = lowEnergy.length >= 3;

  return {
    show: true,
    title: hasLowEnergy
      ? "Обильные месячные + низкая энергия → стоит проверить железо"
      : "Обильные месячные → следи за железом",
    body: hasLowEnergy
      ? "При обильных месячных запасы железа иногда снижаются. Усталость, бледность или выпадение волос — повод обсудить ферритин с врачом."
      : "При обильных месячных организм теряет больше железа. Добавь продукты с железом в рацион.",
    foods: ["Гречка", "Шпинат", "Красное мясо", "Чечевица", "Гранат", "Печень"],
  };
}

// ── #7 Tough Day Mode ──

export function isToughDay(data: MiraLocalData): boolean {
  const checkIn = data.checkIns[dateKey()];
  if (!checkIn) return false;
  return (
    checkIn.pain?.level === "strong" ||
    checkIn.energy?.value === "exhausted" ||
    (checkIn.sleep?.quality === "insomnia" && checkIn.energy?.value === "low") ||
    (checkIn.period?.intensity === "very_heavy")
  );
}

export type ToughDayContent = {
  greeting: string;
  tips: string[];
  avoid: string[];
};

export function getToughDayContent(data: MiraLocalData): ToughDayContent | null {
  if (!isToughDay(data)) return null;
  const checkIn = data.checkIns[dateKey()];
  if (!checkIn) return null;

  const tips: string[] = [];
  const avoid: string[] = [];

  if (checkIn.pain?.level === "strong") {
    tips.push("Грелка на живот — тепло расслабляет мышцы матки");
    tips.push("Поза эмбриона снимает давление");
    tips.push("Медленное глубокое дыхание (4 сек вдох, 6 сек выдох)");
    avoid.push("Интенсивные тренировки");
    avoid.push("Кофе — усиливает спазмы");
  }

  if (checkIn.energy?.value === "exhausted") {
    tips.push("Белковый перекус: орехи, йогурт, яйцо");
    tips.push("15 минут на воздухе — возвращает силы");
    tips.push("Стакан воды — обезвоживание маскируется под усталость");
    avoid.push("Сахарные перекусы — дадут скачок и обвал");
  }

  if (checkIn.period?.intensity === "very_heavy") {
    tips.push("Продукты с железом: гречка, шпинат, гранат");
    tips.push("Пей больше воды");
    tips.push("Отдыхай без вины — тело работает");
  }

  if (tips.length === 0) {
    tips.push("Будь мягче к себе сегодня");
    tips.push("Лёгкая прогулка или просто отдых");
    tips.push("Тёплый чай и тёплая еда");
  }

  return {
    greeting: "Сегодня тяжёлый день. Это пройдёт.",
    tips,
    avoid,
  };
}

// ── #8 Doctor Visit Script ──

export type DoctorScript = {
  intro: string;
  questions: string[];
  dataPoints: string[];
};

export function getDoctorScript(data: MiraLocalData): DoctorScript {
  const profile = data.profile;
  const checkIns = Object.values(data.checkIns);
  const flags = getRedFlags(data);

  const questions: string[] = [
    "Как оценить мои месячные и цикл для моего возраста?",
  ];
  const dataPoints: string[] = [];

  if (profile) {
    dataPoints.push(`Длина цикла: ${profile.cycleConfig.cycleLength} дней`);
    dataPoints.push(`Длительность месячных: ${profile.cycleConfig.periodLength} дней`);
    dataPoints.push(`Данных собрано: ${checkIns.length} дней`);
  }

  const strongPain = checkIns.filter(c => c.pain?.level === "strong");
  if (strongPain.length >= 2) {
    questions.push(`Сильная боль отмечена ${strongPain.length} раз — какие причины стоит исключить?`);
    dataPoints.push(`Сильная боль: ${strongPain.length} дней`);
  }

  const heavy = checkIns.filter(c => c.period?.intensity === "heavy" || c.period?.intensity === "very_heavy");
  if (heavy.length >= 2) {
    questions.push("Нужно ли проверить уровень железа / ферритин?");
    dataPoints.push(`Обильные месячные: ${heavy.length} дней`);
  }

  if (profile && profile.cycleConfig.cycleLength > 35) {
    questions.push("Какие причины длинного цикла стоит проверить?");
  }

  const badSleep = checkIns.filter(c => c.sleep?.quality === "bad" || c.sleep?.quality === "insomnia");
  if (badSleep.length >= 5) {
    questions.push("Может ли плохой сон быть связан с гормонами?");
    dataPoints.push(`Плохой сон: ${badSleep.length} дней`);
  }

  questions.push("Какие обследования вы рекомендуете?");

  for (const flag of flags) {
    if (!questions.some(q => q.includes(flag.title.split(" ")[0]))) {
      questions.push(flag.title + " — что это может значить?");
    }
  }

  return {
    intro: "Я отслеживаю свой цикл и симптомы. Вот данные, которые я собрала:",
    questions,
    dataPoints,
  };
}

// ── #3 Daily Phase Card (enhanced) ──

export type DailyPhaseCard = {
  phase: CyclePhase;
  phaseLabel: string;
  cycleDay: number;
  title: string;
  bodyFacts: string[];
  hormoneStatus: string;
  whatToExpect: string[];
};

export function getDailyPhaseCard(data: MiraLocalData): DailyPhaseCard | null {
  const profile = data.profile;
  if (!profile) return null;

  const cycleDay = getCycleDay(profile);
  const cycleLength = profile.cycleConfig.cycleLength;
  const periodLength = profile.cycleConfig.periodLength;
  const phase = getCyclePhase(cycleDay, periodLength, cycleLength);

  const cards: Record<CyclePhase, Omit<DailyPhaseCard, "phase" | "phaseLabel" | "cycleDay">> = {
    menstruation: {
      title: "Менструальная фаза",
      hormoneStatus: "Эстроген и прогестерон на минимуме",
      bodyFacts: [
        "Матка сокращается, чтобы обновить слизистую",
        "Простагландины вызывают спазмы — это причина боли",
        "Организм теряет 30-80 мл крови (2-5 ст. ложек)",
        "Запасы железа могут снижаться — усталость стоит отслеживать",
      ],
      whatToExpect: [
        "Энергия ниже обычного",
        "Возможна боль и дискомфорт",
        "Хочется тёплого и сладкого",
        "Сон может быть глубже",
      ],
    },
    follicular: {
      title: "Фолликулярная фаза",
      hormoneStatus: "Эстроген растёт → мозг вырабатывает больше серотонина",
      bodyFacts: [
        "Фолликулы созревают в яичниках",
        "Эстроген улучшает память и концентрацию",
        "Кожа выглядит лучше — коллаген активен",
        "Метаболизм ускоряется",
      ],
      whatToExpect: [
        "Энергия и мотивация растут",
        "Настроение улучшается",
        "Лучшее время для новых привычек",
        "Мышцы быстрее восстанавливаются",
      ],
    },
    ovulation: {
      title: "Овуляторная фаза",
      hormoneStatus: "Пик эстрогена + выброс лютеинизирующего гормона (ЛГ)",
      bodyFacts: [
        "Яйцеклетка выходит из яичника",
        "Фертильность максимальна 24-48 часов",
        "Тестостерон даёт уверенность и либидо",
        "Голос немного повышается (исследования)",
      ],
      whatToExpect: [
        "Максимум энергии и уверенности",
        "Повышенное либидо",
        "Лучший день для важных разговоров",
        "Возможна лёгкая боль сбоку (овуляторная)",
      ],
    },
    luteal: {
      title: "Лютеиновая фаза",
      hormoneStatus: "Прогестерон растёт, потом резко падает перед месячными",
      bodyFacts: [
        "Прогестерон повышает температуру тела на 0.3-0.5°C",
        "Настроение может стать чувствительнее",
        "Задержка жидкости → вздутие и вес +1-2 кг",
        "ПМС-сигналы важно отслеживать без самокритики",
      ],
      whatToExpect: [
        "Энергия и настроение могут снизиться",
        "Тяга к сладкому — прогестерон повышает аппетит",
        "Сон может ухудшиться",
        "Раздражительность может быть частью твоего паттерна",
      ],
    },
  };

  return {
    phase,
    phaseLabel: getPhaseLabel(phase),
    cycleDay,
    ...cards[phase],
  };
}
