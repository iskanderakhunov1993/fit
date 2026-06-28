"use client";

import {
  Activity,
  AlertCircle,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Footprints,
  Moon,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRedFlags, getPhaseCorrelations } from "@/lib/alerts";
import { getCycleNorm } from "@/lib/cycleEngine";
import { getCycleAnalytics, type CycleAnalyticsPoint } from "@/lib/cycleAnalytics";
import { getCorrelations } from "@/lib/correlations";
import { getHealthSummary, statusMeta } from "@/lib/healthScore";
import { getSmartInsights } from "@/lib/insights";
import { dateKey } from "@/lib/store";
import type { ScreenProps } from "./types";

type Tone = "success" | "watch" | "alert" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "border-mira-success/15 bg-[#E0F5E8]/30 text-mira-success",
  watch: "border-[#C4B07E]/20 bg-[#F5F0E0]/45 text-[#9A7B2F]",
  alert: "border-mira-cycle/20 bg-[#F8E8EE]/55 text-mira-cycle",
  neutral: "border-mira-lavender/20 bg-mira-bg text-mira-muted",
};

function Progress({ value, color = "bg-mira-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-mira-lavender-light">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function pct(count: number, goal: number) {
  return Math.min(100, Math.round((count / Math.max(goal, 1)) * 100));
}

function shortList(items: string[], empty: string) {
  if (items.length === 0) return empty;
  if (items.length <= 2) return items.join(", ");
  return `${items.slice(0, 2).join(", ")} +${items.length - 2}`;
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-3 px-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">{label}</p>
      <p className="text-sm font-bold text-mira-text">{title}</p>
    </div>
  );
}

function MiniStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-mira-lavender/20 bg-mira-bg px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">{label}</p>
      <p className="mt-1 text-xl font-black leading-none text-mira-text">{value}</p>
      <p className="mt-1 text-[10px] leading-snug text-mira-muted">{note}</p>
    </div>
  );
}

