"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadForm({ maxUploadMb }: { maxUploadMb: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsUploading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const payload = (await response.json()) as { lessonId?: string; error?: string };

    if (!response.ok || !payload.lessonId) {
      setError(payload.error ?? "Upload failed.");
      setIsUploading(false);
      return;
    }

    router.push(`/lessons/${payload.lessonId}`);
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-lg p-5">
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Lesson title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Optional title"
          className="field"
        />
      </div>
      <div>
        <label htmlFor="file" className="mb-2 block text-sm font-medium">
          Media file
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".mp3,.wav,.m4a,.mp4,audio/mpeg,audio/wav,audio/mp4,video/mp4"
          required
          className="focus-ring w-full rounded-md border border-line bg-paper px-3 py-3 text-ink file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-2 text-sm text-muted">mp3, wav, m4a, or mp4 up to {maxUploadMb} MB.</p>
      </div>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isUploading}
        className="btn-primary w-full py-3"
      >
        {isUploading ? "Processing..." : "Upload and create lesson"}
      </button>
    </form>
  );
}
