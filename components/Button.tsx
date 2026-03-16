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
    "bg-[#c8e63d] text-foreground hover:bg-[#c8e63d]/85 active:scale-[0.97]",
  secondary:
    "border border-border text-muted-foreground bg-white hover:bg-gray-50 hover:text-foreground active:scale-[0.97]",
  danger:
    "bg-danger text-white hover:bg-danger/85 active:scale-[0.97]",
  "danger-ghost":
    "bg-danger/10 text-red-600 border border-danger/20 hover:bg-danger/20 active:scale-[0.97]",
  success:
    "bg-success text-white hover:bg-success/85 active:scale-[0.97]",
  "success-ghost":
    "bg-success/10 text-green-700 border border-success/20 hover:bg-success/20 active:scale-[0.97]",
  ghost:
    "bg-gray-50 text-muted-foreground hover:bg-gray-100 hover:text-foreground active:scale-[0.97]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded-full",
  md: "px-3.5 py-1.5 text-sm rounded-full",
  lg: "px-5 py-2 text-sm rounded-full",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", className = "", disabled, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`cursor-pointer font-medium transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export default Button;
