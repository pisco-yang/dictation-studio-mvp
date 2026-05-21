import path from "node:path";

export const appConfig = {
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 100),
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? "./storage/uploads"),
  audioDir: path.resolve(process.env.AUDIO_DIR ?? "./storage/audio"),
  ffmpegPath: process.env.FFMPEG_PATH ?? "ffmpeg",
  ffprobePath: process.env.FFPROBE_PATH ?? "ffprobe",
  transcriptionModel: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "gpt-4o-mini-transcribe",
  textGenerationModel: process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini",
  ttsModel: process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts"
};

export const acceptedMimeTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "video/mp4",
  "application/octet-stream"
]);

export const acceptedExtensions = new Set([".mp3", ".wav", ".m4a", ".mp4"]);
