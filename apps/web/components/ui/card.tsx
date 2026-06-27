import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-mira-lavender/20 bg-white/95 p-4 shadow-[0_8px_24px_rgba(45,38,64,0.055)] transition-all duration-200 sm:p-5",
        className
      )}
      {...props}
    />
  );
}
