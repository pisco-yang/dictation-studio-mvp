"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="focus-ring flex h-10 w-20 items-center rounded-full border border-line bg-surface p-1 transition"
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-semibold text-white transition-transform dark:text-slate-950 ${
          theme === "dark" ? "translate-x-10" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? "D" : "L"}
      </span>
    </button>
  );
}
