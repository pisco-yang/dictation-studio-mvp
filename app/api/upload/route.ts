import { NextResponse } from "next/server";
import { saveUploadedFile, titleFromFilename } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { processLesson } from "@/lib/processing/process-lesson";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const titleInput = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please choose a media file." }, { status: 400 });
    }

    const originalFilePath = await saveUploadedFile(file);
    const title =
      typeof titleInput === "string" && titleInput.trim().length > 0
        ? titleInput.trim()
        : titleFromFilename(file.name);

    const lesson = await prisma.lesson.create({
      data: {
        title,
        originalFilePath,
        status: "PROCESSING"
      }
    });

    await processLesson(lesson.id);

    return NextResponse.json({ lessonId: lesson.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
