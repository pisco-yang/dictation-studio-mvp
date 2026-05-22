"use client";

import { useEffect, useMemo, useState } from "react";
import { buildEmbedUrl, buildWatchUrl, type VideoProvider } from "@/lib/video-sources";

type SentenceDraft = {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
};

function words(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[“”"(),.;:!?]/g, "").toLowerCase())
    .filter(Boolean);
}

function score(answer: string, typed: string) {
  const expected = words(answer);
  const actual = words(typed);
  if (expected.length === 0) return 0;
  const correct = expected.filter((word, index) => word === actual[index]).length;
  return Math.round((correct / Math.max(expected.length, actual.length, 1)) * 100);
}

export function YouTubeManualPractice({
  provider,
  videoId,
  title
}: {
  provider: VideoProvider;
  videoId: string;
  title: string;
}) {
  const storageKey = `${provider}-dictation:${videoId}`;
  const [sentences, setSentences] = useState<SentenceDraft[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [embedSrc, setEmbedSrc] = useState(buildEmbedUrl(provider, videoId));

  const current = sentences[currentIndex];
  const progress = useMemo(
    () => (sentences.length ? `${currentIndex + 1} / ${sentences.length}` : "0 / 0"),
    [currentIndex, sentences.length]
  );

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setSentences(JSON.parse(stored) as SentenceDraft[]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sentences));
  }, [sentences, storageKey]);

  function addSentence() {
    const last = sentences.at(-1);
    const startTime = last?.endTime ?? 0;
    setSentences([
      ...sentences,
      {
        id: crypto.randomUUID(),
        text: "Add transcript sentence here.",
        startTime,
        endTime: startTime + 5
      }
    ]);
  }

  function updateSentence(id: string, patch: Partial<SentenceDraft>) {
    setSentences(sentences.map((sentence) => (sentence.id === id ? { ...sentence, ...patch } : sentence)));
  }

  function deleteSentence(id: string) {
    const next = sentences.filter((sentence) => sentence.id !== id);
    setSentences(next);
    setCurrentIndex(Math.min(currentIndex, Math.max(next.length - 1, 0)));
  }

  function resetPractice(index: number) {
    setCurrentIndex(index);
    setTypedText("");
    setRevealed(false);
    setResult(null);
  }

  function playCurrent() {
    if (!current) return;
    setEmbedSrc(buildEmbedUrl(provider, videoId, current.startTime, current.endTime));
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
      <section className="glass-panel overflow-hidden rounded-lg p-2 lg:col-span-2">
        <div className="aspect-video overflow-hidden rounded-md bg-black">
          <iframe
            key={embedSrc}
            src={embedSrc}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-3 text-sm text-muted">
          <span>
            Some videos restrict embedded playback. Bilibili replay starts near the timestamp but may not stop automatically.
          </span>
          <a
            href={buildWatchUrl(provider, videoId)}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-line bg-surface px-3 py-2 font-medium text-ink hover:bg-accentSoft"
          >
            Open on {provider === "bilibili" ? "Bilibili" : "YouTube"}
          </a>
        </div>
      </section>

      <section className="glass-panel rounded-lg p-5">
        <p className="text-sm font-medium text-accent">Sentence {progress}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {current ? (
          <>
            <textarea
              value={typedText}
              onChange={(event) => setTypedText(event.target.value)}
              rows={6}
              placeholder="Type what you hear..."
              className="field mt-6 resize-y p-4 text-lg leading-8"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={playCurrent} className="rounded-md bg-ink px-4 py-2 font-medium text-paper">
                Play
              </button>
              <button onClick={() => setResult(score(current.text, typedText))} className="btn-primary">
                Check answer
              </button>
              <button onClick={() => setRevealed(true)} className="btn-secondary">
                Reveal answer
              </button>
              <button onClick={() => resetPractice(Math.max(currentIndex - 1, 0))} className="btn-secondary">
                Previous
              </button>
              <button
                onClick={() => resetPractice(Math.min(currentIndex + 1, sentences.length - 1))}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
            {result !== null ? <p className="mt-4 text-sm font-medium">Score: {result}%</p> : null}
            {revealed ? (
              <div className="mt-4 rounded-md border border-line bg-surface p-4">
                <p className="text-sm font-medium text-muted">Answer</p>
                <p className="mt-2 text-lg leading-8">{current.text}</p>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-6 rounded-md border border-line bg-paper p-4 text-muted">
            Add transcript sentences on the right, then practice them here.
          </p>
        )}
      </section>

      <aside className="glass-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Transcript</h2>
          <button onClick={addSentence} className="btn-secondary px-3 py-2 text-sm">
            Add
          </button>
        </div>
        <div className="mt-4 max-h-[680px] space-y-3 overflow-y-auto">
          {sentences.map((sentence, index) => (
            <div key={sentence.id} className="rounded-md border border-line bg-surface/70 p-3">
              <button
                onClick={() => resetPractice(index)}
                className="mb-3 text-left text-sm font-medium text-accent"
              >
                Sentence {index + 1}
              </button>
              <textarea
                value={sentence.text}
                onChange={(event) => updateSentence(sentence.id, { text: event.target.value })}
                rows={3}
                className="field p-2 text-sm"
              />
              <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={sentence.startTime}
                  onChange={(event) => updateSentence(sentence.id, { startTime: Number(event.target.value) })}
                  className="field px-2 py-1 text-sm"
                  aria-label={`Sentence ${index + 1} start time`}
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={sentence.endTime}
                  onChange={(event) => updateSentence(sentence.id, { endTime: Number(event.target.value) })}
                  className="field px-2 py-1 text-sm"
                  aria-label={`Sentence ${index + 1} end time`}
                />
                <button
                  onClick={() => deleteSentence(sentence.id)}
                  className="rounded-md border border-red-200 px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
