import { Injectable, computed, inject, signal } from '@angular/core';

import { Movie } from '../../models/movie.model';
import { WatchlistItem, isWatchlistItem, toStoredMovie } from '../../models/collection.model';
import { StorageService } from './storage.service';

const WATCHLIST_KEY = 'movieverse_watchlist';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private storage = inject(StorageService);

  // The watchlist, loaded from the browser when the app starts
  private itemsSignal = signal<WatchlistItem[]>(
    this.storage.getList(WATCHLIST_KEY, isWatchlistItem),
  );

  // Read-only version for components
  items = this.itemsSignal.asReadonly();

  // Updates automatically whenever the list changes
  count = computed(() => this.itemsSignal().length);

  isInWatchlist(id: number): boolean {
    return this.itemsSignal().some((item) => item.id === id);
  }

  // Add the movie if it is not in the list, remove it if it is
  toggle(movie: Movie): void {
    if (this.isInWatchlist(movie.id)) {
      this.remove(movie.id);
      return;
    }

    const newItem: WatchlistItem = { ...toStoredMovie(movie), watched: false, addedAt: Date.now() };
    this.update((list) => [newItem, ...list]); // newest first
  }

  // Switch a movie between "watched" and "not watched" (it is never deleted)
  toggleWatched(id: number): void {
    this.update((list) =>
      list.map((item) => (item.id === id ? { ...item, watched: !item.watched } : item)),
    );
  }

  remove(id: number): void {
    this.update((list) => list.filter((item) => item.id !== id));
  }

  // Change the list and save it in the browser
  private update(change: (list: WatchlistItem[]) => WatchlistItem[]): void {
    this.itemsSignal.update(change);
    this.storage.setList(WATCHLIST_KEY, this.itemsSignal());
  }
}
