"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function renameLesson(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  await prisma.lesson.update({ where: { id }, data: { title } });
  revalidatePath("/dashboard");
  revalidatePath(`/lessons/${id}`);
}

export async function deleteLesson(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.lesson.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateSentences(formData: FormData) {
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) return;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { sentences: true }
  });
  if (!lesson) return;

  await prisma.$transaction(
    lesson.sentences.map((sentence) =>
      prisma.sentence.update({
        where: { id: sentence.id },
        data: {
          text: String(formData.get(`text-${sentence.id}`) ?? sentence.text).trim() || sentence.text,
          startTime: Number(formData.get(`start-${sentence.id}`) ?? sentence.startTime),
          endTime: Number(formData.get(`end-${sentence.id}`) ?? sentence.endTime)
        }
      })
    )
  );

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath(`/lessons/${lessonId}/edit`);
}

export async function addSentence(formData: FormData) {
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) return;

  const lastSentence = await prisma.sentence.findFirst({
    where: { lessonId },
    orderBy: { index: "desc" }
  });
  const nextIndex = (lastSentence?.index ?? -1) + 1;
  const startTime = lastSentence?.endTime ?? 0;

  await prisma.sentence.create({
    data: {
      lessonId,
      index: nextIndex,
      text: "Add transcript sentence here.",
      startTime,
      endTime: startTime + 5
    }
  });

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath(`/lessons/${lessonId}/edit`);
}

export async function deleteSentence(formData: FormData) {
  const sentenceId = String(formData.get("sentenceId") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  if (!sentenceId || !lessonId) return;

  await prisma.sentence.delete({ where: { id: sentenceId } });
  const remaining = await prisma.sentence.findMany({
    where: { lessonId },
    orderBy: { index: "asc" }
  });

  await prisma.$transaction(
    remaining.map((sentence, index) =>
      prisma.sentence.update({
        where: { id: sentence.id },
        data: { index }
      })
    )
  );

  revalidatePath(`/lessons/${lessonId}`);
  revalidatePath(`/lessons/${lessonId}/edit`);
}
