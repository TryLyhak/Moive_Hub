import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, combineLatest, of, switchMap, tap } from 'rxjs';

import { MovieService } from '../../../core/services/movie.service';
import { Genre, Movie } from '../../../core/models/movie.model';
import { SORT_OPTIONS, SortKey, isSortKey } from '../../../core/models/sort-option';
import { MovieCard } from '../../../shared/components/movie-card/movie-card';

import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { LoadingSkeleton } from '../../../shared/components/loading-skeleton/.loading-skeleton';

@Component({
  selector: 'app-genre-details',
  imports: [RouterLink, MovieCard, LoadingSkeleton, EmptyState, ErrorState],
  templateUrl: './genre-details.html',
})
export class GenreDetails {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);

  sortOptions = SORT_OPTIONS;

  genreId = signal(0);
  sortKey = signal<SortKey>('popularity');

  // TMDB has no "get one genre" endpoint, so we load the list and find ours
  genres = signal<Genre[]>([]);
  genreName = computed(
    () => this.genres().find((genre) => genre.id === this.genreId())?.name ?? '',
  );

  // True when the genres loaded but this id is not one of them (for example /genres/99999)
  isUnknownGenre = computed(
    () => this.genres().length > 0 && !this.genres().some((genre) => genre.id === this.genreId()),
  );

  // The sort option that matches the current sort key
  currentSort = computed(
    () => this.sortOptions.find((option) => option.key === this.sortKey()) ?? this.sortOptions[0],
  );

  movies = signal<Movie[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private loadTrigger$ = new Subject<void>();

  constructor() {
    // Load the genre list (we need it for the genre name)
    this.movieService.getGenres().subscribe({
      next: (response) => this.genres.set(response.genres),
      error: () => undefined, // the heading falls back to "Genre"; the movie list shows its own error
    });

    // Every time loadMovies() is called, switchMap cancels the previous request
    this.loadTrigger$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.errorMessage.set(null);
        }),
        switchMap(() =>
          this.movieService
            .getDiscoverMovies({
              genreId: this.genreId(),
              sortBy: this.currentSort().value,
              page: this.currentPage(),
            })
            .pipe(
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
          this.totalPages.set(Math.min(response.total_pages, 500));
        }
        this.isLoading.set(false);
      });

    // The page is reused when only the genre or the sort changes in the address
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, query]) => {
        this.genreId.set(Number(params.get('id')));

        const sort = query.get('sort');
        this.sortKey.set(isSortKey(sort) ? sort : 'popularity');

        this.currentPage.set(1);
        this.loadMovies();
      });
  }

  // Ask for a (re)load. Used by sorting, pagination and "Try again".
  loadMovies() {
    this.loadTrigger$.next();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
