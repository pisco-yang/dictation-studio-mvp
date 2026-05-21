import { GenerateLessonForm } from "@/components/GenerateLessonForm";

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Generate an AI lesson</h1>
      <p className="mt-3 text-muted">
        Create fresh English dictation practice from a topic, synthesize it to audio, and
        open it in the same lesson player.
      </p>
      <div className="mt-8">
        <GenerateLessonForm />
      </div>
    </main>
  );
}
