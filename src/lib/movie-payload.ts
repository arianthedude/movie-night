import { z } from "zod";

export const movieBundleSchema = z.object({
  tmdbId: z.number().int().positive(),
  title: z.string().min(1).max(512),
  overview: z.string().default(""),
  director: z.string().max(256).default(""),
  cast: z
    .array(
      z.object({
        name: z.string().min(1),
        character: z.string().default(""),
        profilePath: z.string().nullable(),
      }),
    )
    .max(8)
    .default([]),
  posterPath: z.string().nullable(),
  backdropPath: z.string().nullable(),
  stills: z.array(z.string()).max(12).default([]),
  trailerKey: z.string().nullable(),
  releaseYear: z.number().int().nullable(),
});

export type MovieBundlePayload = z.infer<typeof movieBundleSchema>;
