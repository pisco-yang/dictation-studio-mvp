import { NextResponse } from "next/server";
import { extractVideoSource } from "@/lib/video-sources";

type OEmbedResponse = {
  title?: string;
  author_name?: string;
};

function extractHtmlTitle(html: string) {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const namedTitle = html.match(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i)?.[1];
  const documentTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return (ogTitle ?? namedTitle ?? documentTitle ?? "")
    .replace(/_哔哩哔哩_bilibili$/i, "")
    .replace(/ - YouTube$/i, "")
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = extractVideoSource(searchParams.get("url") ?? "", searchParams.get("provider") === "bilibili" ? "bilibili" : undefined);

  if (!source) {
    return NextResponse.json({ error: "Unsupported video source." }, { status: 400 });
  }

  try {
    if (source.provider === "youtube") {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(source.canonicalUrl)}&format=json`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const data = (await response.json()) as OEmbedResponse;
        return NextResponse.json({
          provider: source.provider,
          id: source.id,
          title: data.title || `YouTube video ${source.id}`
        });
      }
    }

    const response = await fetch(source.canonicalUrl, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await response.text();
    const title = extractHtmlTitle(html);

    return NextResponse.json({
      provider: source.provider,
      id: source.id,
      title: title || `${source.provider === "bilibili" ? "Bilibili" : "YouTube"} video ${source.id}`
    });
  } catch {
    return NextResponse.json({
      provider: source.provider,
      id: source.id,
      title: `${source.provider === "bilibili" ? "Bilibili" : "YouTube"} video ${source.id}`
    });
  }
}
