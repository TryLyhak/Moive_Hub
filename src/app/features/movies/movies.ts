import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';

import { MovieService } from '../../core/services/movie.service';
import { Genre, Movie } from '../../core/models/movie.model';
import { MOVIE_CATEGORIES, MovieCategory, isMovieCategory } from '../../core/models/movie-category';
import { SORT_OPTIONS, SortKey, isSortKey } from '../../core/models/sort-option';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/.loading-skeleton';

const MAX_PAGE = 500; // TMDB does not allow pages above 500
const FIRST_YEAR = 1950; // the oldest year in the year dropdown
const CURRENT_YEAR = new Date().getFullYear();

// The names used in the address for each filter
type FilterKey = 'genre' | 'sort' | 'year' | 'rating';

@Component({
  selector: 'app-movies',
  imports: [RouterLink, MovieCard, LoadingSkeleton, EmptyState, ErrorState],
  templateUrl: './movies.html',
})
export class Movies {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);

  // Choices shown in the page
  categories = MOVIE_CATEGORIES;
  sortOptions = SORT_OPTIONS;
  ratingOptions = [5, 6, 7, 8, 9];
  // Next year down to 1950 (upcoming movies already have a release year)
  years = Array.from(
    { length: CURRENT_YEAR + 1 - FIRST_YEAR + 1 },
    (_, index) => CURRENT_YEAR + 1 - index,
  );

  genres = signal<Genre[]>([]);

  // The current state, read from the address (null = filter not used)
  category = signal<MovieCategory>('popular');
  genreId = signal<number | null>(null);
  sortKey = signal<SortKey | null>(null);
  year = signal<number | null>(null);
  minRating = signal<number | null>(null);
  currentPage = signal(1);

  movies = signal<Movie[]>([]);
  totalPages = signal(1);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // True when any filter is in use. Then we use TMDB "discover" instead of a category list.
  hasFilters = computed(
    () =>
      this.genreId() !== null ||
      this.sortKey() !== null ||
      this.year() !== null ||
      this.minRating() !== null,
  );

  currentCategory = computed(
    () => this.categories.find((item) => item.key === this.category()) ?? this.categories[1],
  );

  // A short text such as "Action · 2024 · 7+ rating · sorted by rating"
  filterSummary = computed(() => {
    const parts: string[] = [];

    const genre = this.genres().find((item) => item.id === this.genreId());
    if (genre) parts.push(genre.name);
    if (this.year()) parts.push(String(this.year()));
    if (this.minRating()) parts.push(`${this.minRating()}+ rating`);

    const sort = this.sortOptions.find((option) => option.key === this.sortKey());
    if (sort) parts.push(`sorted by ${sort.label.toLowerCase()}`);

    return parts.join(' · ');
  });

  private loadTrigger$ = new Subject<void>();

  constructor() {
    // The genre list fills the dropdown (the page still works if it fails)
    this.movieService.getGenres().subscribe({
      next: (response) => this.genres.set(response.genres),
      error: () => undefined,
    });

    // Every time loadMovies() is called, switchMap CANCELS the previous request,
    // so an old slow response can never replace a newer one
    this.loadTrigger$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap(() =>
          this.createRequest().pipe(
            catchError((error: Error) => {
              this.errorMessage.set(error.message);
              return of(null); // keep the stream alive after an error
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        if (response) {
          this.movies.set(response.results);
          this.totalPages.set(Math.min(response.total_pages, MAX_PAGE));
        }
        this.isLoading.set(false);
      });

    // Whenever the address changes (a filter, a tab, a page, the Back button), read it and load
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const category = params.get('category');
      const sort = params.get('sort');

      this.category.set(isMovieCategory(category) ? category : 'popular');
      this.sortKey.set(isSortKey(sort) ? sort : null);
      this.genreId.set(this.parseInteger(params.get('genre'), 1, 1_000_000));
      this.year.set(this.parseInteger(params.get('year'), FIRST_YEAR, CURRENT_YEAR + 1));
      this.minRating.set(this.parseInteger(params.get('rating'), 1, 9));
      this.currentPage.set(this.parseInteger(params.get('page'), 1, MAX_PAGE) ?? 1);

      this.loadMovies();
    });
  }

  // Turns address text into a number, or null if it is missing, not a whole number, or out of range
  private parseInteger(value: string | null, min: number, max: number): number | null {
    if (value === null || value.trim() === '') return null;

    const number = Number(value);
    return Number.isInteger(number) && number >= min && number <= max ? number : null;
  }

  // Filters in use: TMDB discover. Otherwise: the selected category list.
  private createRequest() {
    const page = this.currentPage();

    if (this.hasFilters()) {
      return this.movieService.getDiscoverMovies({
        genreId: this.genreId() ?? undefined,
        sortBy: this.sortOptions.find((option) => option.key === this.sortKey())?.value,
        year: this.year() ?? undefined,
        minRating: this.minRating() ?? undefined,
        page,
      });
    }

    return this.movieService.getMoviesByCategory(this.category(), page);
  }

  // Ask for a (re)load. Used by the address watcher and "Try again".
  loadMovies() {
    this.loadTrigger$.next();
  }

  // A dropdown changed: put the new value in the address
  onFilterChange(key: FilterKey, event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    this.router.navigate([], {
      relativeTo: this.route,
      // null removes a parameter. Changing a filter ends "category mode" and restarts at page 1.
      queryParams: { [key]: value || null, category: null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  clearFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { genre: null, sort: null, year: null, rating: null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null }, // null removes "page" for page 1
      queryParamsHandling: 'merge',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
