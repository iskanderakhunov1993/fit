import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-white/85 bg-white/88 p-4 shadow-[14px_18px_42px_rgba(112,134,170,0.12),-8px_-10px_24px_rgba(255,255,255,0.84),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl transition-all duration-200 sm:p-5",
        className
      )}
      {...props}
    />
  );
}
