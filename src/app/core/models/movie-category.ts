// The five movie lists TMDB offers
export type MovieCategory = 'trending' | 'popular' | 'now_playing' | 'upcoming' | 'top_rated';

export interface CategoryInfo {
  key: MovieCategory; // used in the address, e.g. /movies?category=top_rated
  label: string; // short name for the tab buttons
  title: string; // heading shown above the movies
}

// One list used by the home page rows AND the Movies page tabs
export const MOVIE_CATEGORIES: CategoryInfo[] = [
  { key: 'trending', label: 'Trending', title: '🔥 Trending This Week' },
  { key: 'popular', label: 'Popular', title: '🎬 Popular Movies' },
  { key: 'now_playing', label: 'Now Playing', title: '🍿 Now Playing' },
  { key: 'upcoming', label: 'Upcoming', title: '🎟️ Coming Soon' },
  { key: 'top_rated', label: 'Top Rated', title: '⭐ Top Rated' },
];

// Checks that text from the address is a real category (typed as a "type guard")
export function isMovieCategory(value: string | null): value is MovieCategory {
  return MOVIE_CATEGORIES.some((category) => category.key === value);
}
