"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractYouTubeVideoId } from "@/lib/youtube";

export function YouTubeLessonForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsCreating(true);

    const formData = new FormData(event.currentTarget);
    const youtubeVideoId = extractYouTubeVideoId(String(formData.get("youtubeUrl") ?? ""));
    const title = String(formData.get("title") ?? "").trim();

    if (!youtubeVideoId) {
      setError("Please enter a valid YouTube URL or video ID.");
      setIsCreating(false);
      return;
    }

    const params = new URLSearchParams({ videoId: youtubeVideoId });
    if (title) params.set("title", title);
    router.push(`/youtube/practice?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 rounded-lg p-5">
      <div>
        <label htmlFor="youtubeUrl" className="mb-2 block text-sm font-medium">
          YouTube URL
        </label>
        <input
          id="youtubeUrl"
          name="youtubeUrl"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          required
          className="field"
        />
      </div>
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Lesson title
        </label>
        <input id="title" name="title" type="text" placeholder="CNN listening practice" className="field" />
      </div>
      <p className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-muted">
        The app embeds the YouTube player and stores only your manual transcript and timestamps.
      </p>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={isCreating} className="btn-primary w-full py-3">
        {isCreating ? "Opening lesson..." : "Open YouTube practice"}
      </button>
    </form>
  );
}
