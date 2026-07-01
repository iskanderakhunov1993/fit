import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[18px] text-sm font-black transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#35AEEF]/25 active:scale-[0.98] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&>*]:relative",
  {
    variants: {
      variant: {
        default: "bg-[#35AEEF] text-white shadow-[0_14px_30px_rgba(53,174,239,0.28),inset_0_1px_0_rgba(255,255,255,0.38)] hover:bg-[#259FDF] hover:shadow-[0_18px_40px_rgba(53,174,239,0.34)]",
        secondary: "border border-white/80 bg-white/82 text-[#31415C] shadow-[10px_14px_30px_rgba(112,134,170,0.12),-6px_-8px_20px_rgba(255,255,255,0.9)] hover:bg-white",
        ghost: "text-[#31415C] hover:bg-white/70 hover:shadow-[0_8px_22px_rgba(112,134,170,0.10)]",
        outline: "border border-white/85 bg-white/78 text-[#31415C] shadow-[8px_10px_24px_rgba(112,134,170,0.10),inset_0_1px_0_rgba(255,255,255,0.92)] hover:border-[#35AEEF]/35 hover:bg-white",
        cycle: "bg-[#E872A0] text-white shadow-[0_14px_30px_rgba(232,114,160,0.26),inset_0_1px_0_rgba(255,255,255,0.35)] hover:bg-[#D95F8E]"
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-base font-bold"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
