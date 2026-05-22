import { GenerateLessonForm } from "@/components/GenerateLessonForm";
import { VideoSourceLessonForm } from "@/components/VideoSourceLessonForm";

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Create a lesson</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Build practice material from an upload, AI-generated audio, or embedded video sources
        like YouTube and Bilibili.
      </p>
      <section className="mt-8">
        <div className="mb-4">
          <p className="text-sm font-medium text-accent">Source: upload</p>
          <h2 className="text-xl font-semibold">Upload audio or video</h2>
        </div>
        <div className="glass-panel rounded-lg p-5">
          <p className="text-muted">
            Upload mode accepts mp3, wav, m4a, and mp4 files. It needs a configured database and
            transcription provider.
          </p>
          <a href="/upload" className="btn-secondary mt-4 inline-flex">
            Open upload
          </a>
        </div>
      </section>
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
