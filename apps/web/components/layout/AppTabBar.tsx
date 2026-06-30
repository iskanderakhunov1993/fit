"use client";

import { usePathname, useRouter } from "next/navigation";
import { TABS, type TabConfig, type TabType } from "@/types/navigation";

function getActiveTab(pathname: string): TabType {
  if (pathname === "/today") return "today";
  if (pathname === "/care") return "care";
  if (pathname === "/profile") return "profile";
  return "analytics";
}

export function AppTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = getActiveTab(pathname);

  function handleTabClick(tab: TabConfig) {
    router.push(tab.path);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-3">
      <div className="mira-card mx-auto flex h-[74px] max-w-md items-center justify-around rounded-[28px] px-2 pb-[env(safe-area-inset-bottom,0px)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`flex h-[58px] flex-1 flex-col items-center justify-center rounded-[22px] transition-all duration-200 ${
                isActive ? "bg-[#F1ECFF]" : "hover:bg-white/60"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={`text-2xl transition-all duration-200 ${isActive ? "scale-110" : "grayscale opacity-70"}`}>
                {tab.icon}
              </span>
              <span className={`mt-1 text-xs font-bold transition-colors duration-200 max-[480px]:hidden ${isActive ? "text-[#7A65F2]" : "text-[#8E8E93]"}`}>
                {tab.label}
              </span>
              <span className={`mt-1 h-1 w-5 rounded-full transition ${isActive ? "bg-[#7A65F2]" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default AppTabBar;
