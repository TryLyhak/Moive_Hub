import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, forkJoin, of, switchMap, tap } from 'rxjs';

import { MovieService } from '../../services/movie.service';
import { CastMember, CrewMember, Movie, MovieDetails, Video } from '../../models/movie.model';
import { RuntimePipe } from '../../shared/pipes/runtime.pipe';
import { RatingBadge } from '../../shared/components/rating-badge/rating-badge';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { MovieRow } from '../../components/movie-row/movie-row';
import { PersonService } from '../../services/person.service';
import { FavoritesService } from '../../services/favorites.service';
import { ApiError } from '../../models/api-error.model';
import { WatchlistService } from '../../core/services/watchlist.service';

@Component({
  selector: 'app-movie-detail',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    RuntimePipe,
    RatingBadge,
    EmptyState,
    ErrorState,
    MovieRow,
  ],
  templateUrl: './movie-detail.html',
})
export class MovieDetail {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private personService = inject(PersonService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  // public so the template can use the favorite button
  FavoritesService = inject(FavoritesService);
  watchlistService = inject(WatchlistService);

  movieId = signal(0);
  movie = signal<MovieDetails | null>(null);
  cast = signal<CastMember[]>([]);
  directors = signal<CrewMember[]>([]);
  trailer = signal<Video | null>(null);
  similar = signal<Movie[]>([]);
  recommended = signal<Movie[]>([]);

  isLoading = signal(true);
  notFound = signal(false);
  errorMessage = signal<string | null>(null);
  showTrailer = signal(false); // false = show the thumbnail, true = show the video

  directorNames = computed(() =>
    this.directors()
      .map((person) => person.name)
      .join(', '),
  );

  // The YouTube address of the trailer, marked as safe for the iframe
  trailerUrl = computed<SafeResourceUrl | null>(() => {
    const key = this.trailer()?.key;

    // Only letters, numbers, "-" and "_" are allowed, so nothing unsafe can sneak in
    if (!key || !/^[\w-]+$/.test(key)) return null;

    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0`,
    );
  });

  private loadRequest$ = new Subject<number>();

  constructor() {
    // Every time a movie id arrives, switchMap cancels the previous request
    this.loadRequest$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.notFound.set(false);
          this.errorMessage.set(null);
          this.showTrailer.set(false);
          this.movie.set(null);
        }),
        switchMap((id) => {
          // An id like "abc" or "0" can never be a real movie
          if (!Number.isInteger(id) || id <= 0) {
            this.notFound.set(true);
            return of(null);
          }

          return forkJoin({
            // The details are required: if they fail, the whole page fails
            details: this.movieService.getMovieDetails(id),
            // The rest is optional: if one fails, that section is simply hidden
            credits: this.movieService.getMovieCredits(id).pipe(catchError(() => of(null))),
            videos: this.movieService.getMovieVideos(id).pipe(catchError(() => of(null))),
            similar: this.movieService.getSimilarMovies(id).pipe(catchError(() => of(null))),
            recommended: this.movieService
              .getRecommendedMovies(id)
              .pipe(catchError(() => of(null))),
          }).pipe(
            catchError((error: Error) => {
              if (error instanceof ApiError && error.status === 404) {
                this.notFound.set(true);
              } else {
                this.errorMessage.set(error.message);
              }
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        if (data) {
          this.movie.set(data.details);
          this.cast.set(data.credits?.cast.slice(0, 12) ?? []);

          // Keep each director once (the same person can be listed twice)
          const directors = (data.credits?.crew ?? []).filter(
            (person) => person.job === 'Director',
          );
          this.directors.set([...new Map(directors.map((person) => [person.id, person])).values()]);

          this.trailer.set(this.pickTrailer(data.videos?.results ?? []));
          this.similar.set(data.similar?.results ?? []);
          this.recommended.set(data.recommended?.results ?? []);

          this.titleService.setTitle(`${data.details.title} | MovieVerse`);
        }
        this.isLoading.set(false);
      });

    // The same page is reused when you open a similar movie, so we watch the address
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id'));
      this.movieId.set(id);
      this.loadRequest$.next(id);
    });
  }

  // Used by the "Try again" button
  retry() {
    this.loadRequest$.next(this.movieId());
  }

  // Best choice first: official trailer, any trailer, then a teaser
  private pickTrailer(videos: Video[]): Video | null {
    const youtubeVideos = videos.filter((video) => video.site === 'YouTube');

    return (
      youtubeVideos.find((video) => video.type === 'Trailer' && video.official) ??
      youtubeVideos.find((video) => video.type === 'Trailer') ??
      youtubeVideos.find((video) => video.type === 'Teaser') ??
      null
    );
  }

  // The "Watch trailer" button: start the video and scroll to it
  playTrailer() {
    this.showTrailer.set(true);
    setTimeout(() => {
      document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // ----- Helpers used by the template -----

  posterUrl(path: string | null): string {
    return this.movieService.getImageUrl(path);
  }

  backdropUrl(path: string | null): string {
    return this.movieService.getBackdropUrl(path);
  }

  profileUrl(path: string | null): string {
    return this.personService.getProfileUrl(path);
  }

  trailerThumbnail(key: string): string {
    return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
  }

  companyNames(movie: MovieDetails): string {
    return movie.production_companies.map((company) => company.name).join(', ');
  }
}
