"use client";

import { useState, useRef } from "react";
import {
  Download, Share2, Printer, Shield,
  Calendar, Droplets, Activity, Brain, Moon,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDoctorScript } from "@/lib/alerts";
import { evaluateLab, getLabRange } from "@/lib/labs";
import { LabsSection } from "./LabsSection";
import type { ScreenProps } from "./types";

const periods = [
  { label: "1 цикл", months: 1 },
  { label: "3 месяца", months: 3 },
  { label: "6 месяцев", months: 6 },
  { label: "12 месяцев", months: 12 },
];

export function ReportScreen({ data, persist }: ScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(3);
  const [includeSex, setIncludeSex] = useState(false);
  const [generated, setGenerated] = useState(true); // показываем превью сразу
  const reportRef = useRef<HTMLDivElement>(null);

  const profile = data.profile;
  const cycleLength = profile?.cycleConfig.cycleLength ?? 28;
  const periodLength = profile?.cycleConfig.periodLength ?? 5;
  const checkIns = Object.values(data.checkIns);

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - selectedPeriod);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);
  const filteredCheckIns = checkIns.filter(c => c.date >= cutoffStr);
  const totalDays = filteredCheckIns.length;

  const painDays = filteredCheckIns.filter(c => c.pain && c.pain.kinds.some(k => k !== "none"));
  const strongPainDays = painDays.filter(c => c.pain?.level === "strong");
  const periodDays = filteredCheckIns.filter(c => c.period);
  const pmsDays = filteredCheckIns.filter(c => c.pms && c.pms.symptoms.length > 0);
  const badSleepDays = filteredCheckIns.filter(c => c.sleep?.quality === "bad" || c.sleep?.quality === "insomnia");

  const allPmsSymptoms = pmsDays.flatMap(c => c.pms!.symptoms);
  const pmsCountMap: Record<string, number> = {};
  for (const s of allPmsSymptoms) pmsCountMap[s] = (pmsCountMap[s] ?? 0) + 1;
  const topPms = Object.entries(pmsCountMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const questions: string[] = [];
  if (strongPainDays.length >= 2) questions.push("Может ли такая боль быть вариантом нормы?");
  if (cycleLength > 35 || cycleLength < 21) questions.push("Нужно ли проверить причины нерегулярного цикла?");
  if (periodLength > 7) questions.push("Может ли кровотечение такой длительности быть нормальным?");
  if (badSleepDays.length > totalDays * 0.3) questions.push("Может ли плохой сон быть связан с гормональными изменениями?");
  questions.push("Какие обследования стоит обсудить?");

  function handleExport() {
    const reportText = generateTextReport();
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moya-norma-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const reportText = generateTextReport();
    if (navigator.share) {
      navigator.share({ title: "Отчёт — Моя Норма", text: reportText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(reportText).catch(() => {});
    }
  }

  function generateTextReport(): string {
    const now = new Date().toLocaleDateString("ru-RU");
    const from = cutoffDate.toLocaleDateString("ru-RU");
    let report = `ОТЧЁТ О ЗДОРОВЬЕ — Моя Норма\n`;
    report += `Период: ${from} — ${now}\n`;
    report += `Дней с данными: ${totalDays}\n\n`;

    report += `ЦИКЛ\n`;
    report += `Средняя длина цикла: ${cycleLength} дней\n`;
    report += `Длительность месячных: ${periodLength} дней\n\n`;

    report += `БОЛЬ\n`;
    report += `Дней с болью: ${painDays.length}\n`;
    report += `Сильная боль: ${strongPainDays.length} дней\n\n`;

    if (topPms.length > 0) {
      report += `ЧАСТЫЕ СИМПТОМЫ\n`;
      for (const [sym, count] of topPms) {
        report += `— ${sym}: ${count} раз\n`;
      }
      report += "\n";
    }

    report += `СОН\n`;
    report += `Дней с плохим сном: ${badSleepDays.length}\n\n`;

    const labs = data.labs ?? [];
    if (labs.length > 0) {
      report += `АНАЛИЗЫ\n`;
      for (const lab of labs) {
        const r = getLabRange(lab.testId);
        const ev = evaluateLab(lab.testId, lab.value);
        const flag = ev && ev.status !== "ok" ? ` [${ev.label}]` : "";
        report += `— ${r?.name ?? lab.testId}: ${lab.value} ${lab.unit} (${lab.date})${flag}\n`;
      }
      report += "\n";
    }

    if (questions.length > 0) {
      report += `ВОПРОСЫ ВРАЧУ\n`;
      questions.forEach((q, i) => { report += `${i + 1}. ${q}\n`; });
      report += "\n";
    }

    report += `---\nОтчёт не является диагнозом и не заменяет консультацию врача.\nОн помогает структурировать наблюдения.\n`;
    return report;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mira-text">Отчёт врачу</h1>
        <p className="mt-1 text-sm text-mira-muted">Иди к врачу с фактами, а не по памяти</p>
      </div>

      {/* Контекстная подсказка */}
      <Card className="mb-4 p-4 border-mira-primary/10 bg-mira-lavender-light/20">
        <p className="text-sm text-mira-text">
          📅 Скоро к гинекологу? Покажи этот отчёт — врач увидит факты за несколько месяцев, а не по памяти.
        </p>
      </Card>

      {/* Period selector */}
      <Card className="mb-5 p-5">
        <p className="text-sm font-semibold text-mira-text mb-3">Период отчёта</p>
        <div className="flex gap-2">
          {periods.map(p => (
            <button key={p.months} onClick={() => setSelectedPeriod(p.months)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
                selectedPeriod === p.months ? "bg-mira-primary text-white shadow-glow" : "bg-mira-lavender-light text-mira-muted"
              }`}>{p.label}</button>
          ))}
        </div>

        {!includeSex && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
            <div>
              <p className="text-sm text-mira-text">Включить данные о сексе/контрацепции</p>
              <p className="text-[10px] text-mira-muted">По умолчанию скрыты</p>
            </div>
            <button onClick={() => setIncludeSex(true)} className="rounded-full border border-mira-lavender/30 px-3 py-1 text-xs font-semibold text-mira-muted transition hover:border-mira-primary/30">
              Включить
            </button>
          </div>
        )}
      </Card>

      {/* Анализы — рекомендации + ввод результатов */}
      <div className="mb-5 print:hidden">
        <LabsSection data={data} persist={persist} />
      </div>

      {/* Generated report */}
      {generated && (
        <div ref={reportRef} className="space-y-5 print:space-y-3">
          {/* Header */}
          <Card className="border-mira-primary/15 bg-mira-lavender-light/30 p-5 print:border-none print:shadow-none">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-mira-text">Отчёт о здоровье</h2>
                <p className="text-xs text-mira-muted">
                  {cutoffDate.toLocaleDateString("ru-RU")} — {new Date().toLocaleDateString("ru-RU")}
                </p>
              </div>
              <Badge>{totalDays} дней данных</Badge>
            </div>
          </Card>

          {/* Cycle */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-mira-primary" />
              <p className="text-sm font-semibold text-mira-text">Цикл</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-mira-bg p-3">
                <p className="text-xs text-mira-muted">Средняя длина цикла</p>
                <p className="text-xl font-bold text-mira-text">{cycleLength} дн.</p>
              </div>
              <div className="rounded-xl bg-mira-bg p-3">
                <p className="text-xs text-mira-muted">Длительность месячных</p>
                <p className="text-xl font-bold text-mira-text">{periodLength} дн.</p>
              </div>
            </div>
          </Card>

          {/* Pain */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-mira-cycle" />
              <p className="text-sm font-semibold text-mira-text">Боль</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-mira-bg p-3">
                <p className="text-xs text-mira-muted">Дней с болью</p>
                <p className="text-xl font-bold text-mira-text">{painDays.length}</p>
              </div>
              <div className="rounded-xl bg-mira-bg p-3">
                <p className="text-xs text-mira-muted">Сильная боль</p>
                <p className="text-xl font-bold text-mira-text">{strongPainDays.length}</p>
              </div>
            </div>
            {strongPainDays.length >= 2 && (
              <div className="mt-3 rounded-xl border border-mira-cycle/15 bg-mira-rose-light/20 p-3">
                <p className="text-xs text-mira-cycle">Сильная боль повторяется — стоит обсудить с врачом.</p>
              </div>
            )}
          </Card>

          {/* Symptoms */}
          {topPms.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-[#A07EC4]" />
                <p className="text-sm font-semibold text-mira-text">Частые симптомы</p>
              </div>
              <div className="space-y-2">
                {topPms.map(([sym, count]) => (
                  <div key={sym} className="flex items-center justify-between rounded-xl bg-mira-bg px-3 py-2">
                    <span className="text-sm text-mira-text">{sym}</span>
                    <span className="text-xs text-mira-muted">{count} раз</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sleep */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-4 w-4 text-[#7E8EC4]" />
              <p className="text-sm font-semibold text-mira-text">Сон</p>
            </div>
            <div className="rounded-xl bg-mira-bg p-3">
              <p className="text-xs text-mira-muted">Дней с плохим сном</p>
              <p className="text-xl font-bold text-mira-text">{badSleepDays.length}</p>
            </div>
          </Card>

          {/* Sex (if included) */}
          {includeSex && (
            <Card className="p-5">
              <p className="text-sm font-semibold text-mira-text mb-2">Секс и контрацепция</p>
              <p className="text-xs text-mira-muted">
                Дней с отметкой: {filteredCheckIns.filter(c => c.intimacy?.happened).length}
              </p>
            </Card>
          )}

          {/* Doctor questions */}
          <Card className="border-mira-primary/15 p-5">
            <p className="text-sm font-semibold text-mira-text mb-3">Вопросы врачу</p>
            <ol className="space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-mira-text">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mira-lavender-light text-[10px] font-bold text-mira-primary">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </Card>

          {/* Doctor visit script */}
          {(() => {
            const script = getDoctorScript(data);
            return (
              <Card className="border-mira-primary/15 bg-mira-lavender-light/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-mira-primary" />
                  <p className="text-sm font-semibold text-mira-text">Что сказать врачу</p>
                </div>
                <p className="text-xs text-mira-muted mb-3 italic">"{script.intro}"</p>
                {script.dataPoints.length > 0 && (
                  <div className="mb-3 rounded-xl bg-white p-3 space-y-1">
                    {script.dataPoints.map((dp, i) => (
                      <p key={i} className="text-xs text-mira-text">• {dp}</p>
                    ))}
                  </div>
                )}
                <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted mb-2">Спросить</p>
                <ol className="space-y-1.5">
                  {script.questions.map((q, i) => (
                    <li key={i} className="text-xs text-mira-text">
                      <span className="text-mira-primary font-bold mr-1">{i + 1}.</span>{q}
                    </li>
                  ))}
                </ol>
              </Card>
            );
          })()}

          {/* Disclaimer */}
          <Card className="border-mira-success/15 bg-[#E0F5E8]/20 p-4">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-mira-success" />
              <p className="text-xs text-mira-success">
                Отчёт не является диагнозом и не заменяет консультацию врача. Он помогает структурировать наблюдения.
              </p>
            </div>
          </Card>

          {/* Export buttons */}
          <div className="flex gap-3 print:hidden">
            <Button variant="outline" className="flex-1" onClick={handleExport}>
              <Download className="h-4 w-4" /> Скачать
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Поделиться
            </Button>
            <Button variant="outline" className="flex-1" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Печать
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
