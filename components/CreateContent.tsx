"use client";

import { GenerateLessonForm } from "@/components/GenerateLessonForm";
import { VideoSourceLessonForm } from "@/components/VideoSourceLessonForm";
import { useI18n } from "./I18nProvider";

export function CreateContent() {
  const { t } = useI18n();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t.createTitle}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t.createBody}</p>
      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-medium text-accent">{t.sourceUpload}</p>
          <h2 className="text-xl font-semibold">{t.uploadTitle}</h2>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <p className="text-muted">{t.uploadBody}</p>
          <a href="/upload" className="btn-secondary mt-4 inline-flex">
            {t.openUpload}
          </a>
        </div>
      </section>
      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-medium text-accent">{t.sourceAi}</p>
          <h2 className="text-xl font-semibold">{t.aiTitle}</h2>
        </div>
        <GenerateLessonForm />
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-medium text-accent">{t.sourceVideo}</p>
          <h2 className="text-xl font-semibold">{t.videoTitle}</h2>
        </div>
        <VideoSourceLessonForm />
      </section>
    </main>
  );
}
