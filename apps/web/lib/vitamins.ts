import type { MiraLocalData, CyclePhase, DailyCheckIn } from "./types";
import { getCycleDay, getCyclePhase, getCheckIn, dateKey } from "./store";

export type VitaminRec = {
  name: string;
  dose: string;
  why: string;
  how: string;
  priority: "high" | "medium" | "low";
  icon: string;
};

export type VitaminCard = {
  title: string;
  subtitle: string;
  recs: VitaminRec[];
};

function getYesterdayCheckIn(data: MiraLocalData): DailyCheckIn | undefined {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return data.checkIns[dateKey(y)];
}

function getRecentHeavyDays(data: MiraLocalData, daysBack: number): number {
  let count = 0;
  for (let i = 0; i < daysBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const c = data.checkIns[dateKey(d)];
    if (c?.period?.intensity === "heavy" || c?.period?.intensity === "very_heavy") count++;
  }
  return count;
}

export function getVitaminRecommendations(data: MiraLocalData): VitaminCard | null {
  const profile = data.profile;
  if (!profile) return null;

  const cycleDay = getCycleDay(profile);
  const cycleLength = profile.cycleConfig.cycleLength;
  const periodLength = profile.cycleConfig.periodLength;
  const phase = getCyclePhase(cycleDay, periodLength, cycleLength);
  const today = getCheckIn(data);
  const yesterday = getYesterdayCheckIn(data);
  const recentHeavy = getRecentHeavyDays(data, 3);

  const recs: VitaminRec[] = [];

  // ── Blood loss → Iron + Vitamin C ──
  if (recentHeavy >= 1) {
    recs.push({
      name: "Железо",
      dose: "18–25 мг",
      why: `Обильные месячные ${recentHeavy} ${recentHeavy === 1 ? "день" : "дня"} подряд — организм теряет железо. Без него кислород хуже доставляется к клеткам.`,
      how: "Принимай с едой + запей апельсиновым соком — витамин C увеличивает усвоение в 3-6 раз. Не пей с чаем/кофе — они блокируют всасывание.",
      priority: "high",
      icon: "🩸",
    });
    recs.push({
      name: "Витамин C",
      dose: "200–500 мг",
      why: "Помогает усвоению железа и поддерживает иммунитет, который снижается при кровопотере.",
      how: "Водорастворимый — выпей с большим стаканом воды. Можно разделить на 2 приёма (утро + вечер).",
      priority: "high",
      icon: "🍊",
    });
  }

  // ── Pain → Magnesium ──
  if (today?.pain?.level === "strong" || today?.pain?.level === "medium" || yesterday?.pain?.level === "strong") {
    recs.push({
      name: "Магний",
      dose: "300–400 мг",
      why: "Расслабляет мышцы матки и уменьшает спазмы. Исследования показывают снижение боли на 25-50%.",
      how: "Лучше магний цитрат или глицинат — они усваиваются лучше оксида. Выпей с водой перед сном — бонусом улучшит сон.",
      priority: "high",
      icon: "💊",
    });
  }

  // ── Bad sleep in luteal → Magnesium + B6 ──
  if ((phase === "luteal" || phase === "menstruation") && (today?.sleep?.quality === "bad" || today?.sleep?.quality === "insomnia" || yesterday?.sleep?.quality === "bad" || yesterday?.sleep?.quality === "insomnia")) {
    if (!recs.some(r => r.name === "Магний")) {
      recs.push({
        name: "Магний",
        dose: "300–400 мг",
        why: "Прогестерон повышает температуру тела и мешает сну. Магний помогает расслабиться и нормализовать температуру.",
        how: "Выпей за 30-60 минут до сна с тёплой водой. Магний глицинат — лучший для сна.",
        priority: "high",
        icon: "🌙",
      });
    }
    recs.push({
      name: "Витамин B6",
      dose: "25–50 мг",
      why: "Участвует в выработке серотонина и мелатонина — гормонов, которые регулируют сон и настроение.",
      how: "Водорастворимый — выпей с водой. Лучше утром или днём, не перед сном.",
      priority: "medium",
      icon: "😴",
    });
  }

  // ── PMS → Calcium + Magnesium + B6 ──
  if (today?.pms && today.pms.symptoms.length > 0) {
    if (!recs.some(r => r.name === "Магний")) {
      recs.push({
        name: "Магний",
        dose: "300–400 мг",
        why: "Уменьшает раздражительность, вздутие и тягу к сладкому при ПМС.",
        how: "С водой, лучше вечером. Магний цитрат или глицинат.",
        priority: "high",
        icon: "😤",
      });
    }
    recs.push({
      name: "Кальций",
      dose: "500–1000 мг",
      why: "Клинические исследования показывают снижение ПМС-симптомов на 48% при приёме кальция.",
      how: "Раздели на 2 приёма (утро + вечер) — так лучше усваивается. Не принимай одновременно с железом.",
      priority: "medium",
      icon: "🦴",
    });
  }

  // ── Low energy → Iron check + B12 + D ──
  if (today?.energy?.value === "exhausted" || today?.energy?.value === "low" || yesterday?.energy?.value === "exhausted") {
    if (!recs.some(r => r.name === "Железо")) {
      recs.push({
        name: "Витамин D",
        dose: "1000–2000 МЕ",
        why: "Дефицит витамина D — одна из главных причин хронической усталости. 70-80% женщин в России имеют дефицит.",
        how: "Жирорастворимый — принимай с едой, где есть жиры (авокадо, орехи, масло). Лучше утром.",
        priority: "medium",
        icon: "☀️",
      });
    }
    recs.push({
      name: "Витамин B12",
      dose: "500–1000 мкг",
      why: "Отвечает за энергию и работу нервной системы. При дефиците — усталость, туман в голове, слабость.",
      how: "Водорастворимый — с водой, натощак или с едой. Усваивается лучше в форме метилкобаламина.",
      priority: "medium",
      icon: "⚡",
    });
  }

  // ── Anxiety/sadness in luteal → B6 + Omega-3 ──
  if ((today?.mood?.value === "anxiety" || today?.mood?.value === "sadness") && phase === "luteal") {
    if (!recs.some(r => r.name === "Витамин B6")) {
      recs.push({
        name: "Витамин B6",
        dose: "25–50 мг",
        why: "Падение серотонина в лютеиновой фазе вызывает тревогу и грусть. B6 помогает вырабатывать серотонин.",
        how: "Водорастворимый — с водой, лучше утром. Не превышай 100 мг/день.",
        priority: "medium",
        icon: "🧠",
      });
    }
    recs.push({
      name: "Омега-3",
      dose: "1000–2000 мг",
      why: "Уменьшает воспаление и поддерживает работу мозга. Исследования показывают снижение тревожности.",
      how: "Жирорастворимый — с едой. Выбирай с высоким содержанием EPA (не менее 500 мг).",
      priority: "low",
      icon: "🐟",
    });
  }

  // ── Phase-based baseline (if nothing specific) ──
  if (recs.length === 0) {
    if (phase === "menstruation") {
      recs.push({
        name: "Магний",
        dose: "300 мг",
        why: "Поддерживает мышцы и нервную систему в менструальную фазу.",
        how: "С водой, вечером. Магний цитрат или глицинат.",
        priority: "low",
        icon: "💊",
      });
    } else if (phase === "follicular") {
      recs.push({
        name: "Витамин D",
        dose: "1000–2000 МЕ",
        why: "Поддерживает растущий эстроген и энергию в фолликулярной фазе.",
        how: "Жирорастворимый — с завтраком, где есть жиры.",
        priority: "low",
        icon: "☀️",
      });
    } else if (phase === "ovulation") {
      recs.push({
        name: "Цинк",
        dose: "15–25 мг",
        why: "Поддерживает репродуктивное здоровье и иммунитет в овуляторную фазу.",
        how: "С едой — на пустой желудок может быть тошнота. Не принимай с кальцием.",
        priority: "low",
        icon: "✨",
      });
    } else {
      recs.push({
        name: "Магний + B6",
        dose: "300 мг + 25 мг",
        why: "Классическая связка для лютеиновой фазы — уменьшает ПМС, улучшает сон.",
        how: "Вместе с водой, вечером перед сном.",
        priority: "low",
        icon: "🌙",
      });
    }
  }

  // Build title
  let title = "Что может помочь сегодня";
  let subtitle = "На основе твоей фазы";

  if (recentHeavy >= 2) {
    title = "Восполни потери";
    subtitle = `Обильные месячные ${recentHeavy} дня — организму нужна поддержка`;
  } else if (today?.pain?.level === "strong") {
    title = "Поддержка при боли";
    subtitle = "Эти добавки могут облегчить спазмы";
  } else if (today?.pms && today.pms.symptoms.length >= 2) {
    title = "Против ПМС";
    subtitle = "Исследования показывают эффективность этих добавок";
  } else if (today?.energy?.value === "exhausted") {
    title = "Верни энергию";
    subtitle = "Проверь, нет ли дефицита";
  } else if (recs.some(r => r.priority === "high")) {
    subtitle = "На основе твоих вчерашних и сегодняшних данных";
  }

  return { title, subtitle, recs: recs.slice(0, 4) };
}
