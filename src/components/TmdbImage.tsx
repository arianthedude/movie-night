type Props = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  sizes?: string;
};

/** Plain img for TMDB — avoids Next image optimizer (often blocked / broken for image.tmdb.org). */
export function TmdbImage({ src, alt = "", className }: Props) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
  );
}
