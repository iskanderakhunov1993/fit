"use client";

import React, { memo, useMemo, useState } from "react";
import {
  CalendarDays,
  Droplets,
  Flame,
  HeartPulse,
  Pencil,
  Plus,
  Siren,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MiraWidget, type MiraMood } from "@/components/ui/MiraWidget";

type SymptomColor = "red" | "yellow" | "blue" | "green";
type CalendarDayType = "period" | "pms" | "normal" | "note" | "empty";

type TodaySymptom = {
  type: string;
  label: string;
  value?: string;
  color: SymptomColor;
};

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

type CalendarDay = {
  date: number | null;
  type: CalendarDayType;
};

type TodayData = {
  date: string;
  cycleDay: number;
  phase: string;
  daysUntilPeriod: number;
  symptoms: TodaySymptom[];
  advice: string;
  recommendations: string[];
  article?: {
    title: string;
    link: string;
  };
  checklist: ChecklistItem[];
  calendar: {
    month: string;
    days: CalendarDay[];
    note?: string;
  };
  progress: {
    percentage: number;
    daysTracked: number;
    totalDays: number;
    mood: MiraMood;
    message: string;
    streak: number;
  };
  achievement: {
    title: string;
    unlocked: boolean;
    progress: number;
    target: number;
  };
};

type TodayPageProps = {
  data?: TodayData;
  onPain?: () => void;
  onPeriod?: () => void;
  onCheckIn?: () => void;
  onCare?: () => void;
};

const mockTodayData: TodayData = {
  date: "30 июня",
  cycleDay: 15,
  phase: "Лютеиновая",
  daysUntilPeriod: 3,
  symptoms: [
    { type: "blood", label: "Обильное кровотечение", value: "5 прокладок", color: "red" },
    { type: "pain", label: "Боль 3/5 (спазмы)", color: "yellow" },
    { type: "energy", label: "Низкая энергия", color: "blue" },
  ],
  advice: "сегодня лучше отдохнуть и пить больше воды.",
  recommendations: [
    "🔥 У тебя сегодня спазмы. Магний помогает снизить боль.",
    "🌙 Магний + В6 (300 мг + 25 мг) — вечером, с водой",
    "💧 Вода: 1.5 л из 2.0 л",
  ],
  article: {
    title: "Как быстро снять спазмы",
    link: "/article/spasms",
  },
  checklist: [
    { id: "blood", label: "Кровотечение: 5 прокладок", checked: true },
    { id: "pain", label: "Боль: 3/5, спазмы", checked: true },
    { id: "energy", label: "Энергия: не отмечено", checked: false },
    { id: "sleep", label: "Сон: не отмечено", checked: false },
  ],
  calendar: {
    month: "Июнь 2026",
    days: [
      ...Array.from({ length: 4 }, () => ({ date: null, type: "empty" as const })),
      ...Array.from({ length: 30 }, (_, index) => {
        const date = index + 1;
        if ([1, 2, 3, 4, 30].includes(date)) return { date, type: "period" as const };
        if ([27, 28, 29].includes(date)) return { date, type: "pms" as const };
        if (date === 18) return { date, type: "note" as const };
        return { date, type: "normal" as const };
      }),
      ...Array.from({ length: 8 }, () => ({ date: null, type: "empty" as const })),
    ],
    note: '30 июня: "Спазмы мешали работать."',
  },
  progress: {
    percentage: 87,
    daysTracked: 25,
    totalDays: 30,
    mood: "happy",
    message: "Спасибо, что заботишься о нас обеих! — Мига",
    streak: 3,
  },
  achievement: {
    title: "7 дней подряд",
    unlocked: true,
    progress: 7,
    target: 7,
  },
};

const symptomTone: Record<SymptomColor, string> = {
  red: "bg-[#FFF0F0] text-[#FF6B6B]",
  yellow: "bg-[#FFF7DE] text-[#B88400]",
  blue: "bg-[#EEF5FF] text-[#3478C7]",
  green: "bg-[#EDFAF1] text-[#34A853]",
};

const calendarTone: Record<CalendarDayType, string> = {
  period: "bg-[#E872A0] text-white",
  pms: "bg-[#FFB800]/18 text-[#A57400]",
  normal: "bg-[#EDFAF1] text-[#2F8E47]",
  note: "bg-[#F1E9FF] text-[#7B61C9]",
  empty: "bg-transparent text-transparent",
};

