import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#F0ECE6] bg-white p-4 shadow-soft sm:p-5",
        className
      )}
      {...props}
    />
  );
}
