"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-white hover:bg-primary-light shadow-sm",
        variant === "outline" &&
          "border border-border bg-card text-foreground hover:bg-slate-50",
        variant === "ghost" && "text-foreground hover:bg-slate-100",
        className
      )}
      {...props}
    />
  );
}