function SectionCard({ title, children, delay = 0 }: { title?: string; children: React.ReactNode; delay?: number }) {
  return (
    <Card
      className="mira-card rounded-[30px] border-0 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(76,66,126,0.14)]"
      style={{ animation: `miraTodayIn 420ms ease ${delay}ms both` }}
    >
      {title && <h2 className="mb-4 text-lg font-black text-[#1A1A1A]">{title}</h2>}
      {children}
    </Card>
  );
}

function PainDialog({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave?: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
        <h2 className="text-xl font-black text-[#1A1A1A]">Что случилось?</h2>
        <div className="mt-4 space-y-3">
          {["Сильная боль", "Спазмы", "Слабость"].map((item) => (
            <button key={item} type="button" className="w-full rounded-2xl bg-[#FAF8F5] px-4 py-3 text-left text-sm font-bold text-[#1A1A1A]">
              {item}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm font-bold text-[#8E8E93]">Насколько сильно?</p>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" className="h-11 rounded-2xl bg-[#FFF0F5] text-sm font-black text-[#E872A0]">
              {value}
            </button>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="rounded-2xl" onClick={onClose}>Закрыть</Button>
          <Button
            type="button"
            className="rounded-2xl bg-[#E872A0] text-white hover:bg-[#D95F8E]"
            onClick={() => {
              onSave?.();
              onClose();
            }}
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Кольцевой прогресс-индикатор в духе референса (крупная цифра по центру). */
function RingStat({
  value,
  label,
  sublabel,
  percentage,
  ringColor = "#FFFFFF",
  trackColor = "rgba(255,255,255,0.28)",
  size = 168,
  stroke = 12,
}: {
  value: string;
  label: string;
  sublabel?: string;
  percentage: number;
  ringColor?: string;
  trackColor?: string;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, percentage));
  const dash = circumference * (pct / 100);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-black text-white leading-none">{value}</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-white/80">{label}</p>
        {sublabel && <p className="mt-0.5 text-[11px] font-semibold text-white/70">{sublabel}</p>}
      </div>
    </div>
  );
}

/** Мини-метрика с иконкой под кольцом (kcal / км / мин в референсе). */
function MiniMetric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">{icon}</div>
      <p className="text-sm font-black text-white">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{label}</p>
    </div>
  );
}

/** Линейный slider-индикатор гидратации, как в референсе (Poor → Perfect). */
function HydrationSlider({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#FFE4EC]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#F4A8C4] to-[#E872A0] transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#E872A0] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all duration-700 ease-out"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wide text-[#8E8E93]">
        <span>Poor</span>
        <span>Good</span>
        <span>Perfect</span>
      </div>
    </div>
  );
}

/** Донат-чарт со списком (в духе карточки макросов из референса). */
function DonutList({
  items,
}: {
  items: { label: string; value: number; color: string }[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-28 shrink-0">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          {items.map((item) => {
            const dash = (item.value / total) * circumference;
            const circle = (
              <circle
                key={item.label}
                cx="56"
                cy="56"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-[#1A1A1A]">100%</span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-bold text-[#1A1A1A]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className="font-black text-[#8E8E93]">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayPageComponent({ data = mockTodayData, onPain, onPeriod, onCheckIn, onCare }: TodayPageProps) {
  const [water, setWater] = useState(1.5);
  const [painOpen, setPainOpen] = useState(false);
  const hasTodayEntries = data.checklist.some((item) => item.checked);
  const waterMl = Math.round(water * 1000);
  const waterRecommendation = useMemo(() => `💧 Вода: ${water.toFixed(1)} л из 2.0 л`, [water]);

  const macroItems = useMemo(
    () => [
      { label: "Энергия", value: Math.max(5, 100 - data.symptoms.length * 18), color: "#34C759" },
      { label: "Симптомы", value: data.symptoms.length * 22 + 5, color: "#FF6B6B" },
      { label: "Сон", value: 30, color: "#A87CE8" },
    ],
    [data.symptoms.length]
  );

  function openPain() {
    if (onPain) {
      onPain();
      return;
    }
    setPainOpen(true);
  }

  return (
    <main className="mira-screen px-5 py-6 text-[#202033]">
      <style jsx global>{`
        @keyframes miraTodayIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto max-w-5xl">
        {/* Шапка */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E872A0]">Сегодня</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#1A1A1A]">
              Привет! Вот твой <span className="text-[#E872A0]">день цикла</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#8E8E93]">
              День {data.cycleDay} | {data.phase} фаза | До месячных: {data.daysUntilPeriod} дня
            </p>
          </div>
          <div className="mira-card flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-[#202033]">
            <CalendarDays className="h-4 w-4 text-[#E872A0]" />
            {data.date}
          </div>
        </header>

        {/* Большая карточка-кольцо: день цикла, в стиле "daily steps dashboard" */}
        <Card
          className="mira-gradient-cycle mt-6 overflow-hidden rounded-[34px] border-0 p-6 shadow-[0_28px_72px_rgba(232,114,160,0.25)] sm:p-8"
          style={{ animation: "miraTodayIn 420ms ease 0ms both" }}
        >
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Цикл сегодня</p>
          <h2 className="mt-1 max-w-sm text-xl font-black leading-snug text-white">
            Ты на <span className="text-[#FFE3EE]">{data.daysUntilPeriod} дня</span> от месячных
          </h2>

          <RingStat
            value={`${data.cycleDay}`}
            label="День цикла"
            sublabel={data.phase}
            percentage={Math.min(100, Math.round((data.cycleDay / 28) * 100))}
            size={176}
            stroke={13}
          />

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniMetric icon={<Flame className="h-4 w-4" />} value={`${data.symptoms.length}`} label="Симптома" />
            <MiniMetric icon={<Droplets className="h-4 w-4" />} value={`${water.toFixed(1)} л`} label="Вода" />
            <MiniMetric icon={<HeartPulse className="h-4 w-4" />} value={data.phase.slice(0, 4)} label="Фаза" />
          </div>
        </Card>

        {/* Быстрые действия */}
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Button type="button" className="h-13 rounded-2xl bg-[#FF6B6B] text-white hover:bg-[#F25353]" onClick={openPain}>
            <Siren className="h-4 w-4" />
            Мне больно
          </Button>
          <Button type="button" variant="outline" className="h-13 rounded-2xl bg-white" onClick={onPeriod}>
            🩸 Месячные
          </Button>
          <Button type="button" className="h-13 rounded-2xl bg-[#E872A0] text-white hover:bg-[#D95F8E]" onClick={onCheckIn}>
            <Plus className="h-4 w-4" />
            Отметить состояние
          </Button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            {/* Важное за сегодня */}
            {data.symptoms.length > 0 && (
              <SectionCard title="📊 Важное за сегодня" delay={40}>
                <div className="space-y-3">
                  {data.symptoms.map((symptom) => (
                    <div key={symptom.type} className={`rounded-2xl px-4 py-3 text-sm font-bold ${symptomTone[symptom.color]}`}>
                      {symptom.label}{symptom.value ? ` (${symptom.value})` : ""}
                    </div>
                  ))}
                  <p className="rounded-2xl bg-[#FAF8F5] px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                    💡 Совет: {data.advice}
                  </p>
                </div>
              </SectionCard>
            )}

            {!hasTodayEntries && (
              <SectionCard delay={40}>
                <p className="text-sm font-bold text-[#1A1A1A]">Сегодня ещё ничего не отмечено. Начни прямо сейчас!</p>
                <Button type="button" className="mt-4 rounded-2xl bg-[#E872A0]" onClick={onCheckIn}>Отметить состояние</Button>
              </SectionCard>
            )}

            {/* Гидратация — карточка со слайдером в духе референса */}
            <SectionCard delay={65}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#E872A0]">Hydration</p>
              <h3 className="mt-1 text-lg font-black leading-snug text-[#1A1A1A]">
                Сегодня ты выпила <span className="text-[#E872A0]">{waterMl} мл</span> воды
              </h3>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-4xl font-black text-[#1A1A1A]">{water.toFixed(1)}<span className="text-lg text-[#8E8E93]"> / 2.0 л</span></p>
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl bg-[#E872A0] hover:bg-[#D95F8E]"
                  onClick={() => setWater((current) => Math.min(2, Math.round((current + 0.2) * 10) / 10))}
                >
                  <Droplets className="h-4 w-4" />
                  + стакан
                </Button>
              </div>
              <div className="mt-4">
                <HydrationSlider value={water} max={2} />
              </div>
            </SectionCard>

            {/* Рекомендации */}
            <SectionCard title="💊 Рекомендации на сегодня" delay={90}>
              <div className="space-y-3">
                {[...data.recommendations.slice(0, 2), waterRecommendation].map((recommendation) => (
                  <div key={recommendation} className="rounded-2xl bg-[#FAF8F5] px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                    {recommendation}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Баланс дня — донат-чарт в духе карточки макросов */}
            <SectionCard title="🍓 Баланс дня" delay={115}>
              <DonutList items={macroItems} />
            </SectionCard>

            {/* Статья */}
            {data.article && data.symptoms.length > 0 && (
              <SectionCard title="📖 Статья под твой симптом" delay={140}>
                <p className="text-sm leading-relaxed text-[#1A1A1A]">
                  У тебя сегодня спазмы? Читай: “{data.article.title}”
                </p>
                <Button type="button" className="mt-4 rounded-2xl bg-[#E872A0] text-white hover:bg-[#D95F8E]">
                  📖 Читать полностью
                </Button>
              </SectionCard>
            )}

            {/* Что отметить */}
            <SectionCard title="📌 Что отметить сегодня" delay={190}>
              <div className="space-y-3">
                {data.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-[#FAF8F5] px-4 py-3 text-sm font-bold text-[#1A1A1A]">
                    <span className={item.checked ? "text-[#34C759]" : "text-[#8E8E93]"}>{item.checked ? "✅" : "⬜"}</span>
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Button type="button" className="rounded-2xl bg-[#E872A0]" onClick={onCheckIn}>➕ Отметить состояние</Button>
                <Button type="button" variant="outline" className="rounded-2xl bg-white" onClick={onCare}>💧 Добавить заботу</Button>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            {/* Мига */}
            <MiraWidget
              percentage={data.progress.percentage}
              daysTracked={data.progress.daysTracked}
              totalDays={data.progress.totalDays}
              mood={data.progress.mood}
              message={data.progress.message}
              streakDays={data.progress.streak}
              className="[animation:miraTodayIn_420ms_ease_70ms_both]"
            />

            {/* Календарь */}
            <SectionCard title={`📅 ${data.calendar.month}`} delay={240}>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-[#8E8E93]">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => <div key={day}>{day}</div>)}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {data.calendar.days.slice(0, 42).map((day, index) => (
                  <div
                    key={`${day.date ?? "empty"}-${index}`}
                    className={`flex aspect-square items-center justify-center rounded-2xl text-sm font-black ${calendarTone[day.type]}`}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-bold leading-relaxed text-[#8E8E93]">
                🔴 — Месячные  🟡 — ПМС  🟢 — Норма  📝 — Заметка
              </p>
              {data.calendar.note && (
                <p className="mt-3 rounded-2xl bg-[#FAF8F5] px-4 py-3 text-sm font-semibold text-[#1A1A1A]">
                  📝 {data.calendar.note}
                </p>
              )}
              <Button type="button" variant="outline" className="mt-4 w-full rounded-2xl bg-white">
                <Pencil className="h-4 w-4" />
                Редактировать
              </Button>
            </SectionCard>

            {/* Достижения — кольцевая карточка с акцентным фоном */}
            <Card
              className="overflow-hidden rounded-[28px] border-0 p-5 text-white shadow-[0_10px_26px_rgba(168,124,232,0.28)]"
              style={{
                background: "linear-gradient(135deg, #B98AE8 0%, #A87CE8 100%)",
                animation: "miraTodayIn 420ms ease 290ms both",
              }}
            >
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Достижение</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-black leading-snug text-white">{data.achievement.title}</p>
                  <p className="text-sm font-semibold text-white/80">
                    {data.achievement.unlocked ? "открыто! 🎉" : `осталось ${data.achievement.target - data.achievement.progress} дней`}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.min(100, (data.achievement.progress / data.achievement.target) * 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-white/85">
                <Sparkles className="h-3.5 w-3.5" />
                {data.achievement.progress} из {data.achievement.target}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PainDialog open={painOpen} onClose={() => setPainOpen(false)} onSave={onCheckIn} />
    </main>
  );
}

export const TodayPage = memo(TodayPageComponent);
TodayPage.displayName = "TodayPage";

export default TodayPage;
