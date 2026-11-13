import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, catchError, forkJoin, of, switchMap, tap } from 'rxjs';

import { PersonService } from '../../../core/services/person.service';
import { PersonDetails, CreditMovie } from '../../../core/models/personal.model';
import { MovieRow } from '../../../shared/components/movie-row/movie-row';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../../shared/components/error-state/error-state';
import { ApiError } from '../../../core/models/api-error.model';

// How many movies to show before the "Show all" button
const FILMOGRAPHY_PREVIEW = 15;
// A biography longer than this gets a "Read more" button
const LONG_BIOGRAPHY = 600;

@Component({
  selector: 'app-actor-details',
  imports: [RouterLink, DatePipe, MovieRow, EmptyState, ErrorState],
  templateUrl: './actor-details.html',
})
export class ActorDetails {
  private route = inject(ActivatedRoute);
  private personService = inject(PersonService);
  private titleService = inject(Title);

  readonly previewSize = FILMOGRAPHY_PREVIEW;

  personId = signal(0);
  person = signal<PersonDetails | null>(null);
  movies = signal<CreditMovie[]>([]); // the filmography, newest first

  isLoading = signal(true);
  notFound = signal(false);
  errorMessage = signal<string | null>(null);
  isBioExpanded = signal(false);
  showAllMovies = signal(false);

  // The 10 most popular movies that have a poster
  knownFor = computed(() =>
    this.movies()
      .filter((movie) => movie.poster_path)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10),
  );

  // Show only the first few movies until the user asks for all of them
  visibleMovies = computed(() =>
    this.showAllMovies() ? this.movies() : this.movies().slice(0, FILMOGRAPHY_PREVIEW),
  );

  isLongBio = computed(() => (this.person()?.biography.length ?? 0) > LONG_BIOGRAPHY);

  // Age today (or age at death), or null if we don't know the birthday
  age = computed(() => {
    const person = this.person();
    return person?.birthday ? this.calculateAge(person.birthday, person.deathday) : null;
  });

  private loadRequest$ = new Subject<number>();

  constructor() {
    // Every time an actor id arrives, switchMap cancels the previous request
    this.loadRequest$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.notFound.set(false);
          this.errorMessage.set(null);
          this.isBioExpanded.set(false);
          this.showAllMovies.set(false);
          this.person.set(null);
        }),
        switchMap((id) => {
          // An id like "abc" or "0" can never be a real actor
          if (!Number.isInteger(id) || id <= 0) {
            this.notFound.set(true);
            return of(null);
          }

          return forkJoin({
            // The profile is required: if it fails, the whole page fails
            details: this.personService.getPersonDetails(id),
            // The filmography is optional: if it fails, that section is hidden
            credits: this.personService.getPersonMovieCredits(id).pipe(catchError(() => of(null))),
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
          this.person.set(data.details);
          this.movies.set(this.buildFilmography(data.credits?.cast ?? []));
          this.titleService.setTitle(`${data.details.name} | MovieVerse`);
        }
        this.isLoading.set(false);
      });

    // The same page is reused when the address changes, so we watch it
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = Number(params.get('id'));
      this.personId.set(id);
      this.loadRequest$.next(id);
    });
  }

  // Used by the "Try again" button
  retry() {
    this.loadRequest$.next(this.personId());
  }

  // Remove adult titles and duplicates (the same movie can be listed twice), newest first
  private buildFilmography(cast: CreditMovie[]): CreditMovie[] {
    const unique = [
      ...new Map(cast.filter((movie) => !movie.adult).map((movie) => [movie.id, movie])).values(),
    ];

    // Movies without a date go to the end
    return unique.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
  }

  // Dates look like "1963-12-18". We compare the numbers directly to avoid time zone problems.
  private calculateAge(birthday: string, deathday: string | null): number {
    const [birthYear, birthMonth, birthDay] = birthday.split('-').map(Number);

    const today = new Date();
    const [endYear, endMonth, endDay] = deathday
      ? deathday.split('-').map(Number)
      : [today.getFullYear(), today.getMonth() + 1, today.getDate()];

    let age = endYear - birthYear;
    // The birthday has not happened yet this year
    if (endMonth < birthMonth || (endMonth === birthMonth && endDay < birthDay)) {
      age--;
    }
    return age;
  }

  photoUrl(path: string | null): string {
    return this.personService.getProfileUrl(path, 'h632');
  }
}
