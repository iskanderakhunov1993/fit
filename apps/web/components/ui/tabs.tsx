"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used inside <Tabs>");
  }
  return context;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;

  const handleValueChange = React.useCallback((nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }, [onValueChange]);

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("inline-flex items-center rounded-[22px] border border-white/85 bg-white/78 p-1 shadow-[10px_14px_30px_rgba(112,134,170,0.12),-6px_-8px_20px_rgba(255,255,255,0.86)] backdrop-blur-xl", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: currentValue, onValueChange } = useTabs();
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      className={cn(
        "rounded-xl px-3 py-2 text-xs font-bold text-[#8E8E93] transition sm:px-4",
        isActive && "bg-[#35AEEF] text-white shadow-[0_10px_22px_rgba(53,174,239,0.26),inset_0_1px_0_rgba(255,255,255,0.35)]",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: currentValue } = useTabs();
  if (currentValue !== value) return null;

  return (
    <div className={cn("mt-6", className)} {...props}>
      {children}
    </div>
  );
}
