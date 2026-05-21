import { UploadForm } from "@/components/UploadForm";
import { appConfig } from "@/lib/config";

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Create a lesson</h1>
      <p className="mt-3 text-muted">
        Upload a media file and the app will extract audio, transcribe it, split it into
        sentences, and build a dictation practice flow.
      </p>
      <div className="mt-8">
        <UploadForm maxUploadMb={appConfig.maxUploadMb} />
      </div>
    </main>
  );
}
