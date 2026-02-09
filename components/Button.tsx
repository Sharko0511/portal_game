"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "danger-ghost"
  | "success"
  | "success-ghost"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-background hover:bg-accent/80 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-[0.97]",
  secondary:
    "border border-white/10 text-foreground/70 hover:border-accent/30 hover:bg-card hover:text-foreground active:scale-[0.97]",
  danger:
    "bg-danger text-white hover:bg-danger/80 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.97]",
  "danger-ghost":
    "bg-danger/20 text-danger hover:bg-danger/30 active:scale-[0.97]",
  success:
    "bg-success text-background hover:bg-success/80 hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] active:scale-[0.97]",
  "success-ghost":
    "bg-success/20 text-success hover:bg-success/30 active:scale-[0.97]",
  ghost:
    "bg-foreground/20 text-foreground/50 hover:bg-foreground/30 hover:text-foreground/70 active:scale-[0.97]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2 py-1 text-xs rounded",
  md: "px-3 py-1.5 text-sm rounded-lg",
  lg: "px-4 py-2 text-sm rounded-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
