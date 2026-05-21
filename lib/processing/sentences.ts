import type { TranscriptResult, TranscriptSegment } from "@/lib/transcription/types";

export type SentenceInput = {
  text: string;
  startTime: number;
  endTime: number;
};

export function splitIntoSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) ?? [];
}

function normalizeSegment(segment: TranscriptSegment) {
  return {
    text: segment.text.trim(),
    startTime: segment.startTime,
    endTime: segment.endTime
  };
}

function estimateSentenceTiming(sentences: string[], durationSeconds: number): SentenceInput[] {
  const safeDuration = Math.max(durationSeconds, sentences.length || 1);
  const weights = sentences.map((sentence) => Math.max(sentence.length, 1));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  let cursor = 0;

  return sentences.map((text, index) => {
    const isLast = index === sentences.length - 1;
    const slice = isLast ? safeDuration - cursor : (weights[index] / totalWeight) * safeDuration;
    const startTime = cursor;
    const endTime = Math.max(startTime + 0.5, isLast ? safeDuration : cursor + slice);
    cursor = endTime;
    return { text, startTime, endTime };
  });
}

export function buildSentenceInputs(transcript: TranscriptResult, audioDurationSeconds: number): SentenceInput[] {
  const timestampedSegments = transcript.segments
    .map(normalizeSegment)
    .filter(
      (segment) =>
        segment.text &&
        typeof segment.startTime === "number" &&
        typeof segment.endTime === "number" &&
        segment.endTime > segment.startTime
    );

  if (timestampedSegments.length > 0) {
    return timestampedSegments.map((segment) => ({
      text: segment.text,
      startTime: segment.startTime ?? 0,
      endTime: segment.endTime ?? Math.max((segment.startTime ?? 0) + 1, audioDurationSeconds)
    }));
  }

  const sentences = splitIntoSentences(transcript.fullText);

  // MVP fallback: OpenAI may return only text, without sentence or word-level timestamps.
  // We estimate timings proportionally by sentence length and the probed audio duration.
  // A future WhisperX/Deepgram adapter can replace this with aligned segment timestamps.
  return estimateSentenceTiming(sentences, audioDurationSeconds);
}
