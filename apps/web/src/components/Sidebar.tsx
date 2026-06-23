import { navigation } from "../data/demo";
import type { Screen } from "../types";
import { Logo } from "./Logo";

type SidebarProps = {
  active: Screen;
  onNavigate: (screen: Screen) => void;
  userName?: string;
  cycleLength?: number;
};

export function Sidebar({ active, onNavigate, userName, cycleLength }: SidebarProps) {
  return (
    <aside className="sidebar">
      <Logo />
      <nav className="desktop-nav" aria-label="Основная навигация">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={active === item.id ? "nav-item active" : "nav-item"}
              key={item.id}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-dot" />
              <Icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-user-card">
        <span className="sidebar-user-avatar">
          {(userName || "А").charAt(0).toUpperCase()}
        </span>
        <span className="sidebar-user-info">
          <strong>{userName || "Аня"}</strong>
          <small>Цикл {cycleLength || 28} дней</small>
        </span>
      </div>
    </aside>
  );
}
