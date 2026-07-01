export type TabType = "analytics" | "today" | "care" | "profile";

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  path: string;
}

export const TABS: TabConfig[] = [
  { id: "today", label: "Сегодня", icon: "☀️", path: "/today" },
  { id: "care", label: "Забота", icon: "💧", path: "/care" },
  { id: "analytics", label: "Аналитика", icon: "📈", path: "/" },
  { id: "profile", label: "Профиль", icon: "👤", path: "/profile" },
];
