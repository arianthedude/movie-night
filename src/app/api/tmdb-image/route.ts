import { NextResponse } from "next/server";

const IMAGE_BASE = "https://image.tmdb.org/t/p";
const ALLOWED_SIZES = new Set(["w185", "w342", "w500", "w780", "original"]);

/**
 * Proxies TMDB images through this app so clients that cannot resolve
 * image.tmdb.org (common DNS blocks) still get posters.
 *
 * /api/tmdb-image?path=/abc.jpg&size=w500
 * /api/tmdb-image?url=https://image.tmdb.org/t/p/w500/abc.jpg  (legacy)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let target: URL;

  const path = searchParams.get("path");
  const size = searchParams.get("size") ?? "w500";
  const rawUrl = searchParams.get("url");

  try {
    if (path) {
      if (!path.startsWith("/") || path.includes("://") || path.includes("..")) {
        return NextResponse.json({ error: "invalid path" }, { status: 400 });
      }
      if (!ALLOWED_SIZES.has(size)) {
        return NextResponse.json({ error: "invalid size" }, { status: 400 });
      }
      target = new URL(`${IMAGE_BASE}/${size}${path}`);
    } else if (rawUrl) {
      target = new URL(rawUrl);
      if (target.protocol !== "https:" || target.hostname !== "image.tmdb.org") {
        return NextResponse.json({ error: "host not allowed" }, { status: 400 });
      }
      if (!target.pathname.startsWith("/t/p/")) {
        return NextResponse.json({ error: "path not allowed" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "path or url required" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent": "MovieNight/1.0",
      },
      next: { revalidate: 86400 },
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: "upstream failed", status: upstream.status },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    console.error("tmdb-image proxy failed", target.toString(), e);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
