import { OpenAITranscriptionProvider } from "./openai-provider";
import type { TranscriptionProvider } from "./types";

export function getTranscriptionProvider(): TranscriptionProvider {
  return new OpenAITranscriptionProvider();
}
