import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';
import { MOVIE_CATEGORIES, MovieCategory } from '../../core/models/movie-category';
import { MovieRow } from '../../shared/components/movie-row/movie-row';

import { ErrorState } from '../../shared/components/error-state/error-state';
import { RatingBadge } from '../../shared/components/rating-badge/rating-badge';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/.loading-skeleton';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MovieRow, LoadingSkeleton, ErrorState, RatingBadge],
  templateUrl:'./home.html',
})
export class Home {
  private movieService = inject(MovieService);

  // The template loops over this list to draw one row per category
  categories = MOVIE_CATEGORIES;

  // All five lists in one signal, found by category key
  lists = signal<Record<MovieCategory, Movie[]>>({
    trending: [],
    popular: [],
    now_playing: [],
    upcoming: [],
    top_rated: [],
  });

  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // The hero banner shows the first trending movie that has a backdrop image
  heroMovie = computed(() => this.lists().trending.find((movie) => movie.backdrop_path) ?? null);

  constructor() {
    this.loadMovies();
  }

  // Also used by the "Try again" button
  loadMovies() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // forkJoin runs all 5 requests at the same time and waits for all of them
    forkJoin({
      trending: this.movieService.getMoviesByCategory('trending'),
      popular: this.movieService.getMoviesByCategory('popular'),
      now_playing: this.movieService.getMoviesByCategory('now_playing'),
      upcoming: this.movieService.getMoviesByCategory('upcoming'),
      top_rated: this.movieService.getMoviesByCategory('top_rated'),
    }).subscribe({
      next: (result) => {
        this.lists.set({
          trending: result.trending.results,
          popular: result.popular.results,
          now_playing: result.now_playing.results,
          upcoming: result.upcoming.results,
          top_rated: result.top_rated.results,
        });
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  backdropUrl(path: string | null): string {
    return this.movieService.getBackdropUrl(path);
  }
}
