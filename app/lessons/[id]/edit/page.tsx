import Link from "next/link";
import { notFound } from "next/navigation";
import { updateSentences } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { sentences: { orderBy: { index: "asc" } } }
  });

  if (!lesson) notFound();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-accent">Transcript editor</p>
          <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        </div>
        <Link href={`/lessons/${lesson.id}`} className="rounded-md bg-ink px-4 py-2 text-paper">
          Back to lesson
        </Link>
      </div>

      <form action={updateSentences} className="space-y-3">
        <input type="hidden" name="lessonId" value={lesson.id} />
        {lesson.sentences.map((sentence) => (
          <section key={sentence.id} className="glass-panel rounded-lg p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Sentence {sentence.index + 1}</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <label className="block">
                  <span className="mb-1 block text-muted">Start</span>
                  <input
                    name={`start-${sentence.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={sentence.startTime}
                    className="field w-24 px-2 py-1"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-muted">End</span>
                  <input
                    name={`end-${sentence.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={sentence.endTime}
                    className="field w-24 px-2 py-1"
                  />
                </label>
              </div>
            </div>
            <textarea
              name={`text-${sentence.id}`}
              defaultValue={sentence.text}
              rows={3}
              className="field p-3 leading-7"
            />
          </section>
        ))}
        <button className="btn-primary sticky bottom-4 px-5 py-3 shadow-sm">
          Save transcript
        </button>
      </form>
    </main>
  );
}
