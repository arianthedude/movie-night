const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function apiKey() {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_TMDB_API_KEY is not set");
  }
  return key;
}

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500",
) {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export type CastMember = {
  name: string;
  character: string;
  profilePath: string | null;
};

export type MovieBundle = {
  tmdbId: number;
  title: string;
  overview: string;
  director: string;
  cast: CastMember[];
  posterPath: string | null;
  backdropPath: string | null;
  stills: string[];
  trailerKey: string | null;
  releaseYear: number | null;
};

export type TmdbSearchHit = {
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  year: string | null;
};

type CreditsResponse = {
  cast: {
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: { name: string; job: string }[];
};

type ImagesResponse = {
  backdrops: { file_path: string; vote_average: number }[];
};

type VideosResponse = {
  results: {
    key: string;
    site: string;
    type: string;
    official: boolean;
  }[];
};

type MovieDetails = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
};

type SearchResult = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
};

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function searchMovies(query: string): Promise<TmdbSearchHit[]> {
  const data = await tmdbFetch<{ results: SearchResult[] }>("/search/movie", {
    query,
    include_adult: "false",
    language: "en-US",
  });

  return data.results.slice(0, 12).map((r) => ({
    tmdbId: r.id,
    title: r.title,
    overview: r.overview,
    posterUrl: tmdbImageUrl(r.poster_path, "w342"),
    year: r.release_date ? r.release_date.slice(0, 4) : null,
  }));
}

function pickTrailerKey(videos: VideosResponse["results"]): string | null {
  const youtube = videos.filter((v) => v.site === "YouTube");
  const officialTrailer = youtube.find((v) => v.type === "Trailer" && v.official);
  const anyTrailer = youtube.find((v) => v.type === "Trailer");
  const teaser = youtube.find((v) => v.type === "Teaser");
  return (officialTrailer ?? anyTrailer ?? teaser)?.key ?? null;
}

export async function fetchMovieBundle(tmdbId: number): Promise<MovieBundle> {
  const [details, credits, images, videos] = await Promise.all([
    tmdbFetch<MovieDetails>(`/movie/${tmdbId}`, { language: "en-US" }),
    tmdbFetch<CreditsResponse>(`/movie/${tmdbId}/credits`),
    tmdbFetch<ImagesResponse>(`/movie/${tmdbId}/images`),
    tmdbFetch<VideosResponse>(`/movie/${tmdbId}/videos`, { language: "en-US" }),
  ]);

  const director = credits.crew.find((c) => c.job === "Director")?.name ?? "";
  const cast: CastMember[] = credits.cast
    .sort((a, b) => a.order - b.order)
    .slice(0, 5)
    .map((c) => ({
      name: c.name,
      character: c.character ?? "",
      profilePath: c.profile_path,
    }));

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
    trailerKey: pickTrailerKey(videos.results),
    releaseYear: year,
  };
}
