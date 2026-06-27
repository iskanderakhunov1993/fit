"use client";

import { ChevronRight, FileText, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getHealthSummary } from "@/lib/healthScore";
import { getNormMap, getNormOverallPercent } from "@/lib/insights";
import type { MiraLocalData } from "@/lib/types";

/*
 * Краткий прогресс личной нормы на главной: не медицинский вердикт, а ясный
 * индикатор того, насколько Mira уже понимает повторяющиеся паттерны.
 */

type Props = {
  data: MiraLocalData;
  onOpenAnalytics: () => void;
  onOpenReport: () => void;
  onCheckIn?: () => void;
};

export function NormaScanCard({ data, onOpenAnalytics, onOpenReport, onCheckIn }: Props) {
  const summary = getHealthSummary(data);
  const concerns = summary.metrics.filter((m) => m.status === "concern");
  const usefulMetrics = summary.metrics.filter((m) => m.status !== "nodata");
  const normPercent = getNormOverallPercent(data);
  const normMap = getNormMap(data).slice().sort((a, b) => a.percent - b.percent);
  const nextMetric = normMap[0];
  const checkInCount = Object.keys(data.checkIns).length;
  const firstInsightTarget = 7;
  const remainingToFirstInsight = Math.max(0, firstInsightTarget - checkInCount);
  const hasFirstInsights = remainingToFirstInsight === 0 && usefulMetrics.length >= 2;
  const progressPercent = remainingToFirstInsight > 0
    ? Math.min(100, Math.round((checkInCount / firstInsightTarget) * 100))
    : normPercent;

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const filled = (progressPercent / 100) * circumference;

  const normLabel =
    normPercent >= 85
      ? "Норма стабильная"
      : normPercent >= 55
        ? "Норма уточняется"
        : normPercent >= 20
          ? "Первые паттерны"
          : "Только начинаем";

  const heroTitle = concerns.length > 0
    ? "Есть сигнал для внимания"
    : hasFirstInsights
      ? "Сегодня можно сравнить с твоим ритмом"
      : "Mira только начинает узнавать твой ритм";

  const heroBody = hasFirstInsights
    ? "Личная норма помогает заметить, что для тебя обычно, а что выбивается из привычного ритма."
    : remainingToFirstInsight > 0
      ? `Личная норма нужна, чтобы советы были не общими, а про тебя. Ещё ${remainingToFirstInsight} отметок до первых наблюдений.`
      : "Mira уже собирает первые связи между циклом, самочувствием, сном и энергией.";

  const previewRows = hasFirstInsights
    ? usefulMetrics.slice(0, 3).map((metric) => ({
        key: metric.id,
        icon: metric.emoji,
        label: metric.label,
        title: metric.verdict,
        body: metric.detail,
      }))
    : [
        { key: "cycle", icon: "🔄", label: "Цикл", title: "Длина и фазы", body: "когда ждать месячные и задержки" },
        { key: "pain", icon: "🌸", label: "Боль", title: "Повторы", body: "в какие дни чаще появляется" },
        { key: "sleep", icon: "😴", label: "Сон", title: "Связи", body: "как влияет на энергию и настроение" },
      ];

  const nextStepText = concerns.length > 0
    ? `Стоит обсудить: ${concerns.map((c) => c.label.toLowerCase()).join(", ")}`
    : remainingToFirstInsight > 0
      ? `${checkInCount}/${firstInsightTarget} отметок собрано`
      : `Меньше всего данных: ${nextMetric?.label.toLowerCase() ?? "самочувствие"}`;

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <button onClick={onOpenAnalytics} className="min-w-0 flex-1 text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">Личная норма</p>
          <p className="text-sm font-bold leading-snug text-mira-text">{heroTitle}</p>
          <p className="mt-1 text-[11px] leading-snug text-mira-muted">{heroBody}</p>
        </button>

        <button onClick={onOpenAnalytics} className="relative h-16 w-16 shrink-0" aria-label="Открыть аналитику">
          <svg viewBox="0 0 64 64" className="h-full w-full">
            <circle cx="32" cy="32" r={radius} fill="none" stroke="#EDE8F5" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              stroke="#5BAE7E"
              strokeDasharray={`${filled} ${circumference - filled}`}
              strokeLinecap="round"
              strokeWidth="6"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black leading-none text-mira-text">{progressPercent}%</span>
            <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-mira-muted">данные</span>
          </div>
        </button>
      </div>

      <button
        onClick={onOpenAnalytics}
        className="w-full rounded-lg border border-mira-success/15 bg-[#E0F5E8]/20 p-3 text-left"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-mira-success">
            {hasFirstInsights ? "Что уже видно" : "Что будет сравниваться"}
          </p>
          <span className="shrink-0 rounded-lg bg-white/70 px-2 py-1 text-[10px] font-bold text-mira-success">
            {normLabel}
          </span>
        </div>

        <div className="space-y-2">
          {previewRows.map((row) => (
            <div key={row.key} className="grid grid-cols-[24px_68px_1fr] items-start gap-2">
              <span className="text-base leading-none">{row.icon}</span>
              <span className="text-[11px] font-bold leading-snug text-mira-text">{row.label}</span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold leading-snug text-mira-text">{row.title}</p>
                <p className="truncate text-[10px] leading-snug text-mira-muted">{row.body}</p>
              </div>
            </div>
          ))}
        </div>
      </button>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-mira-lavender/20 bg-mira-bg/60 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">Следующий шаг</p>
          <p className="truncate text-xs font-semibold text-mira-text">{nextStepText}</p>
        </div>
        {concerns.length > 0 ? (
          <button
            onClick={onOpenReport}
            className="ml-3 flex shrink-0 items-center gap-1 rounded-lg bg-mira-primary px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
          >
            <FileText className="h-3.5 w-3.5" /> Отчёт
          </button>
        ) : (
          <button
            onClick={onCheckIn ?? onOpenAnalytics}
            className="ml-3 flex shrink-0 items-center gap-1 rounded-lg bg-mira-primary px-3 py-1.5 text-xs font-semibold text-white transition active:scale-95"
          >
            {onCheckIn ? <Plus className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            {onCheckIn ? "Отметить" : "Подробнее"}
          </button>
        )}
      </div>
    </Card>
  );
}
