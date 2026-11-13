import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';


import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { LoadingSkeleton } from '../../shared/components/loading-skeleton/.loading-skeleton';
import { PersonService } from '../../core/services/person.service';
import { Person } from '../../core/models/personal.model';

@Component({
  selector: 'app-actors',
  imports: [RouterLink, LoadingSkeleton, EmptyState, ErrorState],
  templateUrl: './actors.html',
})
export class Actors {
  private personService = inject(PersonService);

  people = signal<Person[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  searchText = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private searchInput$ = new Subject<string>();
  private loadTrigger$ = new Subject<void>();

  constructor() {
    // Every time loadPeople() is called, switchMap cancels the previous request
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
          this.people.set(response.results);
          this.totalPages.set(Math.min(response.total_pages, 500));
        }
        this.isLoading.set(false);
      });

    // Wait 400ms after the user stops typing, then search
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((text) => {
        this.searchText.set(text.trim());
        this.currentPage.set(1);
        this.loadPeople();
      });

    // Load the first page of popular actors
    this.loadPeople();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
  }

  // Ask for a (re)load. Used by search, pagination and "Try again".
  loadPeople() {
    this.loadTrigger$.next();
  }

  // Search results if there is text, otherwise popular actors
  private createRequest() {
    const query = this.searchText();
    const page = this.currentPage();

    return query
      ? this.personService.searchPeople(query, page)
      : this.personService.getPopularPeople(page);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadPeople();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  profileUrl(path: string | null): string {
    return this.personService.getProfileUrl(path, 'w342');
  }
}
