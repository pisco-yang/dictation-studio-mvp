import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { v4 as uuid } from "uuid";
import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getAudioDurationSeconds } from "@/lib/processing/media";
import { splitIntoSentences } from "@/lib/processing/sentences";

type GenerateLessonInput = {
  topic: string;
  level: string;
  sentenceCount: number;
  voice: string;
};

const allowedVoices = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse"
]);

function cleanGeneratedText(text: string) {
  return text
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateSentenceTimes(sentences: string[], durationSeconds: number) {
  const safeDuration = Math.max(durationSeconds, sentences.length * 2);
  const weights = sentences.map((sentence) => Math.max(sentence.length, 1));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let cursor = 0;

  return sentences.map((sentence, index) => {
    const isLast = index === sentences.length - 1;
    const slice = isLast ? safeDuration - cursor : (weights[index] / totalWeight) * safeDuration;
    const startTime = cursor;
    const endTime = Math.max(startTime + 0.8, isLast ? safeDuration : cursor + slice);
    cursor = endTime;
    return { text: sentence, startTime, endTime };
  });
}

async function generatePracticeText(client: OpenAI, input: GenerateLessonInput) {
  const completion = await client.chat.completions.create({
    model: appConfig.textGenerationModel,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You create short, natural English dictation practice. Return only the lesson text, with no title, numbering, markdown, or explanations."
      },
      {
        role: "user",
        content: `Write ${input.sentenceCount} clear sentences for a ${input.level} English learner about: ${input.topic}. Use natural news or daily-life style English. Keep each sentence suitable for listening dictation.`
      }
    ]
  });

  const text = cleanGeneratedText(completion.choices[0]?.message.content ?? "");
  if (!text) {
    throw new Error("The text model did not return lesson text.");
  }
  return text;
}

async function synthesizeSpeech(client: OpenAI, text: string, voice: string) {
  await mkdir(appConfig.audioDir, { recursive: true });
  const audioPath = path.join(appConfig.audioDir, `${uuid()}-ai-lesson.mp3`);

  const response = await client.audio.speech.create({
    model: appConfig.ttsModel,
    voice,
    input: text,
    instructions: "Speak clearly at a steady pace for English dictation practice.",
    response_format: "mp3"
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(audioPath, buffer);
  return audioPath;
}

export async function generateAiLesson(input: GenerateLessonInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to generate AI lessons.");
  }

  const safeInput = {
    topic: input.topic.trim().slice(0, 160) || "today's world news",
    level: input.level.trim().slice(0, 40) || "intermediate",
    sentenceCount: Math.min(Math.max(input.sentenceCount, 3), 12),
    voice: allowedVoices.has(input.voice) ? input.voice : "coral"
  };

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const text = await generatePracticeText(client, safeInput);
  const audioPath = await synthesizeSpeech(client, text, safeInput.voice);
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    throw new Error("Generated text did not contain usable sentences.");
  }

  const durationSeconds = await getAudioDurationSeconds(audioPath);

  // MVP fallback: generated TTS returns a single audio file, not sentence-level timing.
  // We estimate sentence timings from character length and total audio duration.
  // Later this can be replaced by forced alignment or per-sentence synthesis metadata.
  const timedSentences = estimateSentenceTimes(sentences, durationSeconds);

  const lesson = await prisma.lesson.create({
    data: {
      title: `AI: ${safeInput.topic}`,
      originalFilePath: audioPath,
      audioFilePath: audioPath,
      sourceType: "AI_GENERATED",
      rawTranscript: text,
      durationSeconds,
      status: "READY",
      sentences: {
        create: timedSentences.map((sentence, index) => ({
          index,
          text: sentence.text,
          startTime: sentence.startTime,
          endTime: sentence.endTime
        }))
      }
    }
  });

  return lesson;
}
