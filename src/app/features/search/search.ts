import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';

import { MovieService } from '../../services/movie.service';
import { Movie, MovieResponse } from '../../models/movie.model';
import { MovieCard } from '../../components/movie-card/movie-card';
import { SearchBox } from '../../shared/components/search-box/search-box';

import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/.loading-skeleton';

const MAX_PAGE = 500; // TMDB does not allow pages above 500

// What we show when there is no search text
const NO_RESULTS: MovieResponse = { page: 1, results: [], total_pages: 1, total_results: 0 };

@Component({
  selector: 'app-search',
  imports: [DecimalPipe, MovieCard, SearchBox, LoadingSkeleton, EmptyState, ErrorState],
  templateUrl: './search.html',
})
export class Search {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);

  // The search text and page live in the address: /search?q=batman&page=2
  query = signal('');
  currentPage = signal(1);

  movies = signal<Movie[]>([]);
  totalPages = signal(1);
  totalResults = signal(0);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private loadTrigger$ = new Subject<void>();

  constructor() {
    // Every time a load is requested, switchMap CANCELS the previous request,
    // so an old slow response can never replace a newer one
    this.loadTrigger$
      .pipe(
        tap(() => {
          this.errorMessage.set(null);
          this.isLoading.set(this.query() !== '');
        }),
        switchMap(() => {
          const query = this.query();

          // No text: nothing to search (this also cancels an older request)
          if (!query) return of(NO_RESULTS);

          return this.movieService.searchMovies(query, this.currentPage()).pipe(
            catchError((error: Error) => {
              this.errorMessage.set(error.message);
              return of(null); // keep the stream alive after an error
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        if (response) {
          this.movies.set(response.results);
          this.totalPages.set(Math.min(response.total_pages, MAX_PAGE));
          this.totalResults.set(response.total_results);
        }
        this.isLoading.set(false);
      });

    // Whenever the address changes (new search, next page, Back button), load again
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.query.set((params.get('q') ?? '').trim());
      this.currentPage.set(this.parsePage(params.get('page')));
      this.loadTrigger$.next();
    });
  }

  // "abc", "-3" or "0" become page 1
  private parsePage(value: string | null): number {
    const page = Number(value);
    return Number.isInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1;
  }

  // Used by the "Try again" button
  retry(): void {
    this.loadTrigger$.next();
  }

  // Change only the page in the address; the search text stays
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null }, // null removes "page" for page 1
      queryParamsHandling: 'merge',
    });
  }
}
