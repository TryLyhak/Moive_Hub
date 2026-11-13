import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';

import { MovieService } from '../../services/movie.service';
import { Movie } from '../../models/movie.model';
import { MOVIE_CATEGORIES, MovieCategory, isMovieCategory } from '../../models/movie-category';
import { MovieCard } from '../../components/movie-card/movie-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/.loading-skeleton';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MovieCard, LoadingSkeleton, EmptyState, ErrorState],
  templateUrl: './home.html',
})
export class Home {
  private movieService = inject(MovieService);
  private route = inject(ActivatedRoute);

  categories = MOVIE_CATEGORIES;
  category = signal<MovieCategory>('popular');

  // The info (label, title) of the selected category
  currentCategory = computed(
    () => this.categories.find((item) => item.key === this.category()) ?? this.categories[1],
  );

  movies = signal<Movie[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  searchText = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private searchInput$ = new Subject<string>();
  private loadTrigger$ = new Subject<void>();

  constructor() {
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
          this.totalPages.set(Math.min(response.total_pages, 500));
        }
        this.isLoading.set(false);
      });

    // The page is reused when only ?category=... changes, so we listen for changes
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const value = params.get('category');
      this.category.set(isMovieCategory(value) ? value : 'popular');
      this.currentPage.set(1);
      this.loadMovies();
    });

    // Wait 400ms after the user stops typing, then search
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((text) => {
        this.searchText.set(text.trim());
        this.currentPage.set(1);
        this.loadMovies();
      });
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  // Ask for a (re)load. Used by tabs, search, pagination and "Try again".
  loadMovies() {
    this.loadTrigger$.next();
  }

  // Search results if there is text, otherwise the selected category
  private createRequest() {
    const query = this.searchText();
    const page = this.currentPage();

    return query
      ? this.movieService.searchMovies(query, page)
      : this.movieService.getMoviesByCategory(this.category(), page);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
