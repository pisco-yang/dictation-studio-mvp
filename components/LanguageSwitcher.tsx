"use client";

import { useEffect, useRef, useState } from "react";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

const localeShortNames: Record<Locale, string> = {
  en: "EN",
  "zh-CN": "简",
  "zh-HK": "繁 HK",
  "zh-TW": "繁 TW",
  vi: "VI"
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function chooseLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    setIsOpen(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t.language}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink transition hover:bg-accentSoft"
      >
        <span aria-hidden="true">文</span>
        <span>{localeShortNames[locale]}</span>
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-48 rounded-lg border border-line bg-surface p-1 shadow-xl"
        >
          {locales.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              onClick={() => chooseLocale(item)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                item === locale ? "bg-accentSoft font-semibold text-ink" : "text-muted hover:bg-paper hover:text-ink"
              }`}
            >
              {localeNames[item]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
