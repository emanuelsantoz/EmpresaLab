"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", value, placeholder, ...props }: InputProps) {
  const normalizedValue =
    type === "number" && (value === 0 || value === "0") ? "" : value;
  const normalizedPlaceholder =
    type === "number" && (placeholder === undefined || placeholder === "") ? "0" : placeholder;

  return (
    <input
      type={type}
      value={normalizedValue}
      placeholder={normalizedPlaceholder}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
