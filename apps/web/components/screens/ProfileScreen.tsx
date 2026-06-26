"use client";

import { useState } from "react";
import {
  UserRound, Calendar, Shield, Download, Trash2,
  ChevronRight, Lock, Bell, Heart, Users, Database, Eye, Moon,
} from "lucide-react";
import { madhabs, type Madhab } from "@/lib/islamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveProfile, clearData } from "@/lib/store";
import type { ScreenProps } from "./types";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative h-7 w-12 rounded-full transition ${on ? "bg-mira-primary" : "bg-mira-lavender"}`}>
      <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export function ProfileScreen({ data, persist }: ScreenProps) {
  const profile = data.profile;
  const [section, setSection] = useState<string | null>(null);

  if (!profile) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Профиль</h1>
        <Card className="p-6">
          <p className="text-sm text-mira-muted">Пройди онбординг чтобы настроить профиль</p>
        </Card>
      </div>
    );
  }

  const menuItems = [
    { icon: UserRound, label: "Мои данные", desc: "Имя", id: "data" },
    { icon: Calendar, label: "Настройки цикла", desc: `${profile.cycleConfig.cycleLength} дн., период ${profile.cycleConfig.periodLength} дн.`, id: "cycle" },
    { icon: Shield, label: "Приватность", desc: "Уведомления, отметки", id: "privacy" },
    { icon: Moon, label: "Режим мусульманки", desc: profile.additionalMode === "islam" ? `${madhabs[profile.madhab ?? "hanafi"].name} · активен` : "Не активен", id: "islamic" },
    { icon: Users, label: "Режим партнёра", desc: "Поделись фазой цикла", id: "partner" },
    { icon: Database, label: "Мои данные", desc: "Что храним и где", id: "mydata" },
    { icon: Download, label: "Экспорт данных", desc: "Скачать свои данные", id: "export" },
  ];

  if (section === "islamic") {
    const currentMadhab = profile.madhab ?? "hanafi";
    const isActive = profile.additionalMode === "islam";
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Режим мусульманки</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-mira-primary" />
              <div>
                <p className="text-sm font-bold text-mira-text">Исламский режим</p>
                <p className="text-xs text-mira-muted">Хайд, истихада, каза, дуа</p>
              </div>
            </div>
            <Toggle on={isActive} onToggle={() => {
              persist(saveProfile(data, { ...profile, additionalMode: isActive ? "none" : "islam" }));
            }} />
          </div>

          {isActive && (
            <>
              <p className="text-sm font-semibold text-mira-text mb-3">Выбери мазхаб</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(["hanafi", "shafii", "maliki", "hanbali"] as Madhab[]).map(m => (
                  <button key={m} onClick={() => persist(saveProfile(data, { ...profile, madhab: m }))}
                    className={`rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.97] ${
                      currentMadhab === m ? "border-mira-primary bg-mira-lavender-light" : "border-mira-lavender/20"
                    }`}>
                    <p className={`text-sm font-semibold ${currentMadhab === m ? "text-mira-primary" : "text-mira-text"}`}>
                      {madhabs[m].name}
                    </p>
                    <p className="text-[10px] text-mira-muted">{madhabs[m].nameAr}</p>
                    <p className="mt-1 text-[10px] text-mira-muted">Хайд: {madhabs[m].haydMin}–{madhabs[m].haydMax} дн.</p>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-mira-success/15 bg-[#E0F5E8]/30 p-3">
                <p className="text-xs text-mira-success">Приложение не является источником фетв. В спорных вопросах обращайся к знающему учёному.</p>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  }

  if (section === "partner") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Режим партнёра</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mira-lavender-light">
              <Users className="h-6 w-6 text-mira-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-mira-text">Покажи партнёру, что происходит</p>
              <p className="text-xs text-mira-muted">Без интимных деталей — только фаза и советы</p>
            </div>
          </div>
          <p className="text-sm text-mira-muted mb-4">
            Партнёр увидит: текущую фазу цикла, что это значит для настроения и энергии, и что лучше делать / не делать. Никаких личных данных, симптомов или деталей.
          </p>
          <Button className="w-full" onClick={() => {
            const url = `${window.location.origin}/partner`;
            if (navigator.share) {
              navigator.share({ title: "Моя Норма — Режим партнёра", url }).catch(() => {});
            } else {
              navigator.clipboard.writeText(url).catch(() => {});
              alert("Ссылка скопирована!");
            }
          }}>
            <Users className="h-4 w-4" /> Поделиться ссылкой
          </Button>
          <div className="mt-4 rounded-2xl border border-mira-success/15 bg-[#E0F5E8]/30 p-3">
            <p className="text-xs text-mira-success">Партнёр должен открыть ссылку на том же устройстве. Данные не передаются на сервер.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (section === "mydata") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Мои данные</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-mira-success/20 bg-[#E0F5E8]/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-mira-success" />
                <p className="text-sm font-bold text-mira-success">Только на твоём устройстве</p>
              </div>
              <p className="text-xs text-mira-muted">Мы не собираем, не передаём и не продаём твои данные. Нет аккаунта, нет сервера, нет рекламных трекеров.</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-mira-text">Что мы храним</p>
              {[
                { label: "Профиль", desc: "Имя, настройки цикла" },
                { label: "Ежедневные отметки", desc: "Боль, настроение, сон, энергия, ПМС" },
                { label: "Водный баланс", desc: "Стаканы воды по дням" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl bg-mira-bg p-3">
                  <Eye className="h-4 w-4 text-mira-muted shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-mira-text">{item.label}</p>
                    <p className="text-[11px] text-mira-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-mira-text">Зачем мы это используем</p>
              <p className="text-xs text-mira-muted">Только для расчёта твоей личной нормы, прогнозов и аналитики. Ничего не покидает устройство.</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-mira-text">Как удалить</p>
              <p className="text-xs text-mira-muted">Профиль → «Удалить данные» — безвозвратно удаляет всё. Или очисти localStorage браузера.</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-mira-text">Как экспортировать</p>
              <p className="text-xs text-mira-muted">Профиль → «Экспорт данных» — скачивает JSON-файл со всеми твоими записями.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (section === "export") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Экспорт данных</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <p className="mb-4 text-sm text-mira-muted">Скачай свои данные в формате JSON. Файл содержит все записи, профиль и настройки.</p>
          <Button className="w-full" onClick={() => {
            const exported = { ...data, exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `moya-norma-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-4 w-4" /> Скачать JSON
          </Button>
          <p className="mt-4 text-xs text-mira-muted">Данные сохраняются только на твоём устройстве. Экспорт создаёт копию для резервного хранения.</p>
        </Card>
      </div>
    );
  }

  if (section === "data") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Мои данные</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
            <label className="text-xs text-mira-muted">Имя</label>
            <input type="text" value={profile.name}
              onChange={e => persist(saveProfile(data, { ...profile, name: e.target.value }))}
              className="mt-1 w-full bg-transparent text-sm font-semibold text-mira-text focus:outline-none" />
          </div>
        </Card>
      </div>
    );
  }

  if (section === "cycle") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Настройки цикла</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <div className="space-y-3">
            <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
              <label className="text-xs text-mira-muted">Дата последних месячных</label>
              <input type="date" value={profile.cycleConfig.periodStart}
                onChange={e => persist(saveProfile(data, { ...profile, cycleConfig: { ...profile.cycleConfig, periodStart: e.target.value } }))}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-mira-text focus:outline-none" />
            </div>
            <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
              <label className="text-xs text-mira-muted">Длина цикла (дни)</label>
              <input type="number" min={20} max={45} value={profile.cycleConfig.cycleLength}
                onChange={e => persist(saveProfile(data, { ...profile, cycleConfig: { ...profile.cycleConfig, cycleLength: +e.target.value } }))}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-mira-text focus:outline-none" />
            </div>
            <div className="rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
              <label className="text-xs text-mira-muted">Длительность месячных (дни)</label>
              <input type="number" min={2} max={10} value={profile.cycleConfig.periodLength}
                onChange={e => persist(saveProfile(data, { ...profile, cycleConfig: { ...profile.cycleConfig, periodLength: +e.target.value } }))}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-mira-text focus:outline-none" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (section === "privacy") {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-mira-text">Приватность</h1>
        <button onClick={() => setSection(null)} className="mb-4 text-sm text-mira-muted hover:text-mira-primary transition">← Назад</button>
        <Card className="max-w-lg p-6">
          <div className="space-y-4">
            {[
              { icon: Bell, label: "Скрытые уведомления", desc: "Без деталей на экране блокировки", key: "hiddenNotifications" as const },
              { icon: Heart, label: "Приватные отметки", desc: "Интимность скрыта по умолчанию", key: "privateMarks" as const },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-mira-lavender/20 bg-mira-bg p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mira-lavender-light text-mira-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-mira-text">{item.label}</p>
                  <p className="text-xs text-mira-muted">{item.desc}</p>
                </div>
                <Toggle on={!!profile[item.key]} onToggle={() => {
                  persist(saveProfile(data, { ...profile, [item.key]: !profile[item.key] }));
                }} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-mira-success/15 bg-[#E0F5E8]/30 p-3">
            <p className="text-xs text-mira-success">Все данные хранятся только на твоём устройстве.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-mira-text">Профиль</h1>

      <Card className="max-w-lg p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-mira-rose-light to-mira-lavender-light text-2xl font-bold text-mira-primary">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-mira-text">{profile.name}</p>
            <p className="text-xs text-mira-muted">Моя Норма</p>
          </div>
        </div>

        <div className="space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-mira-bg"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mira-lavender-light text-mira-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-mira-text">{item.label}</p>
                <p className="text-xs text-mira-muted">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-mira-lavender" />
            </button>
          ))}

          <button
            onClick={() => { if (confirm("Удалить все данные? Это действие нельзя отменить.")) { clearData(); window.location.reload(); } }}
            className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-red-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-500">Удалить данные</p>
              <p className="text-xs text-mira-muted">Безвозвратно удалить всё</p>
            </div>
            <ChevronRight className="h-4 w-4 text-mira-lavender" />
          </button>
        </div>
      </Card>
    </div>
  );
}
