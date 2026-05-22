# Dictation Studio MVP

A local-first Next.js MVP inspired by the practice flow of DailyDictation, but powered by user-uploaded audio or video. Users upload media, the app transcribes it, splits it into sentence-level prompts, and turns it into an interactive dictation lesson.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Local file storage under `storage/`
- FFmpeg / FFprobe for video audio extraction and duration probing
- OpenAI speech-to-text behind a swappable `TranscriptionProvider`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with a PostgreSQL database URL and `OPENAI_API_KEY`.

4. Make sure FFmpeg is installed:

```bash
ffmpeg -version
ffprobe -version
```

On macOS, `brew install ffmpeg` is the quickest path.

5. Create the Prisma client and database tables:

```bash
npm run db:generate
npm run db:push
```

6. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## MVP Flow

1. Upload accepts `mp3`, `wav`, `m4a`, and `mp4`.
2. Files are saved locally to `storage/uploads`.
3. MP4 files are converted to MP3 audio in `storage/audio`.
4. Audio is sent to the configured OpenAI transcription model.
5. The transcript is stored on `Lesson.rawTranscript`.
6. Transcript segments become lesson sentences. If no timestamps are returned, the MVP estimates sentence timing by sentence length and audio duration.
7. The lesson page plays one sentence segment at a time and stores attempts with a simple word-level score.
8. The editor lets users fix sentence text and manually adjust start/end timestamps.

## AI-Generated Lessons

The `/create` page can create a lesson without uploading a file:

1. The text model writes short English practice text from a topic.
2. OpenAI text-to-speech creates an MP3 file in `storage/audio`.
3. The app splits the generated text into sentences.
4. Because generated TTS returns one audio file without sentence timestamps, the MVP estimates timings by sentence length and total audio duration.
5. The generated lesson opens in the same practice player and editor.

This requires `OPENAI_API_KEY`. Configure `OPENAI_TEXT_MODEL` and `OPENAI_TTS_MODEL` in `.env` to change the models.

## YouTube Lessons

The `/create` page can also create a lesson from a YouTube or Bilibili URL without downloading or storing the video:

1. Paste a public YouTube or Bilibili URL.
2. The app embeds the official/source player and uses the video title when available.
3. Open the transcript editor.
4. Add sentences manually and set `start` / `end` timestamps in seconds.
5. Practice uses the embedded YouTube player for replaying the current timestamp range.

This mode is useful for testing dictation flow without OpenAI transcription costs. It does not copy, download, or rehost YouTube media.

## Architecture Notes

Transcription is isolated behind:

```ts
TranscriptionProvider.transcribe(audioPath): Promise<TranscriptResult>
```

`TranscriptResult` supports:

```ts
{
  fullText: string;
  segments: { text: string; startTime?: number; endTime?: number }[];
}
```

To swap in WhisperX, Deepgram, or forced alignment later, add another provider in `lib/transcription` and return the same shape.

## Production TODO

- Add authentication and real user ownership.
- Move files to cloud object storage.
- Run processing in a queue worker instead of during the upload request.
- Add better forced alignment and word-level timestamps.
- Add payments and usage limits.
- Add PWA support for offline practice.
- Build a mobile app experience.
- Add background cleanup for deleted local files.
- Add robust media range streaming for large files.
- Add automated tests for upload validation, sentence splitting, scoring, and provider adapters.
- Add optional per-sentence TTS generation for more accurate AI lesson timestamps.
- Add YouTube API metadata lookup for titles and thumbnails.
