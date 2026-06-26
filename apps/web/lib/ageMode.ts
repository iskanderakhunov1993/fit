export type AgeGroup = "teen" | "young" | "mature" | "peri";

export function getAgeGroup(age: number | undefined): AgeGroup {
  if (!age || age < 18) return "teen";
  if (age < 30) return "young";
  if (age < 43) return "mature";
  return "peri";
}

export type AgeConfig = {
  group: AgeGroup;
  label: string;
  showFertility: boolean;
  showSex: boolean;
  showIntimacy: boolean;
  showPartner: boolean;
  showVitaminDoses: boolean;
  tone: "gentle" | "normal" | "detailed";
  greeting: string;
  irregularityNote: string;
  hiddenCategories: string[];
  phaseExplanationStyle: "simple" | "full" | "menopause";
};

const configs: Record<AgeGroup, AgeConfig> = {
  teen: {
    group: "teen",
    label: "10–17 лет",
    showFertility: false,
    showSex: false,
    showIntimacy: false,
    showPartner: false,
    showVitaminDoses: false,
    tone: "gentle",
    greeting: "Привет",
    irregularityNote: "Твой цикл ещё устанавливается — нерегулярность в первые 2-3 года это абсолютно нормально. Не переживай!",
    hiddenCategories: ["sex", "discharge", "intimacy"],
    phaseExplanationStyle: "simple",
  },
  young: {
    group: "young",
    label: "18–29 лет",
    showFertility: true,
    showSex: true,
    showIntimacy: true,
    showPartner: true,
    showVitaminDoses: true,
    tone: "normal",
    greeting: "Привет",
    irregularityNote: "Цикл должен быть достаточно регулярным. Если длина сильно меняется — стоит обратить внимание.",
    hiddenCategories: [],
    phaseExplanationStyle: "full",
  },
  mature: {
    group: "mature",
    label: "30–42 года",
    showFertility: true,
    showSex: true,
    showIntimacy: true,
    showPartner: true,
    showVitaminDoses: true,
    tone: "detailed",
    greeting: "Привет",
    irregularityNote: "После 35 цикл может начать меняться. Отслеживание изменений особенно важно сейчас.",
    hiddenCategories: [],
    phaseExplanationStyle: "full",
  },
  peri: {
    group: "peri",
    label: "43+ лет",
    showFertility: false,
    showSex: true,
    showIntimacy: true,
    showPartner: true,
    showVitaminDoses: true,
    tone: "detailed",
    greeting: "Привет",
    irregularityNote: "Цикл может становиться нерегулярным — это нормальный переход. Приложение поможет отслеживать изменения.",
    hiddenCategories: [],
    phaseExplanationStyle: "menopause",
  },
};

export function getAgeConfig(age: number | undefined): AgeConfig {
  return configs[getAgeGroup(age)];
}

// ── Teen-adapted phase explanations ──

export const teenPhaseCards: Record<string, { title: string; body: string; tip: string }> = {
  menstruation: {
    title: "Сейчас месячные",
    body: "Это нормальный процесс — тело обновляется. Может быть небольшая боль в животе и усталость. Это пройдёт через несколько дней.",
    tip: "Грелка на живот, тёплый чай и отдых помогут. Не стесняйся попросить помощи у мамы.",
  },
  follicular: {
    title: "Энергия возвращается",
    body: "После месячных тело восстанавливается. Ты можешь чувствовать себя бодрее и веселее. Хорошее время для учёбы и спорта!",
    tip: "Ешь вкусное и полезное — фрукты, йогурт, каша. Тело сейчас набирает силы.",
  },
  ovulation: {
    title: "Середина цикла",
    body: "Сейчас ты можешь чувствовать себя лучше всего за весь месяц. Больше энергии и хорошее настроение.",
    tip: "Отличное время для любимых занятий и общения с подругами.",
  },
  luteal: {
    title: "Скоро месячные",
    body: "Тело готовится к новому циклу. Настроение может быть переменчивым, хочется сладкого — это нормально, так работают гормоны.",
    tip: "Если грустно или раздражает — это временно. Через несколько дней станет лучше. Бананы и шоколад могут поднять настроение.",
  },
};

// ── Peri-menopause adapted explanations ──

export const periPhaseCards: Record<string, { title: string; body: string; tip: string }> = {
  menstruation: {
    title: "Менструация",
    body: "Месячные могут стать нерегулярными, обильнее или скуднее — это часть перименопаузы. Важно отслеживать изменения.",
    tip: "Если кровотечение необычно сильное или длится дольше 7 дней — обсудите с врачом.",
  },
  follicular: {
    title: "Фолликулярная фаза",
    body: "Эстроген растёт, но его уровень может колебаться больше, чем раньше. Энергия и настроение улучшаются.",
    tip: "Витамин D и кальций особенно важны в этом возрасте для здоровья костей.",
  },
  ovulation: {
    title: "Середина цикла",
    body: "Овуляция может происходить не каждый цикл — это нормально для перименопаузы. Вы всё ещё можете забеременеть.",
    tip: "Отслеживайте длину циклов — если они стали значительно короче или длиннее, обсудите с врачом.",
  },
  luteal: {
    title: "Лютеиновая фаза",
    body: "Колебания гормонов могут быть сильнее. Приливы, потливость, перепады настроения — признаки перехода.",
    tip: "Магний, омега-3 и регулярная активность помогают с симптомами. Обсудите ЗГТ с врачом, если симптомы мешают жить.",
  },
};
