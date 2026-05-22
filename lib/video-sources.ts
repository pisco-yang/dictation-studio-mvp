export type VideoProvider = "youtube" | "bilibili";

export type VideoSource = {
  provider: VideoProvider;
  id: string;
  canonicalUrl: string;
};

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

export function extractBilibiliVideoId(input: string) {
  const value = input.trim();
  const match = value.match(/BV[0-9A-Za-z]{10}/);
  return match?.[0] ?? null;
}

export function extractVideoSource(input: string, preferredProvider?: VideoProvider): VideoSource | null {
  if (preferredProvider === "bilibili") {
    const id = extractBilibiliVideoId(input);
    return id ? { provider: "bilibili", id, canonicalUrl: `https://www.bilibili.com/video/${id}` } : null;
  }

  if (preferredProvider === "youtube") {
    const id = extractYouTubeVideoId(input);
    return id ? { provider: "youtube", id, canonicalUrl: `https://www.youtube.com/watch?v=${id}` } : null;
  }

  const bilibiliId = extractBilibiliVideoId(input);
  if (bilibiliId) {
    return { provider: "bilibili", id: bilibiliId, canonicalUrl: `https://www.bilibili.com/video/${bilibiliId}` };
  }

  const youtubeId = extractYouTubeVideoId(input);
  if (youtubeId) {
    return { provider: "youtube", id: youtubeId, canonicalUrl: `https://www.youtube.com/watch?v=${youtubeId}` };
  }

  return null;
}

export function buildEmbedUrl(provider: VideoProvider, id: string, startTime = 0, endTime?: number) {
  const start = Math.max(Math.floor(startTime), 0);

  if (provider === "youtube") {
    const params = new URLSearchParams({ rel: "0" });
    if (start > 0) params.set("start", String(start));
    if (typeof endTime === "number") params.set("end", String(Math.max(Math.ceil(endTime), start + 1)));
    if (start > 0 || typeof endTime === "number") params.set("autoplay", "1");
    return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    bvid: id,
    page: "1",
    high_quality: "1",
    danmaku: "0",
    as_wide: "1"
  });
  if (start > 0) params.set("t", String(start));
  return `https://player.bilibili.com/player.html?${params.toString()}`;
}

export function buildWatchUrl(provider: VideoProvider, id: string) {
  return provider === "youtube" ? `https://www.youtube.com/watch?v=${id}` : `https://www.bilibili.com/video/${id}`;
}
