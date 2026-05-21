import Link from "next/link";
import { deleteLesson, renameLesson } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { sentences: true } } }
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted">Manage uploaded and AI-generated dictation lessons.</p>
        </div>
        <Link href="/generate" className="btn-primary">
          New lesson
        </Link>
      </div>

      <div className="glass-panel mt-8 overflow-hidden rounded-lg">
        {lessons.length === 0 ? (
          <div className="p-8 text-center text-muted">No lessons yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {lessons.map((lesson) => (
              <li key={lesson.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <form action={renameLesson} className="flex max-w-xl gap-2">
                    <input type="hidden" name="id" value={lesson.id} />
                    <input
                      name="title"
                      defaultValue={lesson.title}
                      className="field font-medium"
                    />
                    <button className="btn-secondary px-3 py-2 text-sm">Rename</button>
                  </form>
                  <p className="mt-2 text-sm text-muted">
                    {lesson.status.toLowerCase()} · {lesson._count.sentences} sentences ·{" "}
                    {lesson.createdAt.toLocaleDateString()}
                  </p>
                  {lesson.errorMessage ? <p className="mt-2 text-sm text-red-700">{lesson.errorMessage}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/lessons/${lesson.id}`} className="rounded-md bg-ink px-3 py-2 text-sm text-paper">
                    Open
                  </Link>
                  <Link href={`/lessons/${lesson.id}/edit`} className="btn-secondary px-3 py-2 text-sm">
                    Edit
                  </Link>
                  <form action={deleteLesson}>
                    <input type="hidden" name="id" value={lesson.id} />
                    <button className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
