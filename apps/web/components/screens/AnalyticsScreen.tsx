"use client";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Lock,
  Moon,
  Plus,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRedFlags, getPhaseCorrelations } from "@/lib/alerts";
import { getCycleNorm } from "@/lib/cycleEngine";
import { getCycleAnalytics } from "@/lib/cycleAnalytics";
import { getCorrelations } from "@/lib/correlations";
import { dateKey } from "@/lib/store";
import type { ScreenProps } from "./types";

type Tone = "success" | "watch" | "alert" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "border-mira-success/15 bg-[#E0F5E8]/30",
  watch: "border-[#C4B07E]/20 bg-[#F5F0E0]/45",
  alert: "border-mira-cycle/20 bg-[#F8E8EE]/50",
  neutral: "border-mira-lavender/20 bg-white",
};

function Progress({ value, color = "bg-mira-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-mira-lavender-light">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-3 px-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">{label}</p>
      <p className="text-sm font-bold text-mira-text">{title}</p>
    </div>
  );
}

function TrendCard({ icon, title, body, tone = "neutral" }: { icon: React.ReactNode; title: string; body: string; tone?: Tone }) {
  return (
    <Card className={`p-4 ${toneClass[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70 text-mira-primary">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-snug text-mira-text">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-mira-muted">{body}</p>
        </div>
      </div>
    </Card>
  );
}

function CycleCard({ label, date, length, pain, pms, energy, flow }: { label: string; date: string; length: number; pain: number; pms: number; energy: number; flow: number }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-mira-text">{label}</p>
          <p className="mt-0.5 text-[10px] text-mira-muted">
            старт {new Date(`${date}T00:00:00`).toLocaleDateString("ru-RU", { day: "2-digit", month: "short" })}
          </p>
        </div>
        <span className="rounded-full bg-mira-bg px-2 py-1 text-[10px] font-bold text-mira-muted">{length} дн.</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Mini label="Боль" value={`${pain}`} />
        <Mini label="ПМС" value={`${pms}`} />
        <Mini label="Энергия ↓" value={`${energy}`} />
        <Mini label="Обильно" value={`${flow}`} />
      </div>
    </Card>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-mira-bg px-3 py-2">
      <p className="text-[10px] font-semibold text-mira-muted">{label}</p>
      <p className="mt-0.5 text-base font-black text-mira-text">{value}</p>
    </div>
  );
}

function SymptomRow({ label, count, goal }: { label: string; count: number; goal: number }) {
  const value = Math.min(100, Math.round((count / Math.max(goal, 1)) * 100));
  return (
    <div className="rounded-2xl bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-mira-text">{label}</p>
        <p className="text-[10px] font-bold text-mira-muted">{count} отметок</p>
      </div>
      <Progress value={value} color={count > 0 ? "bg-mira-primary" : "bg-mira-lavender"} />
    </div>
  );
}

export function AnalyticsScreen({ data, navigate, onCheckIn }: ScreenProps) {
  const profile = data.profile;
  const today = data.checkIns[dateKey()];
  const checkIns = Object.values(data.checkIns);
  const totalDays = checkIns.length;
  const norm = getCycleNorm(profile);
  const cycleAnalytics = getCycleAnalytics(data);
  const redFlags = getRedFlags(data);
  const correlations = getCorrelations(data);
  const phaseCorrelations = getPhaseCorrelations(data);

  const painEntries = checkIns.filter(c => c.pain && c.pain.kinds.some(k => k !== "none"));
  const strongPainEntries = painEntries.filter(c => c.pain?.level === "strong");
  const sleepEntries = checkIns.filter(c => c.sleep);
  const energyEntries = checkIns.filter(c => c.energy);
  const lowEnergyEntries = energyEntries.filter(c => c.energy?.value === "low" || c.energy?.value === "exhausted");
  const moodEntries = checkIns.filter(c => c.mood);
  const pmsEntries = checkIns.filter(c => c.pms && c.pms.symptoms.length > 0);
  const periodEntries = checkIns.filter(c => c.period);
  const heavyFlowEntries = periodEntries.filter(c => c.period?.intensity === "heavy" || c.period?.intensity === "very_heavy");
  const symptomLogEntries = checkIns.filter(c => c.symptomLog);

  const confidence = norm.confidence === "high" ? 86 : norm.confidence === "medium" ? 68 : Math.max(18, Math.min(62, totalDays * 7 + norm.observedCycles * 12));
  const needed = Math.max(0, 7 - totalDays);
  const mainTone: Tone = redFlags.length > 0 ? "alert" : totalDays < 7 ? "watch" : cycleAnalytics?.doctorNote ? "alert" : "success";
  const mainTitle = redFlags.length > 0
    ? redFlags[0].title
    : cycleAnalytics?.headline ?? (totalDays < 7 ? "Данных пока мало" : "Mira ищет повторяющиеся паттерны");
  const mainBody = redFlags.length > 0
    ? redFlags[0].body
    : cycleAnalytics?.insight ?? `Ещё ${needed} отметок — и Mira сможет точнее найти первый паттерн по циклу, боли, энергии и настроению.`;

  const cycles = cycleAnalytics?.cycles ?? [];
  const connectionCards = [
    ...correlations.slice(0, 3).map(item => ({
      title: item.title,
      body: item.body,
      tone: item.strength === "strong" ? "success" as Tone : "watch" as Tone,
    })),
    ...phaseCorrelations.slice(0, 2).map(item => ({
      title: `${item.symptom}: ${item.phase}`,
      body: item.explanation,
      tone: "watch" as Tone,
    })),
  ].slice(0, 4);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-mira-text">Аналитика</h1>
        <p className="mt-1 text-sm leading-relaxed text-mira-muted">
          Здесь Mira ищет закономерности по циклу, боли, энергии, настроению, сну и симптомам.
        </p>
      </div>

      <Card className={`mb-5 p-5 ${toneClass[mainTone]}`}>
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/70 text-mira-primary">
            {mainTone === "alert" ? <AlertCircle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-mira-muted">Mira заметила</p>
            <p className="mt-1 text-lg font-bold leading-snug text-mira-text">{mainTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-mira-muted">{mainBody}</p>
          </div>
        </div>
        {(redFlags.length > 0 || cycleAnalytics?.doctorNote) && (
          <Button className="w-full" variant="outline" onClick={() => navigate("report")}>
            <FileText className="h-4 w-4" /> В отчёт врачу
          </Button>
        )}
      </Card>

      <SectionTitle label="Качество данных" title="Насколько Mira понимает твой цикл" />
      <Card className="mb-5 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-mira-text">{confidence}% уверенности</p>
            <p className="mt-1 text-xs leading-relaxed text-mira-muted">
              {needed > 0 ? `Ещё ${needed} отметок — и вывод станет точнее.` : "Данных достаточно для первых личных наблюдений."}
            </p>
          </div>
          <span className="rounded-full bg-mira-lavender-light px-3 py-1 text-xs font-bold text-mira-primary">{totalDays} дн.</span>
        </div>
        <Progress value={confidence} />
      </Card>

      <SectionTitle label="Циклы" title="Сравнение последних циклов" />
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {cycles.length > 0 ? cycles.map((cycle) => (
          <CycleCard
            key={cycle.start}
            label={cycle.label}
            date={cycle.start}
            length={cycle.length}
            pain={cycle.strongPainDays || cycle.painDays}
            pms={cycle.pmsDays}
            energy={cycle.lowEnergyDays}
            flow={cycle.heavyFlowDays}
          />
        )) : (
          <TrendCard icon={<CalendarDays className="h-4 w-4" />} title="Mira ждёт историю циклов" body="Отметь старт месячных хотя бы в 2 циклах, чтобы сравнение стало личным." />
        )}
      </div>

      <SectionTitle label="Симптомы" title="Что повторяется чаще всего" />
      <div className="mb-5 space-y-2 rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
        <SymptomRow label="Боль" count={painEntries.length} goal={3} />
        <SymptomRow label="Сильная боль" count={strongPainEntries.length} goal={2} />
        <SymptomRow label="ПМС" count={pmsEntries.length} goal={3} />
        <SymptomRow label="Низкая энергия" count={lowEnergyEntries.length} goal={3} />
        <SymptomRow label="Лог симптомов" count={symptomLogEntries.length} goal={6} />
      </div>

      <SectionTitle label="Связи" title="Возможные связи" />
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        {connectionCards.length > 0 ? connectionCards.map(item => (
          <TrendCard key={item.title} icon={<TrendingUp className="h-4 w-4" />} title={item.title} body={item.body} tone={item.tone} />
        )) : (
          <>
            <TrendCard icon={<Moon className="h-4 w-4" />} title="Сон → энергия" body="Появится после нескольких отметок сна и энергии." />
            <TrendCard icon={<HeartPulse className="h-4 w-4" />} title="ПМС → настроение" body="Mira покажет, за сколько дней обычно меняется эмоциональный фон." />
            <TrendCard icon={<Zap className="h-4 w-4" />} title="Обильность → усталость" body="Если обильные месячные связаны со слабостью, это попадёт в отчёт врачу." />
            <TrendCard icon={<TrendingUp className="h-4 w-4" />} title="Боль → активность" body="Можно будет понять, в какие дни лучше снижать нагрузку." />
          </>
        )}
      </div>

      {(redFlags.length > 0 || cycleAnalytics?.doctorNote) && (
        <>
          <SectionTitle label="Врач" title="Это стоит обсудить с врачом" />
          <Card className="mb-5 border-mira-cycle/20 bg-[#F8E8EE]/45 p-4">
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70 text-mira-cycle">
                <Shield className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-mira-text">{redFlags[0]?.title ?? "Паттерн для обсуждения"}</p>
                <p className="mt-1 text-xs leading-relaxed text-mira-muted">
                  {cycleAnalytics?.doctorNote ?? redFlags[0]?.body}
                </p>
              </div>
            </div>
            <Button className="w-full" variant="outline" onClick={() => navigate("report")}>
              <FileText className="h-4 w-4" /> Сформировать отчёт врачу
            </Button>
          </Card>
        </>
      )}

      <SectionTitle label="Дальше" title="Что сделать сейчас" />
      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <TrendCard
          icon={today ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          title={today ? "Сегодня уже есть отметка" : "Отметь сегодняшнее состояние"}
          body={today ? "Если хочешь точнее: добавь сон, энергию, настроение или ПМС." : "Одна отметка помогает увидеть связь цикла, сна, энергии, боли и настроения."}
          tone={today ? "success" : "watch"}
        />
        <Card className="p-4">
          <div className="mb-3 flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mira-lavender-light text-mira-primary">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-mira-text">Интимные данные приватны</p>
              <p className="mt-1 text-xs leading-relaxed text-mira-muted">
                Секс, заметки и тревожные симптомы не показываются в отчёте без твоего выбора.
              </p>
            </div>
          </div>
          <Button className="w-full" variant="outline" onClick={() => navigate("report")}>
            <ArrowRight className="h-4 w-4" /> Перейти к отчёту
          </Button>
        </Card>
      </div>
    </div>
  );
}
