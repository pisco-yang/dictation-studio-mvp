import fs from "node:fs";
import OpenAI from "openai";
import { appConfig } from "@/lib/config";
import type { TranscriptResult, TranscriptionProvider } from "./types";

type VerboseTranscription = {
  text?: string;
  segments?: Array<{ text?: string; start?: number; end?: number }>;
};

export class OpenAITranscriptionProvider implements TranscriptionProvider {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async transcribe(audioPath: string): Promise<TranscriptResult> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required for transcription.");
    }

    const model = appConfig.transcriptionModel;
    const request =
      model === "whisper-1"
        ? {
            file: fs.createReadStream(audioPath),
            model,
            response_format: "verbose_json" as const,
            timestamp_granularities: ["segment"] as const
          }
        : {
            file: fs.createReadStream(audioPath),
            model,
            response_format: "json" as const
          };

    const response = (await this.client.audio.transcriptions.create(
      request as unknown as Parameters<typeof this.client.audio.transcriptions.create>[0]
    )) as VerboseTranscription;

    const segments =
      response.segments?.map((segment) => ({
        text: (segment.text ?? "").trim(),
        startTime: segment.start,
        endTime: segment.end
      })) ?? [];

    const fullText = (response.text ?? segments.map((segment) => segment.text).join(" ")).trim();
    return {
      fullText,
      segments: segments.filter((segment) => segment.text.length > 0)
    };
  }
}
