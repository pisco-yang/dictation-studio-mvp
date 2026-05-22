import { GenerateLessonForm } from "@/components/GenerateLessonForm";
import { VideoSourceLessonForm } from "@/components/VideoSourceLessonForm";

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Generate a lesson</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Create dictation practice from AI audio or from embedded video sources like YouTube and
        Bilibili.
      </p>
      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-medium text-accent">Source: AI voice</p>
          <h2 className="text-xl font-semibold">Generate text and audio</h2>
        </div>
        <GenerateLessonForm />
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-medium text-accent">Source: video</p>
          <h2 className="text-xl font-semibold">Use YouTube or Bilibili</h2>
        </div>
        <VideoSourceLessonForm />
      </section>
    </main>
  );
}
