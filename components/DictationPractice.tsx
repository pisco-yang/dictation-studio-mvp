"use client";

import { useMemo, useRef, useState } from "react";

type Sentence = {
  id: string;
  index: number;
  text: string;
  startTime: number;
  endTime: number;
};

type DiffToken = {
  text: string;
  kind: "correct" | "missing" | "wrong" | "extra";
  typed?: string;
};

function words(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[“”"(),.;:!?]/g, "").toLowerCase())
    .filter(Boolean);
}

function buildDiff(answer: string, typed: string): DiffToken[] {
  const expectedWords = words(answer);
  const typedWords = words(typed);
  const max = Math.max(expectedWords.length, typedWords.length);
  const result: DiffToken[] = [];

  for (let index = 0; index < max; index += 1) {
    const expected = expectedWords[index];
    const actual = typedWords[index];
    if (expected && actual && expected === actual) {
      result.push({ text: expected, kind: "correct" });
    } else if (expected && actual) {
      result.push({ text: expected, typed: actual, kind: "wrong" });
    } else if (expected) {
      result.push({ text: expected, kind: "missing" });
    } else if (actual) {
      result.push({ text: actual, kind: "extra" });
    }
  }

  return result;
}

function scoreAnswer(answer: string, typed: string) {
  const diff = buildDiff(answer, typed);
  if (diff.length === 0) return 0;
  const correct = diff.filter((token) => token.kind === "correct").length;
  return Math.round((correct / diff.length) * 100);
}

export function DictationPractice({
  lessonId,
  title,
  sourceType,
  youtubeVideoId,
  sentences
}: {
  lessonId: string;
  title: string;
  sourceType: "UPLOAD" | "AI_GENERATED" | "YOUTUBE";
  youtubeVideoId: string | null;
  sentences: Sentence[];
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const stopTimer = useRef<number | null>(null);
  const [youtubeSrc, setYoutubeSrc] = useState(
    youtubeVideoId ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0` : ""
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [checkedDiff, setCheckedDiff] = useState<DiffToken[] | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const current = sentences[currentIndex];
  const progress = useMemo(() => `${currentIndex + 1} / ${sentences.length}`, [currentIndex, sentences.length]);

  function resetFor(index: number) {
    setCurrentIndex(index);
    setTypedText("");
    setCheckedDiff(null);
    setScore(null);
    setIsRevealed(false);
  }

  async function playCurrentSentence() {
    if (!current) return;
    if (stopTimer.current) window.clearTimeout(stopTimer.current);

    if (sourceType === "YOUTUBE" && youtubeVideoId) {
      const start = Math.max(Math.floor(current.startTime), 0);
      const end = Math.max(Math.ceil(current.endTime), start + 1);
      setYoutubeSrc(
        `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?start=${start}&end=${end}&autoplay=1&rel=0`
      );
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(current.startTime, 0);
    await audio.play();
    const durationMs = Math.max((current.endTime - current.startTime) * 1000, 500);
    stopTimer.current = window.setTimeout(() => {
      audio.pause();
    }, durationMs);
  }

  async function checkAnswer() {
    const diff = buildDiff(current.text, typedText);
    const nextScore = scoreAnswer(current.text, typedText);
    setCheckedDiff(diff);
    setScore(nextScore);

    await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sentenceId: current.id,
        typedText,
        score: nextScore
      })
    });
  }

  if (!current) {
    return <p className="glass-panel rounded-lg p-6">This lesson has no sentences yet.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {sourceType === "YOUTUBE" && youtubeVideoId ? (
        <div className="glass-panel overflow-hidden rounded-lg p-2 lg:col-span-2">
          <div className="aspect-video overflow-hidden rounded-md bg-black">
            <iframe
              key={youtubeSrc}
              src={youtubeSrc}
              title={title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <audio ref={audioRef} src={`/api/lessons/${lessonId}/media`} preload="metadata" />
      )}
      <section className="glass-panel rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-accent">Sentence {progress}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
          </div>
          <button onClick={playCurrentSentence} className="rounded-md bg-ink px-4 py-2 font-medium text-paper transition hover:opacity-85">
            Play
          </button>
        </div>

        <textarea
          value={typedText}
          onChange={(event) => setTypedText(event.target.value)}
          rows={6}
          placeholder="Type what you hear..."
          className="field mt-6 resize-y p-4 text-lg leading-8"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={checkAnswer} className="btn-primary">
            Check answer
          </button>
          <button
            onClick={() => setIsRevealed(true)}
            className="btn-secondary"
          >
            Reveal answer
          </button>
          <button
            onClick={() => resetFor(Math.max(currentIndex - 1, 0))}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => resetFor(Math.min(currentIndex + 1, sentences.length - 1))}
            disabled={currentIndex === sentences.length - 1}
            className="btn-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>

        {score !== null ? <p className="mt-4 text-sm font-medium">Score: {score}%</p> : null}

        {checkedDiff ? (
          <div className="mt-4 rounded-md border border-line bg-paper p-4">
            <div className="flex flex-wrap gap-2">
              {checkedDiff.map((token, index) => (
                <span
                  key={`${token.text}-${index}`}
                  className={
                    token.kind === "correct"
                      ? "rounded bg-green-100 px-2 py-1 text-green-800"
                      : token.kind === "missing"
                        ? "rounded bg-red-100 px-2 py-1 text-red-800"
                        : token.kind === "extra"
                          ? "rounded bg-purple-100 px-2 py-1 text-purple-800"
                          : "rounded bg-amber-100 px-2 py-1 text-amber-900"
                  }
                >
                  {token.kind === "wrong" ? `${token.typed} → ${token.text}` : token.text}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <span>Green correct</span>
              <span>Red missing</span>
              <span>Amber wrong</span>
              <span>Purple extra</span>
            </div>
          </div>
        ) : null}

        {isRevealed ? (
          <div className="mt-4 rounded-md border border-line bg-surface p-4">
            <p className="text-sm font-medium text-muted">Answer</p>
            <p className="mt-2 text-lg leading-8">{current.text}</p>
          </div>
        ) : null}
      </section>

      <aside className="glass-panel rounded-lg p-4">
        <h2 className="font-semibold">Sentences</h2>
        <div className="mt-3 max-h-[560px] space-y-2 overflow-y-auto">
          {sentences.map((sentence, index) => (
            <button
              key={sentence.id}
              onClick={() => resetFor(index)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                index === currentIndex ? "border-accent bg-accentSoft" : "border-line bg-surface/70 hover:bg-paper"
              }`}
            >
              <span className="font-medium">{index + 1}.</span> {sentence.text}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
