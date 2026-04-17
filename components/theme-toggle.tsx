"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Cambiar tema"
        className="fixed top-3 right-3 z-[60] w-9 h-9 rounded-full bg-bg-4 border border-text-muted/20 flex items-center justify-center shadow-md"
      >
        <span className="block w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="fixed top-3 right-3 z-[60] w-9 h-9 rounded-full bg-bg-4 border border-text-muted/20 hover:border-gold/40 flex items-center justify-center transition-all hover:scale-105 shadow-md"
    >
      {isDark ? (
        <Sun size={16} className="text-gold-light" aria-hidden="true" />
      ) : (
        <Moon size={16} className="text-text-warm" aria-hidden="true" />
      )}
    </button>
  );
}
