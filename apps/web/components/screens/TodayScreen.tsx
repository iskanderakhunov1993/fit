"use client";

import { motion } from "framer-motion";
import {
  ChevronRight, Sparkles, Heart, Shield,
  GlassWater, Activity, AlertTriangle, Bell,
  BookOpen, Thermometer, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CycleWheel } from "./CycleWheel";
import {
  getCycleDay, getCyclePhase, getPhaseLabel,
  getDaysUntilPeriod, getCheckIn, dateKey,
} from "@/lib/store";
import { getTipForToday } from "@/lib/tips";
import { getSmartReminders, getRedFlags, getDailyPhaseCard, getToughDayContent, getIronAlert } from "@/lib/alerts";
import { getVitaminRecommendations } from "@/lib/vitamins";
import { getDayStatus, getQadaStats, haydDuas, type Madhab } from "@/lib/islamic";
import { getAgeConfig } from "@/lib/ageMode";
import { NormMap } from "./NormMap";
import { DayPrediction } from "./DayPrediction";
import { CycleSummaryCard } from "./CycleSummaryCard";
import type { ScreenProps } from "./types";
import type { CyclePhase } from "@/lib/types";

function formatDate(): string {
  return new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

const phaseDescriptions: Record<CyclePhase, string> = {
  menstruation: "Время заботы о себе. Энергия может быть ниже — это нормально.",
  follicular: "Энергия растёт, настроение улучшается. Хорошее время для активности.",
  ovulation: "Пик энергии и уверенности. Отличное время для важных дел.",
  luteal: "Организм замедляется. Может появиться раздражительность или тяга к сладкому.",
};

const fertilityLevel: Record<CyclePhase, { label: string; color: string }> = {
  menstruation: { label: "Низкая", color: "text-mira-muted" },
  follicular: { label: "Средняя", color: "text-[#C4B07E]" },
  ovulation: { label: "Высокая", color: "text-[#C47E7E]" },
  luteal: { label: "Низкая", color: "text-mira-muted" },
};

const careByPhase: Record<CyclePhase, string[]> = {
  menstruation: [
    "Тёплая еда и питьё",
    "Продукты с железом: гречка, шпинат, красное мясо",
    "Лёгкая прогулка или растяжка",
    "Больше отдыха",
  ],
  follicular: [
    "Белок и сложные углеводы",
    "Силовая тренировка или бег",
    "Больше воды",
    "Время для новых начинаний",
  ],
  ovulation: [
    "Антиоксиданты: ягоды, орехи",
    "Интенсивная тренировка",
    "Достаточно воды",
    "Социальная активность",
  ],
  luteal: [
    "Магний: бананы, тёмный шоколад, орехи",
    "Тёплая еда",
    "Лёгкая активность или йога",
    "Ранний сон",
  ],
};

const quickButtonsAll = [
  { label: "Всё как обычно", key: "ok" },
  { label: "Боль", key: "pain" },
  { label: "Плохой сон", key: "sleep" },
  { label: "ПМС", key: "pms" },
  { label: "Секс", key: "sex" },
  { label: "Кровотечение", key: "bleeding" },
];

const quickButtonsIslamic = [
  { label: "Всё как обычно", key: "ok" },
  { label: "Боль", key: "pain" },
  { label: "Плохой сон", key: "sleep" },
  { label: "ПМС", key: "pms" },
  { label: "Кровотечение", key: "bleeding" },
];

export function TodayScreen({ data, navigate, onCheckIn }: ScreenProps) {
  const profile = data.profile;
  const cycleDay = getCycleDay(profile);
  const cycleLength = profile?.cycleConfig.cycleLength ?? 28;
  const periodLength = profile?.cycleConfig.periodLength ?? 5;
  const phase = getCyclePhase(cycleDay, periodLength, cycleLength);
  const daysUntil = getDaysUntilPeriod(profile);
  const checkIn = getCheckIn(data);
  const name = profile?.name ?? "Моя Норма";
  const fertility = fertilityLevel[phase];
  const tip = getTipForToday(phase, checkIn ?? undefined);
  const isIslamic = profile?.additionalMode === "islam";
  const ageConfig = getAgeConfig(profile?.age);
  const islamicStatus = isIslamic ? getDayStatus(data, (profile?.madhab ?? "hanafi") as Madhab) : null;
  const qadaStats = isIslamic ? getQadaStats(data) : null;

  const trackedItems: { color: string; text: string }[] = [];
  if (checkIn?.mood) trackedItems.push({ color: "bg-[#B8A5D8]", text: `Настроение: ${moodLabel(checkIn.mood.value)}` });
  if (checkIn?.energy) trackedItems.push({ color: "bg-[#C4B07E]", text: `Энергия: ${energyLabel(checkIn.energy.value)}` });
  if (checkIn?.sleep) trackedItems.push({ color: "bg-[#7E8EC4]", text: `Сон: ${sleepLabel(checkIn.sleep)}` });
  if (checkIn?.pain) trackedItems.push({ color: "bg-[#C47E9B]", text: `Боль: ${painLabel(checkIn.pain.level)}` });
  if (checkIn?.period) trackedItems.push({ color: "bg-[#E8A0B8]", text: "Месячные" });

  const daysRange = daysUntil > 2
    ? `через ${daysUntil - 2}–${daysUntil + 2} дней`
    : daysUntil > 0
      ? `через ${daysUntil} дн.`
      : "ожидаются сегодня";

  const reminders = getSmartReminders(data);
  const redFlags = getRedFlags(data);
  const phaseCard = getDailyPhaseCard(data);
  const toughDay = getToughDayContent(data);
  const ironAlert = getIronAlert(data);
  const vitaminCard = getVitaminRecommendations(data);

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      {/* Tough day mode */}
      {toughDay && (
        <motion.div variants={fadeUp} className="mb-5">
          <Card className="border-mira-cycle/20 bg-gradient-to-br from-mira-rose-light/40 to-white p-5">
            <p className="text-lg font-bold text-mira-text mb-1">{toughDay.greeting}</p>
            <div className="mt-3 space-y-2">
              {toughDay.tips.map(t => (
                <div key={t} className="flex items-start gap-2 text-sm text-mira-text">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mira-success" />{t}
                </div>
              ))}
            </div>
            {toughDay.avoid.length > 0 && (
              <div className="mt-3 rounded-xl bg-[#F5E0EA]/40 p-3">
                <p className="text-xs text-mira-cycle font-semibold mb-1">Лучше избегать:</p>
                {toughDay.avoid.map(a => (
                  <p key={a} className="text-xs text-mira-cycle">— {a}</p>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Smart reminders */}
      {reminders.map((r, i) => (
        <motion.div key={i} variants={fadeUp} className="mb-3">
          <Card className={`p-4 ${r.type === "delay" ? "border-[#C47E7E]/20 bg-[#F5E0E0]/20" : "border-[#C4B07E]/20 bg-[#F5F0E0]/20"}`}>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-[#C4B07E]" />
              <p className="text-sm font-bold text-mira-text">{r.title}</p>
            </div>
            <p className="text-xs text-mira-muted">{r.body}</p>
            {r.items && (
              <ul className="mt-2 space-y-1">
                {r.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-mira-text">
                    <span className="h-1 w-1 rounded-full bg-[#C4B07E]" />{item}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </motion.div>
      ))}

      {/* Red flags */}
      {redFlags.length > 0 && (
        <motion.div variants={fadeUp} className="mb-5">
          <Card className="border-[#C47E7E]/20 bg-[#FFF5F5] p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-[#C47E7E]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C47E7E]">Обрати внимание</p>
            </div>
            {redFlags.slice(0, 2).map((f, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <p className="text-sm font-semibold text-mira-text">{f.title}</p>
                <p className="text-xs text-mira-muted mt-0.5">{f.body}</p>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-mira-muted">{getGreeting()}</p>
          <p className="text-2xl font-bold text-mira-text">{name}</p>
        </div>
        <Badge>{formatDate()}</Badge>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-5">
          {/* Cycle card — clean, no duplication */}
          <motion.div variants={fadeUp}>
            <Card className="overflow-hidden border-mira-cycle/15 bg-gradient-to-br from-mira-rose-light/50 to-mira-lavender-light/50 p-0">
              <div className="flex items-center gap-6 p-5 sm:p-6">
                <CycleWheel
                  size={130}
                  cycleDay={cycleDay}
                  phase={phase}
                  cycleLength={cycleLength}
                  periodLength={periodLength}
                  daysUntilPeriod={daysUntil}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-mira-primary">{getPhaseLabel(phase)} фаза</p>
                  <p className="mt-1 text-sm text-mira-muted">
                    Месячные {daysRange}
                  </p>
                  {/* Fertility inline (hidden in Islamic mode and for teens) */}
                  {!isIslamic && ageConfig.showFertility && (
                    <div className="mt-2 flex items-center gap-2">
                      <Heart className="h-3.5 w-3.5 text-mira-cycle" />
                      <span className="text-xs text-mira-muted">Фертильность:</span>
                      <span className={`text-xs font-bold ${fertility.color}`}>{fertility.label}</span>
                    </div>
                  )}
                  {/* Islamic status inline */}
                  {isIslamic && islamicStatus && (
                    <div className="mt-2 flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5 text-mira-primary" />
                      <span className={`text-xs font-bold ${islamicStatus.shouldPray ? "text-mira-success" : "text-[#C47E9B]"}`}>
                        {islamicStatus.status === "hayd" ? "Хайд" : islamicStatus.status === "purity" ? "Чистота" : islamicStatus.status === "istihada" ? "Истихада" : islamicStatus.status === "nifas" ? "Нифас" : "Не отмечено"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Phase insight — compact */}
          {phaseCard && (
            <motion.div variants={fadeUp}>
              <Card className="border-mira-primary/10 p-4">
                <p className="text-xs text-mira-muted mb-2">
                  {phaseCard.hormoneStatus}
                </p>
                <div className="space-y-1">
                  {phaseCard.whatToExpect.slice(0, 3).map(w => (
                    <p key={w} className="text-sm text-mira-text">— {w}</p>
                  ))}
                </div>
                {checkIn?.pms && checkIn.pms.symptoms.length > 0 && (
                  <p className="mt-2 text-sm text-mira-cycle font-semibold">
                    ПМС: {checkIn.pms.symptoms.slice(0, 3).join(", ").toLowerCase()}
                  </p>
                )}
              </Card>
            </motion.div>
          )}

          {/* Iron alert */}
          {ironAlert && (
            <motion.div variants={fadeUp}>
              <Card className="border-[#C4887E]/15 bg-[#FFF5F0] p-4">
                <p className="text-sm font-semibold text-mira-text mb-1">{ironAlert.title}</p>
                <p className="text-xs text-mira-muted mb-2">{ironAlert.body}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ironAlert.foods.map(f => (
                    <span key={f} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-mira-text">{f}</span>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Vitamin recommendations */}
          {vitaminCard && vitaminCard.recs.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="border-mira-success/15 bg-gradient-to-br from-[#E8F5EC]/40 to-white p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-mira-text">{vitaminCard.title}</p>
                  <span className="text-lg">💊</span>
                </div>
                <p className="text-xs text-mira-muted mb-4">{vitaminCard.subtitle}</p>

                <div className="space-y-3">
                  {vitaminCard.recs.map((rec) => (
                    <div key={rec.name} className={`rounded-2xl p-3.5 ${
                      rec.priority === "high" ? "bg-white border border-mira-success/20 shadow-card" : "bg-mira-bg"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{rec.icon}</span>
                        <span className="text-sm font-bold text-mira-text">{rec.name}</span>
                        <span className="ml-auto rounded-full bg-mira-lavender-light px-2 py-0.5 text-[10px] font-semibold text-mira-primary">{rec.dose}</span>
                      </div>
                      <p className="text-xs text-mira-muted mb-1.5">{rec.why}</p>
                      <p className="text-xs text-mira-success font-medium">{rec.how}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl bg-[#F5F0E0]/50 p-2.5">
                  <p className="text-[10px] text-[#A09060]">
                    <Shield className="mr-1 inline h-3 w-3" />
                    Не является назначением. Обсуди приём добавок с врачом.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Quick log */}
          <motion.div variants={fadeUp}>
            <Button className="w-full mb-3" size="lg" onClick={onCheckIn}>
              + Отметить состояние <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="flex flex-wrap gap-2">
              {(isIslamic || !ageConfig.showSex ? quickButtonsIslamic : quickButtonsAll).map((btn) => (
                <button
                  key={btn.key}
                  onClick={onCheckIn}
                  className="rounded-full border border-mira-lavender/30 bg-white px-3.5 py-2 text-xs font-semibold text-mira-text transition hover:border-mira-primary/30 hover:bg-mira-lavender-light/50 active:scale-[0.97]"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column (desktop) */}
        <div className="space-y-5">
          {/* Islamic: Qada mini card */}
          {isIslamic && qadaStats && qadaStats.remaining > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="border-mira-primary/15 bg-mira-lavender-light/30 p-4 cursor-pointer" onClick={() => navigate("islamic")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-mira-primary" />
                    <span className="text-sm font-bold text-mira-text">Каза-посты</span>
                  </div>
                  <span className="text-lg font-bold text-mira-primary">{qadaStats.remaining}</span>
                </div>
                <p className="mt-1 text-xs text-mira-muted">Осталось возместить. Пн и чт — сунна.</p>
              </Card>
            </motion.div>
          )}

          {/* Islamic: Dua of the day */}
          {isIslamic && islamicStatus?.status === "hayd" && (
            <motion.div variants={fadeUp}>
              <Card className="border-mira-primary/10 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-mira-primary mb-2">Зикр дня</p>
                <p className="text-base font-bold text-mira-text text-right leading-loose" dir="rtl">
                  {haydDuas[new Date().getDate() % haydDuas.length].arabic}
                </p>
                <p className="text-xs text-mira-primary font-semibold mt-1">
                  {haydDuas[new Date().getDate() % haydDuas.length].transliteration}
                </p>
                <p className="text-[11px] text-mira-muted mt-0.5">
                  {haydDuas[new Date().getDate() % haydDuas.length].translation}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Care card */}
          <motion.div variants={fadeUp}>
            <Card className="border-mira-success/15 bg-[#E0F5E8]/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <GlassWater className="h-4 w-4 text-mira-success" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-mira-success">
                  Забота сегодня
                </span>
              </div>
              <p className="text-xs text-mira-muted mb-3">Сегодня может подойти:</p>
              <ul className="space-y-2">
                {careByPhase[phase].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-mira-text">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mira-success/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Tip card */}
          <motion.div variants={fadeUp}>
            <Card className="border-[#C4B07E]/15 bg-[#F5F0E0]/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#C4B07E]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A09060]">
                    Полезное
                  </span>
                </div>
                <span className="rounded-full bg-[#C4B07E]/10 px-2 py-0.5 text-[10px] font-semibold text-[#A09060]">
                  {tip.tag}
                </span>
              </div>
              <p className="text-sm font-semibold text-mira-text">{tip.title}</p>
              <p className="mt-1.5 text-xs text-mira-muted leading-relaxed">{tip.body}</p>
            </Card>
          </motion.div>

          {/* Tracked today */}
          {trackedItems.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted mb-3">
                  Сегодня отмечено
                </p>
                <div className="space-y-2.5">
                  {trackedItems.map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-sm">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="text-mira-text">{item.text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Day prediction */}
          <motion.div variants={fadeUp}>
            <DayPrediction data={data} />
          </motion.div>

          {/* Norm map */}
          <motion.div variants={fadeUp}>
            <NormMap data={data} />
          </motion.div>

          {/* Cycle summary */}
          <motion.div variants={fadeUp}>
            <CycleSummaryCard data={data} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function moodLabel(v: string): string {
  const m: Record<string, string> = { normal: "нормально", joy: "радость", sadness: "грусть", anger: "злость", anxiety: "тревога", swings: "перепады" };
  return m[v] ?? v;
}

function energyLabel(v: string): string {
  const m: Record<string, string> = { exhausted: "истощение", low: "мало сил", normal: "нормально", high: "много сил" };
  return m[v] ?? v;
}

function sleepLabel(s: { quality: string; hours?: number }): string {
  const q: Record<string, string> = { good: "хороший", normal: "нормальный", bad: "плохой", little: "мало", insomnia: "бессонница" };
  const label = q[s.quality] ?? s.quality;
  return s.hours ? `${s.hours} ч, ${label}` : label;
}

function painLabel(v?: string): string {
  if (!v) return "отмечена";
  const m: Record<string, string> = { light: "лёгкая", medium: "средняя", strong: "сильная" };
  return m[v] ?? v;
}
