import Link from "next/link";
import { notFound } from "next/navigation";
import { DictationPractice } from "@/components/DictationPractice";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { sentences: { orderBy: { index: "asc" } } }
  });

  if (!lesson) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/dashboard" className="btn-secondary px-3 py-2 text-sm">
          Dashboard
        </Link>
        <Link href={`/lessons/${lesson.id}/edit`} className="btn-secondary px-3 py-2 text-sm">
          Edit transcript
        </Link>
      </div>

      {lesson.status === "FAILED" ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
          Processing failed: {lesson.errorMessage}
        </div>
      ) : lesson.status !== "READY" ? (
        <div className="glass-panel rounded-lg p-5">Processing lesson...</div>
      ) : (
        <DictationPractice
          lessonId={lesson.id}
          title={lesson.title}
          sourceType={lesson.sourceType}
          youtubeVideoId={lesson.youtubeVideoId}
          sentences={lesson.sentences}
        />
      )}
    </main>
  );
}
