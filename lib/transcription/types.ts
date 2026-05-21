export type TranscriptSegment = {
  text: string;
  startTime?: number;
  endTime?: number;
};

export type TranscriptResult = {
  fullText: string;
  segments: TranscriptSegment[];
};

export interface TranscriptionProvider {
  transcribe(audioPath: string): Promise<TranscriptResult>;
}
