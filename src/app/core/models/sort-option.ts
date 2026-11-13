// The sort choices shown to the user (the key goes in the address, e.g. ?sort=rating)
export type SortKey = 'popularity' | 'rating' | 'release';

export interface SortOption {
  key: SortKey;
  label: string;
  value: string; // the exact text TMDB expects for sort_by
}

export const SORT_OPTIONS: SortOption[] = [
  { key: 'popularity', label: 'Popularity', value: 'popularity.desc' },
  { key: 'rating', label: 'Rating', value: 'vote_average.desc' },
  { key: 'release', label: 'Release date', value: 'primary_release_date.desc' },
];

// Checks that text from the address is a real sort key
export function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}
