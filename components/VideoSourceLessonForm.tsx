"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractVideoSource, type VideoProvider } from "@/lib/video-sources";
import { useI18n } from "./I18nProvider";

export function VideoSourceLessonForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    const formData = new FormData(event.currentTarget);
    const provider = String(formData.get("provider") ?? "youtube") as VideoProvider;
    const url = String(formData.get("videoUrl") ?? "");
    const source = extractVideoSource(url, provider);

    if (!source) {
      setError(t.invalidVideoUrl);
      setIsCreating(false);
      return;
    }

    let title = `${source.provider === "bilibili" ? "Bilibili" : "YouTube"} dictation practice`;
    try {
      const metadata = await fetch(
        `/api/video-metadata?provider=${source.provider}&url=${encodeURIComponent(source.canonicalUrl)}`
      );
      if (metadata.ok) {
        const payload = (await metadata.json()) as { title?: string };
        title = payload.title?.trim() || title;
      }
    } catch {
      // Metadata is nice to have; practice can still start without it.
    }

    const params = new URLSearchParams({
      provider: source.provider,
      videoId: source.id,
      title
    });
    router.push(`/youtube/practice?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-lg p-5">
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">{t.source}</span>
          <select name="provider" defaultValue="youtube" className="field">
            <option value="youtube">YouTube</option>
            <option value="bilibili">Bilibili</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">{t.videoUrl}</span>
          <input
            name="videoUrl"
            type="url"
            placeholder="https://www.youtube.com/watch?v=... or https://www.bilibili.com/video/BV..."
            required
            className="field"
          />
        </label>
      </div>
      <p className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-muted">
        {t.sourceNotice}
      </p>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={isCreating} className="btn-primary w-full py-3">
        {isCreating ? t.openingSource : t.openVideoPractice}
      </button>
    </form>
  );
}
