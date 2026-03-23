"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";
type AccentMode = "blue" | "green" | "yellow";

const THEME_KEY = "guto_dashboard_theme";
const ACCENT_KEY = "guto_dashboard_accent";

export default function ThemeControls() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [accent, setAccent] = useState<AccentMode>("blue");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const savedAccent = window.localStorage.getItem(ACCENT_KEY) as AccentMode | null;

    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    if (savedAccent === "blue" || savedAccent === "green" || savedAccent === "yellow") {
      setAccent(savedAccent);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.accent = accent;
    window.localStorage.setItem(THEME_KEY, theme);
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [theme, accent]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        className="h-9 px-3"
        onClick={() => setTheme("light")}
      >
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        className="h-9 px-3"
        onClick={() => setTheme("dark")}
      >
        Dark
      </Button>
      <Button
        variant={accent === "blue" ? "default" : "outline"}
        className="h-9 px-3"
        onClick={() => setAccent("blue")}
      >
        Azul
      </Button>
      <Button
        variant={accent === "green" ? "default" : "outline"}
        className="h-9 px-3"
        onClick={() => setAccent("green")}
      >
        Verde
      </Button>
      <Button
        variant={accent === "yellow" ? "default" : "outline"}
        className="h-9 px-3"
        onClick={() => setAccent("yellow")}
      >
        Amarelo
      </Button>
    </div>
  );
}
