import Link from "next/link";
import { YouTubeManualPractice } from "@/components/YouTubeManualPractice";
import { extractVideoSource, type VideoProvider } from "@/lib/video-sources";

export default async function YouTubePracticePage({
  searchParams
}: {
  searchParams: Promise<{ provider?: string; videoId?: string; title?: string }>;
}) {
  const params = await searchParams;
  const provider = params.provider === "bilibili" ? "bilibili" : "youtube";
  const source = extractVideoSource(params.videoId ?? "", provider as VideoProvider);
  const title = params.title?.trim() || "YouTube dictation practice";

  if (!source) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="glass-panel rounded-lg p-6">
          <h1 className="text-2xl font-semibold">Missing YouTube video</h1>
          <p className="mt-2 text-muted">Go back and enter a valid YouTube URL.</p>
          <Link href="/youtube" className="btn-primary mt-5 inline-flex">
            Back
          </Link>
        </div>
      </main>
    );
  }

  return <YouTubeManualPractice provider={source.provider} videoId={source.id} title={title} />;
}
