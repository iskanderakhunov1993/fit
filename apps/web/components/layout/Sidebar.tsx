"use client";

import {
  Sun, ChartNoAxesCombined, HeartPulse, FileText, UserRound, Plus, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MiraLogo } from "@/components/ui/MiraLogo";
import type { NavPage } from "./types";

const baseItems: { id: NavPage; label: string; icon: typeof Sun }[] = [
  { id: "today", label: "Сегодня", icon: Sun },
  { id: "analytics", label: "Аналитика", icon: ChartNoAxesCombined },
  { id: "care", label: "Забота", icon: HeartPulse },
  { id: "report", label: "Отчёт врачу", icon: FileText },
  { id: "profile", label: "Профиль", icon: UserRound },
];

const islamicItem = { id: "islamic" as NavPage, label: "Мусульманка", icon: Moon };

export function Sidebar({
  active,
  onChange,
  onCheckIn,
  isIslamic,
}: {
  active: NavPage;
  onChange: (p: NavPage) => void;
  onCheckIn: () => void;
  isIslamic?: boolean;
}) {
  const items = isIslamic ? [...baseItems.slice(0, 3), islamicItem, ...baseItems.slice(3)] : baseItems;
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-mira-lavender/20 bg-white/50 backdrop-blur-sm p-4 h-screen sticky top-0">
      <div className="mb-6 flex items-center gap-2.5 px-3">
        <MiraLogo size={32} />
        <div>
          <span className="text-sm font-bold text-mira-text">Моя Норма</span>
          <p className="text-[10px] text-mira-muted">Знай свою норму</p>
        </div>
      </div>

      <button
        onClick={onCheckIn}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-mira-primary to-mira-primary-deep px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 active:scale-[0.98]"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Отметить состояние
      </button>

      <nav className="flex-1 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
              active === item.id
                ? "bg-mira-lavender-light font-semibold text-mira-primary"
                : "text-mira-muted hover:bg-mira-lavender-light/50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-mira-lavender/20 bg-mira-bg p-3">
        <p className="text-[10px] font-semibold text-mira-muted uppercase tracking-widest">Приватность</p>
        <p className="mt-1 text-xs text-mira-muted">Данные только на вашем устройстве</p>
      </div>
    </aside>
  );
}
