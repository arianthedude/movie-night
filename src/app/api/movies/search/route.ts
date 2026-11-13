import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { searchMovies, tmdbImageUrl } from "@/lib/tmdb";

export async function GET(request: Request) {
  const { error } = await requireUser();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return jsonError("Query required");

  try {
    const results = await searchMovies(q);
    return NextResponse.json(
      results.map((r) => ({
        tmdbId: r.id,
        title: r.title,
        overview: r.overview,
        posterUrl: tmdbImageUrl(r.poster_path, "w342"),
        year: r.release_date ? r.release_date.slice(0, 4) : null,
      })),
    );
  } catch (e) {
    console.error(e);
    return jsonError("TMDB search failed", 502);
  }
}
