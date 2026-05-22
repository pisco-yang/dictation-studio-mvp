"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "./I18nProvider";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/82 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-sm text-white dark:text-slate-950">
            DS
          </span>
          <span className="hidden sm:inline">Dictation Studio</span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/dashboard" className="rounded-md px-3 py-2 text-muted transition hover:bg-accentSoft hover:text-ink">
            {t.navDashboard}
          </Link>
          <Link href="/create" className="rounded-md bg-ink px-3 py-2 text-paper transition hover:opacity-85">
            {t.navCreate}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
