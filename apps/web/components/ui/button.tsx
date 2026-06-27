import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mira-primary/30 active:scale-[0.98] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 [&>*]:relative",
  {
    variants: {
      variant: {
        // глянцевый: верхний внутренний блик + глубокая тень + лёгкий подъём
        default: "bg-mira-primary text-white shadow-[0_10px_24px_rgba(155,142,196,0.26)] hover:bg-mira-primary-deep hover:shadow-[0_14px_34px_rgba(155,142,196,0.32)]",
        secondary: "bg-mira-lavender-light text-mira-text hover:bg-mira-lavender/40",
        ghost: "text-mira-text hover:bg-mira-lavender-light/70",
        outline: "border border-mira-lavender/40 bg-white text-mira-text hover:border-mira-primary/40 hover:bg-mira-lavender-light/30",
        cycle: "bg-mira-cycle text-white shadow-[0_10px_24px_rgba(196,126,155,0.25)] hover:bg-[#AA6684]"
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
