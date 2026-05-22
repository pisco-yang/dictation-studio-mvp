"use client";

import { localeNames, locales, type Locale } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className="sr-only" htmlFor="language-switcher">
      {t.language}
      <select
        id="language-switcher"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="not-sr-only focus-ring rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {localeNames[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
