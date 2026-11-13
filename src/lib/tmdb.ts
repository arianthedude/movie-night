const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function apiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  return key;
}

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w342" | "w500" | "w780" | "original" = "w500",
) {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export type TmdbSearchResult = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
};

type CreditsResponse = {
  cast: { name: string; order: number }[];
  crew: { name: string; job: string }[];
};

type ImagesResponse = {
  backdrops: { file_path: string; vote_average: number }[];
};

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
};

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const data = await tmdbFetch<{ results: TmdbSearchResult[] }>("/search/movie", {
    query,
    include_adult: "false",
    language: "en-US",
  });
  return data.results.slice(0, 12);
}

export async function fetchMovieBundle(tmdbId: number) {
  const [details, credits, images] = await Promise.all([
    tmdbFetch<MovieDetails>(`/movie/${tmdbId}`, { language: "en-US" }),
    tmdbFetch<CreditsResponse>(`/movie/${tmdbId}/credits`),
    tmdbFetch<ImagesResponse>(`/movie/${tmdbId}/images`),
  ]);

  const director =
    credits.crew.find((c) => c.job === "Director")?.name ?? "";
  const cast = credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 8)
    .map((c) => c.name);

  const stills = images.backdrops
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 6)
    .map((b) => b.file_path);

  const year = details.release_date
    ? Number(details.release_date.slice(0, 4)) || null
    : null;

  return {
    tmdbId: details.id,
    title: details.title,
    overview: details.overview ?? "",
    director,
    cast,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    stills,
    releaseYear: year,
  };
}
