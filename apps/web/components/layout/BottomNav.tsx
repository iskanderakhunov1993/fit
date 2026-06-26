"use client";

import {
  Sun, ChartNoAxesCombined, HeartPulse, FileText, UserRound, Plus, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavPage } from "./types";

export function BottomNav({
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
  const left: { id: NavPage; label: string; icon: typeof Sun }[] = [
    { id: "today", label: "Сегодня", icon: Sun },
    { id: "analytics", label: "Аналитика", icon: ChartNoAxesCombined },
  ];

  const right: { id: NavPage; label: string; icon: typeof Sun }[] = isIslamic
    ? [{ id: "islamic", label: "Ибада", icon: Moon }, { id: "report", label: "Отчёт", icon: FileText }]
    : [{ id: "care", label: "Забота", icon: HeartPulse }, { id: "report", label: "Отчёт", icon: FileText }];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-mira-lavender/20 bg-white/80 backdrop-blur-xl lg:hidden">
      <div className="relative flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom,8px)] pt-2">
        {left.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-1 transition-colors",
              active === item.id ? "text-mira-primary" : "text-mira-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}

        {/* Center FAB */}
        <button
          onClick={onCheckIn}
          className="relative -top-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-mira-primary to-mira-primary-deep shadow-glow transition active:scale-95"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>

        {right.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 py-1 transition-colors",
              active === item.id ? "text-mira-primary" : "text-mira-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
