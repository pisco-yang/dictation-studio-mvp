import { NextResponse } from "next/server";
import { generateAiLesson } from "@/lib/generation/ai-lesson";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const lesson = await generateAiLesson({
      topic: String(formData.get("topic") ?? ""),
      level: String(formData.get("level") ?? "intermediate"),
      sentenceCount: Number(formData.get("sentenceCount") ?? 6),
      voice: String(formData.get("voice") ?? "coral")
    });

    return NextResponse.json({ lessonId: lesson.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI lesson generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
