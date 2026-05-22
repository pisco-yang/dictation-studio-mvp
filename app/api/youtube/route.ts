import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractYouTubeVideoId } from "@/lib/youtube";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const youtubeUrl = String(formData.get("youtubeUrl") ?? "");
    const titleInput = String(formData.get("title") ?? "").trim();
    const youtubeVideoId = extractYouTubeVideoId(youtubeUrl);

    if (!youtubeVideoId) {
      return NextResponse.json({ error: "Please enter a valid YouTube URL or video ID." }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: titleInput || `YouTube lesson ${youtubeVideoId}`,
        originalFilePath: `https://www.youtube.com/watch?v=${youtubeVideoId}`,
        sourceType: "YOUTUBE",
        youtubeVideoId,
        status: "READY"
      }
    });

    return NextResponse.json({ lessonId: lesson.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "YouTube lesson creation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
