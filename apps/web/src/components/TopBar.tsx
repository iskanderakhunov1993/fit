import { Bell, Palette } from "lucide-react";
import { Logo } from "./Logo";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="mobile-logo">
        <Logo />
      </div>
      <div />
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Тема">
          <Palette size={18} />
          <span className="topbar-theme-label">ТЕМА</span>
        </button>
        <button className="icon-button" aria-label="Уведомления">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>
      </div>
    </header>
  );
}
