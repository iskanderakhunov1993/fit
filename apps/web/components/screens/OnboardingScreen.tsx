"use client";

import { useState, useMemo } from "react";
import { Check, ChevronRight, Shield, Lock, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MiraLogo } from "@/components/ui/MiraLogo";
import { saveProfile, getCyclePhase, getPhaseLabel } from "@/lib/store";
import { getAgeConfig, getAgeGroup } from "@/lib/ageMode";
import type { MiraLocalData, UserProfile, TrackingCategory, CyclePhase } from "@/lib/types";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative h-7 w-12 rounded-full transition ${on ? "bg-mira-primary" : "bg-mira-lavender"}`}>
      <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

const phaseColors: Record<CyclePhase, string> = {
  menstruation: "#E8A0B8",
  follicular: "#B8A5D8",
  ovulation: "#D4A0C8",
  luteal: "#D4CCE6",
};

const phaseData: { phase: CyclePhase; name: string; days: string; hormone: string; feeling: string; color: string }[] = [
  { phase: "menstruation", name: "Менструальная", days: "1–5 день", hormone: "Эстроген и прогестерон на минимуме", feeling: "Усталость, возможна боль, хочется отдыха", color: "border-[#E8A0B8] bg-[#F5E0EA]" },
  { phase: "follicular", name: "Фолликулярная", days: "6–13 день", hormone: "Эстроген растёт", feeling: "Энергия, мотивация, ясность мышления", color: "border-[#B8A5D8] bg-[#EDE8F5]" },
  { phase: "ovulation", name: "Овуляторная", days: "14–16 день", hormone: "Пик эстрогена", feeling: "Максимум энергии, уверенности, либидо", color: "border-[#D4A0C8] bg-[#F0E0F0]" },
  { phase: "luteal", name: "Лютеиновая", days: "17–28 день", hormone: "Прогестерон растёт, потом падает", feeling: "ПМС, тревога, тяга к сладкому, плохой сон", color: "border-[#D4CCE6] bg-[#EDE8F5]" },
];

const concerns = [
  { id: "pain", label: "Болезненные месячные", desc: "Спазмы, боль внизу живота", icon: "🔴" },
  { id: "pms", label: "ПМС", desc: "Раздражительность, тревога, тяга к еде", icon: "😤" },
  { id: "irregular", label: "Нерегулярный цикл", desc: "Задержки, разная длина", icon: "📅" },
  { id: "sleep", label: "Проблемы со сном", desc: "Бессонница, плохой сон", icon: "🌙" },
  { id: "energy", label: "Нет энергии", desc: "Усталость, упадок сил", icon: "⚡" },
  { id: "doctor", label: "Подготовка к врачу", desc: "Хочу прийти с фактами", icon: "🩺" },
];

const phaseInsights: Record<CyclePhase, { title: string; body: string; tips: string[] }> = {
  menstruation: {
    title: "Сейчас менструальная фаза",
    body: "Энергия может быть ниже. Тело обновляется, и сейчас особенно важна мягкая забота.",
    tips: ["Тёплая еда и питьё", "Продукты с железом: гречка, шпинат", "Лёгкая прогулка или растяжка", "Больше отдыха — ты заслуживаешь"],
  },
  follicular: {
    title: "Сейчас фолликулярная фаза",
    body: "Эстроген растёт. Ты можешь чувствовать прилив сил и мотивации. Хорошее время для активности.",
    tips: ["Силовая тренировка или бег, если есть силы", "Белок и сложные углеводы", "Время для новых начинаний", "Отслеживай, как это проявляется у тебя"],
  },
  ovulation: {
    title: "Сейчас овуляторная фаза",
    body: "У многих в эти дни больше энергии и уверенности. Сравним с твоими отметками и поймём, как это у тебя.",
    tips: ["Более активная тренировка, если есть силы", "Социальная активность", "Антиоксиданты: ягоды, орехи", "Отметь настроение и энергию"],
  },
  luteal: {
    title: "Сейчас лютеиновая фаза",
    body: "Во второй половине цикла могут появиться ПМС-сигналы: раздражительность, тяга к сладкому, плохой сон. Дневник поможет увидеть твой паттерн.",
    tips: ["Бананы, шоколад, орехи как мягкая поддержка", "Ранний сон и меньше кофеина вечером", "Лёгкая активность или йога", "Будь мягче к себе"],
  },
};

type Props = {
  data: MiraLocalData;
  persist: (data: MiraLocalData) => void;
  onComplete: () => void;
};

export function OnboardingScreen({ data, persist, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [periodStart, setPeriodStart] = useState("");
  const [prevPeriodStart, setPrevPeriodStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [privateMarks, setPrivateMarks] = useState(true);
  const [hiddenNotifications, setHiddenNotifications] = useState(false);

  const ageConfig = getAgeConfig(age);
  const totalSteps = 4;

  function next() { setDir(1); setStep(s => Math.min(s + 1, totalSteps - 1)); }
  function back() { setDir(-1); setStep(s => Math.max(s - 1, 0)); }

  const currentPhase = useMemo(() => {
    if (!periodStart) return "follicular" as CyclePhase;
    const start = new Date(periodStart);
    const today = new Date();
    const days = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86_400_000));
    const cycleDay = (days % cycleLength) + 1;
    return getCyclePhase(cycleDay, periodLength, cycleLength);
  }, [periodStart, cycleLength, periodLength]);

  const currentCycleDay = useMemo(() => {
    if (!periodStart) return 14;
    const start = new Date(periodStart);
    const today = new Date();
    const days = Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86_400_000));
    return (days % cycleLength) + 1;
  }, [periodStart, cycleLength]);

  function toggleConcern(id: string) {
    setSelectedConcerns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function finish() {
    const trackingPrefs: TrackingCategory[] = ["cycle", "pain", "mood", "energy", "sleep"];
    if (selectedConcerns.includes("doctor")) trackingPrefs.push("nutrition");
    if (selectedConcerns.includes("pain")) trackingPrefs.push("intimacy");

    const anchorStart = periodStart || new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10);
    // Засеваем историю стартов: предыдущие месячные (если указаны) + последние.
    // Так движок нормы получает 2 точки и считает реальную длину с первого дня.
    const seededStarts = [prevPeriodStart, anchorStart].filter(Boolean).sort();

    const profile: UserProfile = {
      name: name.trim() || "Mira",
      age,
      showCalories: false,
      cycleConfig: {
        periodStart: anchorStart,
        cycleLength,
        periodLength,
        periodStarts: seededStarts,
      },
      trackingPreferences: trackingPrefs,
      additionalMode: "none",
      pinEnabled: false,
      hiddenNotifications,
      privateMarks,
    };
    persist({ ...saveProfile(data, profile), onboardingCompleted: true });
    onComplete();
  }

  const isWelcome = step === 0;
  const isAgeStep = step === 1;
  const isPhaseEducation = false;
  const isResult = step === totalSteps - 1;

  const bgStyle = isWelcome
    ? { background: "linear-gradient(145deg, #D8CCF0 0%, #C4B0E8 20%, #B8A0E0 40%, #A890D0 60%, #9880C8 80%, #8870B8 100%)" }
    : isResult
      ? { background: `linear-gradient(165deg, ${phaseColors[currentPhase]}30 0%, #F8F5FE 50%, #F8F5FE 100%)` }
      : (isPhaseEducation || isAgeStep)
        ? { background: "linear-gradient(165deg, #F8F5FE 0%, #EDE8F5 100%)" }
        : undefined;

  const phaseInsight = phaseInsights[currentPhase];

  function renderStep() {
    switch (step) {
      // ── 0. Welcome ──
      case 0:
        return (
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
              className="animate-float"
            >
              <MiraLogo size={110} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-5xl font-bold tracking-tight text-white drop-shadow-lg"
            >
              Mira
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-3 text-base text-white/80">Mira объяснит, что происходит с телом сегодня.</motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
              className="mt-1 text-sm text-white/50">Коротко настроим цикл и покажем, что делать дальше.</motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="mt-10 w-full space-y-3">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Как тебя зовут?"
                className="w-full rounded-2xl border border-white/25 bg-white/15 px-5 py-4 text-sm text-white placeholder:text-white/50 backdrop-blur-md focus:border-white/50 focus:bg-white/20 focus:outline-none transition-all duration-200 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]" />
              <div className="grid grid-cols-3 gap-2 text-left">
                {["Сегодня", "Состояние", "Подсказки"].map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                    <span className="text-xs font-bold text-white/60">{index + 1}</span>
                    <p className="mt-1 text-xs font-bold text-white">{item}</p>
                  </div>
                ))}
              </div>
              <button onClick={next}
                className="w-full rounded-2xl bg-white/20 py-4 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30 hover:shadow-[0_8px_32px_rgba(255,255,255,0.1)] active:scale-[0.97] border border-white/10">
                Начать настройку <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>
            </motion.div>
          </div>
        );

      // ── 1. Basic profile ──
      case 1:
        return (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-mira-text text-center">Пара данных о тебе</h2>
            <p className="mt-1 text-xs text-mira-muted text-center">Так Mira подстроит советы под возраст и цикл</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { range: "10–14", value: 13, emoji: "🌸", label: "Только начинаю" },
                { range: "15–17", value: 16, emoji: "🌷", label: "Подросток" },
                { range: "18–24", value: 21, emoji: "🌹", label: "Молодая" },
                { range: "25–34", value: 28, emoji: "🌺", label: "Активная" },
                { range: "35–44", value: 38, emoji: "🌻", label: "Зрелая" },
                { range: "45+", value: 48, emoji: "🌼", label: "Мудрая" },
              ].map(opt => (
                <button key={opt.range} onClick={() => { setAge(opt.value); }}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition active:scale-[0.97] ${
                    age === opt.value ? "border-mira-primary bg-mira-lavender-light" : "border-mira-lavender/20"
                  }`}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-sm font-bold ${age === opt.value ? "text-mira-primary" : "text-mira-text"}`}>{opt.range}</span>
                  <span className="text-[10px] text-mira-muted">{opt.label}</span>
                </button>
              ))}
            </div>

            {age && age < 18 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl border border-mira-success/20 bg-[#E0F5E8]/40 p-3">
                <p className="text-xs text-mira-success">Мы сделаем приложение простым и понятным. Без лишнего — только то, что тебе нужно.</p>
              </motion.div>
            )}

            {age && age >= 45 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-2xl border border-mira-primary/15 bg-mira-lavender-light/30 p-3">
                <p className="text-xs text-mira-primary">Добавим чекап 45+, гормоны, изменения цикла и вопросы врачу.</p>
              </motion.div>
            )}

            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={back}>Назад</Button>
              <Button className="flex-1" onClick={next} disabled={!age}>Далее</Button>
            </div>
          </Card>
        );

      // ── 2. Cycle setup ──
      case 2:
        return (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-mira-text">Определим твою фазу</h2>
            <p className="mt-1 text-xs text-mira-muted">По этим данным мы сразу покажем, что происходит сейчас</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-4">
                <label className="text-xs font-semibold text-mira-text">Когда начались последние месячные?</label>
                <input type="date" value={periodStart} onChange={e => setPeriodStart(e.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-mira-text focus:outline-none" />
              </div>

              <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-4">
                <label className="text-xs font-semibold text-mira-text">А до этих — когда начинались? <span className="font-normal text-mira-muted">(необязательно)</span></label>
                <p className="text-[10px] text-mira-muted mt-0.5">Поможет посчитать твою норму сразу, без ожидания</p>
                <input type="date" value={prevPeriodStart} onChange={e => setPrevPeriodStart(e.target.value)}
                  className="mt-2 w-full bg-transparent text-sm font-semibold text-mira-text focus:outline-none" />
              </div>

              <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-4">
                <label className="text-xs font-semibold text-mira-text">Сколько дней длятся месячные?</label>
                <div className="mt-2 flex gap-1.5">
                  {[3, 4, 5, 6, 7].map(d => (
                    <button key={d} onClick={() => setPeriodLength(d)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                        periodLength === d ? "bg-mira-primary text-white shadow-glow" : "bg-mira-lavender-light text-mira-muted"
                      }`}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-4">
                <label className="text-xs font-semibold text-mira-text">Обычная длина цикла</label>
                <p className="text-[10px] text-mira-muted mt-0.5">Не знаешь точно? Оставь 28 — мы уточним</p>
                <div className="mt-2 flex gap-1.5">
                  {[25, 26, 27, 28, 30, 32, 35].map(d => (
                    <button key={d} onClick={() => setCycleLength(d)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition ${
                        cycleLength === d ? "bg-mira-primary text-white shadow-glow" : "bg-mira-lavender-light text-mira-muted"
                      }`}>{d}</button>
                  ))}
                </div>
              </div>

              {/* Live phase preview */}
              {periodStart && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-2 border-mira-primary/20 bg-mira-lavender-light/50 p-4 text-center"
                >
                  <p className="text-xs text-mira-muted">Ты сейчас на</p>
                  <p className="text-2xl font-bold text-mira-text">{currentCycleDay} дне цикла</p>
                  <p className="text-sm font-semibold text-mira-primary">{getPhaseLabel(currentPhase)} фаза</p>
                </motion.div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={back}>Назад</Button>
              <Button className="flex-1" onClick={next}>Далее</Button>
            </div>
          </Card>
        );

      // ── 3. Final education ──
      case 3:
        return (
          <Card className="p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-mira-lavender-light text-mira-primary">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-mira-text">{name ? `${name}, Mira готова` : "Mira готова"}</h2>
              <p className="mt-1 text-sm leading-relaxed text-mira-muted">На главной будет короткое обучение: что смотреть сначала и что нажимать.</p>
            </div>

            <div className="mt-5 space-y-3">
              <Card className="p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={{ background: `${phaseColors[currentPhase]}30` }}>
                    <span className="text-lg font-bold" style={{ color: phaseColors[currentPhase] }}>{currentCycleDay}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-mira-text">День {currentCycleDay}, {getPhaseLabel(currentPhase).toLowerCase()} фаза</p>
                    <p className="text-xs text-mira-muted">{phaseInsight.body.split(".")[0]}.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 text-left border-mira-primary/10 bg-mira-lavender-light/30">
                <p className="text-xs font-semibold text-mira-primary">Что делать на главной</p>
                <ol className="mt-2 space-y-2 text-xs text-mira-muted">
                  <li><span className="font-bold text-mira-text">1.</span> Посмотри день цикла и прогноз.</li>
                  <li><span className="font-bold text-mira-text">2.</span> Нажми «Отметить состояние».</li>
                  <li><span className="font-bold text-mira-text">3.</span> Если плохо — нажми «Мне плохо».</li>
                </ol>
              </Card>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={back}>Назад</Button>
              <Button className="w-full" size="lg" onClick={finish}>
                Перейти на главную <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
    }
  }

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center px-4 py-8 transition-colors duration-500 ${!isWelcome && !isPhaseEducation && !isResult ? "bg-mira-bg" : ""}`}
      style={bgStyle}
    >
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === step ? 24 : 8 }}
            className={`h-2 rounded-full ${
              isWelcome ? (i === step ? "bg-white" : "bg-white/30")
                : i === step ? "bg-mira-primary" : "bg-mira-lavender"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
