import { YouTubeLessonForm } from "@/components/YouTubeLessonForm";

export default function YouTubePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Create a YouTube lesson</h1>
      <p className="mt-3 text-muted">
        Paste a YouTube URL, embed the video in the lesson player, then add your own transcript
        sentences and timestamps for dictation practice.
      </p>
      <div className="mt-8">
        <YouTubeLessonForm />
      </div>
    </main>
  );
}
