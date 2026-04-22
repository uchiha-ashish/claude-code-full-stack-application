import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-brand-primary text-white hover:bg-brand-primary/90",
      secondary: "bg-ink-100 text-ink-900 hover:bg-ink-100/80",
      ghost: "bg-transparent text-brand-primary hover:bg-brand-primary/10"
    };
    const sizes = {
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-5 text-base w-full"
    };
    return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
  }
);
Button.displayName = "Button";
