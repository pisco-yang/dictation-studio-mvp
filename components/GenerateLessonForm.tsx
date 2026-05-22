"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "./I18nProvider";

export function GenerateLessonForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsGenerating(true);

    const response = await fetch("/api/generate", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const payload = (await response.json()) as { lessonId?: string; error?: string };

    if (!response.ok || !payload.lessonId) {
      setError(payload.error ?? t.generateAiLesson);
      setIsGenerating(false);
      return;
    }

    router.push(`/lessons/${payload.lessonId}`);
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-lg p-5">
      <div>
        <label htmlFor="topic" className="mb-2 block text-sm font-medium">
          {t.topic}
        </label>
        <input
          id="topic"
          name="topic"
          type="text"
          defaultValue="a short news-style update about technology and daily life"
          className="field"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">{t.level}</span>
          <select name="level" defaultValue="intermediate" className="field">
            <option value="beginner">{t.beginner}</option>
            <option value="intermediate">{t.intermediate}</option>
            <option value="advanced">{t.advanced}</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">{t.sentences}</span>
          <input
            name="sentenceCount"
            type="number"
            min="3"
            max="12"
            defaultValue="6"
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">{t.voice}</span>
          <select name="voice" defaultValue="coral" className="field">
            <option value="coral">Coral</option>
            <option value="alloy">Alloy</option>
            <option value="nova">Nova</option>
            <option value="sage">Sage</option>
            <option value="verse">Verse</option>
            <option value="echo">Echo</option>
          </select>
        </label>
      </div>

      <p className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-muted">
        {t.aiNotice}
      </p>

      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isGenerating}
        className="btn-primary w-full py-3"
      >
        {isGenerating ? t.generatingLesson : t.generateAiLesson}
      </button>
    </form>
  );
}
