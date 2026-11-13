import { Movie } from './movie.model';

// A movie saved in the watchlist
export interface WatchlistItem extends Movie {
  watched: boolean; // has the user watched it?
  addedAt: number; // when it was added (milliseconds), used to show the newest first
}

// Keep only the fields we need, so we store small data
export function toStoredMovie(movie: Movie): Movie {
  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
  };
}

// Data from the browser can be anything, so we check it before trusting it
export function isStoredMovie(value: unknown): value is Movie {
  if (typeof value !== 'object' || value === null) return false;

  const item = value as Record<string, unknown>;
  return (
    typeof item['id'] === 'number' &&
    typeof item['title'] === 'string' &&
    typeof item['vote_average'] === 'number'
  );
}

export function isWatchlistItem(value: unknown): value is WatchlistItem {
  if (!isStoredMovie(value)) return false;

  const item = value as unknown as Record<string, unknown>;
  return typeof item['watched'] === 'boolean';
}
