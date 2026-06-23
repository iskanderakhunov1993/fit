import {
  ArrowRight,
  CalendarDays,
  Droplets,
  Sparkles,
  Zap
} from "lucide-react";
import { CycleLegend, CycleWheel } from "../components/CycleWheel";

type TodayScreenProps = {
  readiness: number;
  insight: string;
  workoutMode: string;
  workoutDuration: number;
  userName: string;
  cycleDay: number;
  cycleLength: number;
  onCheckIn: () => void;
  onGenerate: () => void;
  onNutrition: () => void;
};

function getPhaseInsight(day: number): string {
  if (day <= 5) return "Ты в фазе менструации — Приоритет: мягкое восстановление, йога, лёгкое кардио. Тело просит отдыха.";
  if (day <= 13) return "Ты в фолликулярная фазе — Энергия растёт, тело готово к нагрузке. Отличное время для силовых и новых задач.";
  if (day <= 16) return "Ты в фазе овуляции — Пик энергии! Идеальное время для интенсивных тренировок и максимальной активности.";
  return "Ты в лютеиновой фазе — Энергия снижается. Приоритет: умеренная нагрузка и восстановление.";
}

function getDayOfWeek(): string {
  const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  return days[new Date().getDay()];
}

function getFormattedDate(): string {
  const months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]}`;
}

function getDaysUntilOvulation(currentDay: number): number {
  if (currentDay >= 14 && currentDay <= 16) return 0;
  if (currentDay < 14) return 14 - currentDay;
  return 28 - currentDay + 14;
}

function getDaysUntilPeriod(currentDay: number, cycleLength: number): number {
  return cycleLength - currentDay;
}

export function TodayScreen({
  readiness,
  insight,
  workoutMode,
  workoutDuration,
  userName,
  cycleDay,
  cycleLength,
  onCheckIn,
  onGenerate,
  onNutrition
}: TodayScreenProps) {
  const phaseInsight = getPhaseInsight(cycleDay);
  const daysToOvulation = getDaysUntilOvulation(cycleDay);
  const daysToPeriod = getDaysUntilPeriod(cycleDay, cycleLength);
  const sleepHours = 7.5;

  return (
    <div className="screen today-screen">
      <section className="today-header">
        <div>
          <p className="today-date">{getDayOfWeek()} · {getFormattedDate()}</p>
          <h1 className="today-greeting">Доброе утро, {userName || "Аня"}</h1>
        </div>
      </section>

      <section className="today-grid">
        {/* Cycle wheel card */}
        <article className="cycle-wheel-card">
          <div className="cycle-wheel-header">
            <h3>Твой цикл</h3>
            <span className="cycle-day-badge">День {cycleDay} из {cycleLength}</span>
          </div>
          <CycleWheel currentDay={cycleDay} cycleLength={cycleLength} size={260} />
          <CycleLegend currentDay={cycleDay} cycleLength={cycleLength} />
        </article>

        {/* Right column */}
        <div className="today-right">
          {/* AI Coach card */}
          <article className="ai-coach-card">
            <span className="coach-badge">
              <span className="coach-dot" /> ИИ-КОУЧ MIRA
            </span>
            <h2>Открываем твой день</h2>
            <p>{phaseInsight}</p>
            <div className="coach-actions">
              <button className="coach-button outline" onClick={onNutrition}>
                Поговорить с Mira
              </button>
              <button className="coach-button filled" onClick={onCheckIn}>
                Отметить день
              </button>
            </div>
          </article>

          {/* Movement + Recovery row */}
          <div className="today-cards-row">
            <article className="mini-card movement-card">
              <span className="mini-card-label">ДВИЖЕНИЕ</span>
              <strong className="mini-card-value">{workoutMode}</strong>
              <span className="mini-card-detail">Силовая · HIIT · бег</span>
              <button className="mini-card-button" onClick={onGenerate}>
                Открыть план
              </button>
            </article>

            <article className="mini-card recovery-card">
              <span className="mini-card-label">ВОССТАНОВЛЕНИЕ</span>
              <strong className="mini-card-value">
                {sleepHours} <small>ч сна</small>
              </strong>
              <div className="recovery-stats">
                <div className="recovery-stat">
                  <span>Гидратация</span>
                  <span>1,2 / 2 л</span>
                </div>
                <div className="recovery-stat">
                  <span>Энергия</span>
                  <span>{readiness}%</span>
                </div>
                <div className="recovery-bar">
                  <div className="recovery-bar-fill" style={{ width: `${readiness}%` }} />
                </div>
              </div>
            </article>
          </div>

          {/* Forecast card */}
          <article className="forecast-card">
            <span className="mini-card-label">ПРОГНОЗ</span>
            <div className="forecast-content">
              <div className="forecast-item">
                <strong>{daysToOvulation}</strong>
                <span>дн.</span>
                <small>до овуляции</small>
              </div>
              <div className="forecast-divider" />
              <div className="forecast-item">
                <strong>{daysToPeriod}</strong>
                <span>дн.</span>
                <small>до месячных</small>
              </div>
              <button className="forecast-calendar-btn">
                Календарь <ArrowRight size={15} />
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
