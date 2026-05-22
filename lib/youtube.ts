export function extractYouTubeVideoId(input: string) {
  const value = input.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1).split("/")[0] || null;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/watch")) {
        return url.searchParams.get("v");
      }
      if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/")[2] || null;
      }
    }
  } catch {
    // Fall through and accept a raw 11-character YouTube ID.
  }

  return /^[a-zA-Z0-9_-]{11}$/.test(value) ? value : null;
}