function CycleBar({ cycle, maxPain, maxPms, maxEnergy }: { cycle: CycleAnalyticsPoint; maxPain: number; maxPms: number; maxEnergy: number }) {
  return (
    <div className="rounded-2xl border border-mira-lavender/20 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-mira-text">{cycle.label}</p>
          <p className="text-[10px] text-mira-muted">{new Date(`${cycle.start}T00:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</p>
        </div>
        <Badge className="bg-mira-bg text-[10px] text-mira-muted shadow-none">{cycle.length} дн.</Badge>
      </div>
      <div className="space-y-2">
        <MetricBar label="Боль" value={cycle.strongPainDays} max={maxPain} color="bg-mira-cycle" />
        <MetricBar label="ПМС" value={cycle.pmsDays} max={maxPms} color="bg-[#A07EC4]" />
        <MetricBar label="Энергия" value={cycle.lowEnergyDays} max={maxEnergy} color="bg-[#C4B07E]" />
        <MetricBar label="Обильность" value={cycle.heavyFlowDays} max={Math.max(1, cycle.heavyFlowDays)} color="bg-[#C47E9B]" />
      </div>
    </div>
  );
}

function MetricBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px]">
        <span className="font-semibold text-mira-muted">{label}</span>
        <span className="text-mira-text">{value}</span>
      </div>
      <Progress value={(value / Math.max(max, 1)) * 100} color={color} />
    </div>
  );
}

function CycleAnalyticsCard({ analytics, onOpenReport }: { analytics: NonNullable<ReturnType<typeof getCycleAnalytics>>; onOpenReport: () => void }) {
  const maxPain = Math.max(1, ...analytics.cycles.map(c => c.strongPainDays));
  const maxPms = Math.max(1, ...analytics.cycles.map(c => c.pmsDays));
  const maxEnergy = Math.max(1, ...analytics.cycles.map(c => c.lowEnergyDays));

  return (
    <Card className="mb-5 border-mira-primary/10 bg-mira-lavender-light/20 p-4">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70 text-mira-primary">
          <TrendingUp className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">Аналитика цикла</p>
          <p className="mt-0.5 text-base font-bold leading-snug text-mira-text">{analytics.headline}</p>
          <p className="mt-1 text-xs leading-relaxed text-mira-muted">{analytics.insight}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {analytics.cycles.map(cycle => (
          <CycleBar key={cycle.start} cycle={cycle} maxPain={maxPain} maxPms={maxPms} maxEnergy={maxEnergy} />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {analytics.links.map(link => (
          <MiniStat key={link.label} label={link.label} value={link.value} note={link.note} />
        ))}
      </div>

      {analytics.doctorNote && (
        <div className="mt-3 rounded-2xl border border-mira-cycle/15 bg-white/75 p-3">
          <p className="text-xs font-semibold leading-relaxed text-mira-cycle">{analytics.doctorNote}</p>
          <Button className="mt-3 w-full" variant="outline" onClick={onOpenReport}>
            <FileText className="h-4 w-4" /> В отчёт врачу
          </Button>
        </div>
      )}
    </Card>
  );
}

export function AnalyticsScreen({ data, navigate, onCheckIn }: ScreenProps) {
  const profile = data.profile;
  const today = data.checkIns[dateKey()];
  const checkIns = Object.values(data.checkIns);
  const totalDays = checkIns.length;

  const norm = getCycleNorm(profile);
  const cycleLength = norm.cycleLength;
  const periodLength = profile?.cycleConfig.periodLength ?? 5;
  const health = getHealthSummary(data);
  const redFlags = getRedFlags(data);
  const smartInsights = getSmartInsights(data);
  const correlations = getCorrelations(data);
  const phaseCorrelations = getPhaseCorrelations(data);
  const cycleAnalytics = getCycleAnalytics(data);

  const painEntries = checkIns.filter(c => c.pain && c.pain.kinds.some(k => k !== "none"));
  const strongPainEntries = painEntries.filter(c => c.pain?.level === "strong");
  const sleepEntries = checkIns.filter(c => c.sleep);
  const energyEntries = checkIns.filter(c => c.energy);
  const moodEntries = checkIns.filter(c => c.mood);
  const pmsEntries = checkIns.filter(c => c.pms && c.pms.symptoms.length > 0);
  const symptomLogEntries = checkIns.filter(c => c.symptomLog);
  const walkingEntries = Object.values(data.walkingLog ?? {}).filter(entry => entry.steps > 0);
  const walkingDays = walkingEntries.length;

  const missingToday = [
    !today?.sleep ? "сон" : null,
    !today?.energy ? "энергию" : null,
    !today?.mood ? "настроение" : null,
    !today?.pms ? "ПМС" : null,
  ].filter((item): item is string => Boolean(item));

  const dataNeeds: Array<{
    id: string;
    icon: typeof CalendarDays;
    label: string;
    count: number;
    goal: number;
    unit: string;
    why: string;
    color: string;
  }> = [
    { id: "daily", icon: ClipboardList, label: "Ежедневные отметки", count: totalDays, goal: 7, unit: "дней", why: "первые наблюдения", color: "bg-mira-primary" },
    { id: "cycle", icon: CalendarDays, label: "Старт месячных", count: norm.observedCycles, goal: 2, unit: "цикла", why: "точность прогноза", color: "bg-mira-cycle" },
    { id: "sleep", icon: Moon, label: "Сон", count: sleepEntries.length, goal: 7, unit: "дней", why: "связь с энергией", color: "bg-[#7E8EC4]" },
    { id: "energy", icon: Zap, label: "Энергия", count: energyEntries.length, goal: 7, unit: "дней", why: "пики и спады", color: "bg-[#C4B07E]" },
    { id: "mood", icon: Brain, label: "Настроение", count: moodEntries.length, goal: 7, unit: "дней", why: "связь с фазами", color: "bg-[#9B8EC4]" },
    { id: "walking", icon: Footprints, label: "Ходьба", count: walkingDays, goal: 7, unit: "дней", why: "связь с энергией и ПМС", color: "bg-mira-success" },
    { id: "pain", icon: Activity, label: "Боль", count: painEntries.length, goal: 3, unit: "раза", why: "повтор боли", color: "bg-[#C47E9B]" },
    { id: "pms", icon: Sparkles, label: "ПМС", count: pmsEntries.length, goal: 3, unit: "раза", why: "предупреждения заранее", color: "bg-[#A07EC4]" },
    { id: "symptomLog", icon: ClipboardList, label: "Лог симптомов", count: symptomLogEntries.length, goal: 6, unit: "дней", why: "повторы перед месячными", color: "bg-[#7E9BC4]" },
  ];

  const weakestNeed = dataNeeds.slice().sort((a, b) => pct(a.count, a.goal) - pct(b.count, b.goal))[0];
  const usefulMetrics = health.metrics.filter(metric => metric.status !== "nodata");

  const evidenceItems = [
    ...redFlags.map(flag => ({
      key: `flag-${flag.title}`,
      tone: "alert" as Tone,
      icon: "!",
      title: flag.title,
      body: flag.body,
    })),
    ...correlations.map(item => ({
      key: item.id,
      tone: item.strength === "strong" ? "success" as Tone : "watch" as Tone,
      icon: item.emoji,
      title: item.title,
      body: item.body,
    })),
    ...phaseCorrelations.slice(0, 2).map(item => ({
      key: `phase-${item.symptom}`,
      tone: "watch" as Tone,
      icon: "↔",
      title: `${item.symptom}: ${item.phase}`,
      body: item.explanation,
    })),
    ...smartInsights.map((item, index) => ({
      key: `smart-${index}`,
      tone: item.type === "action" ? "alert" as Tone : "neutral" as Tone,
      icon: item.icon === "positive" ? "✓" : "i",
      title: item.title,
      body: item.body,
    })),
  ].slice(0, 3);

  const heroTone: Tone = redFlags.length > 0 ? "alert" : totalDays < 7 ? "watch" : evidenceItems.length > 0 ? "success" : "neutral";
  const heroTitle = redFlags.length > 0
    ? "Есть сигнал, который стоит обсудить"
    : totalDays < 7
      ? "Пока рано делать личные выводы"
      : evidenceItems.length > 0
        ? "Mira уже видит, что повторяется"
        : "Данных достаточно для первых наблюдений";
  const heroBody = redFlags.length > 0
    ? "На этой странице собраны факты, которые можно превратить в отчёт для врача."
    : totalDays < 7
      ? `Отметь состояние ещё ${Math.max(0, 7 - totalDays)} раз, и Mira начнёт показывать не общие советы, а твои повторы.`
      : "Сравниваем цикл, сон, боль, ходьбу, энергию и настроение, чтобы показать не цифры, а смысл.";

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-mira-text">Что повторяется</h1>
        <p className="mt-1 text-sm text-mira-muted">Простые выводы по циклу, симптомам и самочувствию</p>
      </div>

      <Card className={`mb-4 p-4 ${toneClass[heroTone]}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70">
            {redFlags.length > 0 ? <AlertCircle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest">Главный вывод</p>
            <p className="mt-1 text-lg font-bold leading-snug text-mira-text">{heroTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-mira-muted">{heroBody}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Button onClick={() => onCheckIn?.()}>
            <Plus className="h-4 w-4" /> Отметить сегодня
          </Button>
          <Button variant="outline" onClick={() => navigate("report")}>
            <FileText className="h-4 w-4" /> Отчёт врачу
          </Button>
        </div>
      </Card>

      <SectionTitle label="1" title={evidenceItems.length > 0 ? "Что уже повторяется" : "Что появится здесь"} />
      <div className="mb-5 space-y-3">
        {evidenceItems.length > 0 ? (
          evidenceItems.map(item => (
            <Card key={item.key} className={`p-4 ${toneClass[item.tone]}`}>
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-sm font-black">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-snug text-mira-text">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-mira-muted">{item.body}</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-mira-lavender/20 bg-mira-bg p-4">
            <p className="text-sm font-bold text-mira-text">Пока нет устойчивого повтора</p>
            <p className="mt-1 text-xs leading-relaxed text-mira-muted">
              Отмечай состояние несколько дней. Mira покажет, что повторяется именно у тебя: боль, ПМС, сон, энергия или настроение.
            </p>
          </Card>
        )}
      </div>

      <SectionTitle label="2" title="Что делать дальше" />
      <div className="mb-5 space-y-3">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mira-lavender-light text-mira-primary">
              <ClipboardList className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-mira-text">
                {today ? "Сегодня уже есть отметка" : "Отметь сегодняшнее состояние"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mira-muted">
                {today
                  ? `Если хочешь точнее: добавь ${shortList(missingToday, "ничего не нужно")}.`
                  : "Одна отметка сегодня поможет понять связь цикла, сна, энергии, боли и настроения."}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E0F5E8] text-mira-success">
              <Target className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-mira-text">Для точности не хватает: {weakestNeed.label.toLowerCase()}</p>
              <p className="mt-1 text-xs leading-relaxed text-mira-muted">
                Сейчас собрано {weakestNeed.count}/{weakestNeed.goal} {weakestNeed.unit}. Это нужно, чтобы Mira лучше видела: {weakestNeed.why}.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <SectionTitle label="3" title="Когда лучше к врачу" />
      <div className="mb-5 space-y-3">
        {redFlags.length > 0 ? (
          redFlags.slice(0, 3).map(flag => (
            <Card key={flag.title} className="border-mira-cycle/20 bg-[#F8E8EE]/45 p-4">
              <p className="text-sm font-bold text-mira-text">{flag.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-mira-muted">{flag.body}</p>
            </Card>
          ))
        ) : (
          <Card className="border-mira-success/15 bg-[#E0F5E8]/25 p-4">
            <p className="text-sm font-bold text-mira-text">Срочных сигналов нет</p>
            <p className="mt-1 text-xs leading-relaxed text-mira-muted">
              По текущим отметкам нет повторяющихся красных флагов. Если появится резкая боль, обморок, очень обильное кровотечение или кровь после секса — лучше обратиться за медицинской помощью.
            </p>
          </Card>
        )}

        <Button className="w-full" variant="outline" onClick={() => navigate("report")}>
          <FileText className="h-4 w-4" /> Собрать отчёт врачу
        </Button>
      </div>

      <details className="mb-5 rounded-2xl border border-mira-lavender/20 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-mira-text">
          Подробности по циклу и самочувствию
        </summary>
        <p className="mt-1 text-xs leading-relaxed text-mira-muted">
          Здесь можно посмотреть цифры, если хочется разобраться глубже.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-mira-muted">Цикл</p>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Цикл" value={`${cycleLength}`} note="дней по норме" />
              <MiniStat label="Месячные" value={`${periodLength}`} note="дней обычно" />
              <MiniStat label="Циклов" value={`${norm.observedCycles}`} note="наблюдаем" />
              <MiniStat label="Разброс" value={norm.observedCycles >= 2 ? `${norm.spread}` : "—"} note="дней между циклами" />
            </div>
          </div>

          {cycleAnalytics && (
            <CycleAnalyticsCard analytics={cycleAnalytics} onOpenReport={() => navigate("report")} />
          )}

          {usefulMetrics.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-mira-muted">Показатели</p>
              <div className="grid grid-cols-2 gap-3">
                {health.metrics.map((metric) => {
                  const meta = statusMeta[metric.status];
                  return (
                    <Card key={metric.id} className="p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-lg">{metric.emoji}</span>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color }} />
                      </div>
                      <p className="text-xs font-bold text-mira-text">{metric.label}</p>
                      <p className="mt-1 text-[11px] font-semibold" style={{ color: meta.color }}>{metric.verdict}</p>
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-mira-muted">{metric.detail}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </details>

      <details className="mb-5 rounded-2xl border border-mira-lavender/20 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-mira-text">
          Что собирается для точности
        </summary>
        <p className="mt-1 text-xs leading-relaxed text-mira-muted">
          Эти данные нужны, чтобы Mira отличала случайный день от твоего повторяющегося паттерна.
        </p>
        <div className="mt-4 space-y-3">
          {dataNeeds.map((need) => {
            const Icon = need.icon;
            const value = pct(need.count, need.goal);
            const done = value >= 100;
            return (
              <div key={need.id} className="grid grid-cols-[32px_1fr_auto] items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mira-bg text-mira-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-mira-text">{need.label}</p>
                    {done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-mira-success" />}
                  </div>
                  <Progress value={value} color={need.color} />
                  <p className="mt-1 truncate text-[10px] text-mira-muted">{need.why}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-mira-text">{need.count}/{need.goal}</p>
                  <p className="text-[10px] text-mira-muted">{need.unit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </details>

    </div>
  );
}
