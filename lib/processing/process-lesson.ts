import { prisma } from "@/lib/prisma";
import { ensureAudioFile, getAudioDurationSeconds } from "./media";
import { buildSentenceInputs } from "./sentences";
import { getTranscriptionProvider } from "@/lib/transcription";

export async function processLesson(lessonId: string) {
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });

  try {
    const audioFilePath = await ensureAudioFile(lesson.originalFilePath);
    const durationSeconds = await getAudioDurationSeconds(audioFilePath);
    const transcript = await getTranscriptionProvider().transcribe(audioFilePath);
    const sentences = buildSentenceInputs(transcript, durationSeconds);

    if (sentences.length === 0) {
      throw new Error("No transcript sentences were found.");
    }

    await prisma.$transaction([
      prisma.sentence.deleteMany({ where: { lessonId } }),
      prisma.lesson.update({
        where: { id: lessonId },
        data: {
          audioFilePath,
          durationSeconds,
          rawTranscript: transcript.fullText,
          status: "READY",
          errorMessage: null
        }
      }),
      prisma.sentence.createMany({
        data: sentences.map((sentence, index) => ({
          lessonId,
          index,
          text: sentence.text,
          startTime: sentence.startTime,
          endTime: sentence.endTime
        }))
      })
    ]);
  } catch (error) {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown processing error"
      }
    });
  }
}
