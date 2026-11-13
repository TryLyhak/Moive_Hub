import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';

const MIN_CHARACTERS = 2; // suggestions start after 2 letters
const DEBOUNCE_MS = 400; // wait this long after the last keystroke
const MAX_SUGGESTIONS = 5;

let nextBoxId = 0; // gives every search box its own id for accessibility

@Component({
  selector: 'app-search-box',
  imports: [RouterLink],
  templateUrl: './search-box.html',
  // Listen for clicks anywhere on the page, so we can close the dropdown
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class SearchBox {
  private router = inject(Router);
  private movieService = inject(MovieService);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  // The text the box should start with (the page passes the current search)
  value = input('');
  // Put the cursor in the box when the page opens
  focusOnLoad = input(false);
  // When true, the clear button also returns to an empty /search page
  clearNavigates = input(false);

  private inputRef = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  // A linkedSignal is a normal signal that resets when "value" changes
  // (for example when the user presses the browser's Back button)
  text = linkedSignal(() => this.value());

  suggestions = signal<Movie[]>([]);
  isOpen = signal(false);
  activeIndex = signal(-1); // -1 = nothing highlighted with the keyboard
  showEmptyError = signal(false);

  listId = `search-suggestions-${nextBoxId++}`;

  private typed$ = new Subject<string>();

  constructor() {
    // Typing -> trim -> wait -> ignore repeats -> ask TMDB (cancelling older requests)
    this.typed$
      .pipe(
        map((text) => text.trim()),
        debounceTime(DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((query) =>
          query.length < MIN_CHARACTERS
            ? of<Movie[]>([])
            : this.movieService.searchMovies(query).pipe(
                map((response) => response.results.slice(0, MAX_SUGGESTIONS)),
                catchError(() => of<Movie[]>([])), // suggestions are optional: ignore errors
              ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((list) => {
        this.suggestions.set(list);
        this.activeIndex.set(-1);

        // Only open the dropdown if the user is still using this search box
        const hasFocus = this.host.nativeElement.contains(document.activeElement);
        this.isOpen.set(list.length > 0 && hasFocus);
      });

    afterNextRender(() => {
      if (this.focusOnLoad()) this.inputRef().nativeElement.focus();
    });
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.text.set(value);
    this.showEmptyError.set(false);
    this.typed$.next(value);
  }

  // Arrow keys move through the suggestions, Escape and Tab close them
  onKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;

    switch (event.key) {
      case 'ArrowDown':
        if (count === 0) return;
        event.preventDefault();
        this.isOpen.set(true);
        this.activeIndex.update((index) => (index + 1) % count);
        break;
      case 'ArrowUp':
        if (count === 0) return;
        event.preventDefault();
        this.isOpen.set(true);
        this.activeIndex.update((index) => (index <= 0 ? count - 1 : index - 1));
        break;
      case 'Escape':
      case 'Tab':
        this.isOpen.set(false);
        break;
    }
  }

  // Enter key or the form submit
  onSubmit(event: Event): void {
    event.preventDefault();

    // If a suggestion is highlighted with the keyboard, open that movie
    const highlighted = this.suggestions()[this.activeIndex()];
    if (this.isOpen() && highlighted) {
      this.closeSuggestions();
      this.router.navigate(['/movies', highlighted.id]);
      return;
    }

    this.runSearch();
  }

  // Go to the results page (also used by "See all results")
  runSearch(): void {
    const query = this.text().trim();

    // Business rule: never search when the box is empty
    if (!query) {
      this.showEmptyError.set(true);
      return;
    }

    this.closeSuggestions();
    // A new search has no "page" in the address, so pagination restarts at page 1
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  onSuggestionClick(): void {
    this.closeSuggestions();
  }

  clear(): void {
    this.text.set('');
    this.showEmptyError.set(false);
    this.closeSuggestions();
    this.inputRef().nativeElement.focus();

    if (this.clearNavigates()) {
      this.router.navigate(['/search']);
    }
  }

  onDocumentClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node | null)) {
      this.isOpen.set(false);
    }
  }

  // Hide the dropdown and cancel any suggestion request that is still waiting
  private closeSuggestions(): void {
    this.isOpen.set(false);
    this.suggestions.set([]);
    this.activeIndex.set(-1);
    this.typed$.next('');
  }

  thumbUrl(path: string | null): string {
    return this.movieService.getImageUrl(path);
  }

  year(date: string): string {
    return date?.slice(0, 4) || 'N/A';
  }
}
