import { Injectable, computed, inject, signal } from '@angular/core';

import { Movie, MovieDetails } from '../models/movie.model';
import { isStoredMovie, toStoredMovie } from '../models/collection.model';
import { StorageService } from '../core/services/storage.service';

const FAVORITES_KEY = 'moviehub_favorites';
const OLD_FAVORITES_KEY = 'movie-explorer-favorites'; // the key used before MovieVerse

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private storage = inject(StorageService);

  // The list of favorite movies, loaded when the app starts
  private favoritesSignal = signal<Movie[]>(this.loadFavorites());

  // Read-only version for components
  favorites = this.favoritesSignal.asReadonly();

  count = computed(() => this.favoritesSignal().length);

  isFavorite(id: number): boolean {
    return this.favoritesSignal().some((movie) => movie.id === id);
  }

  // Add the movie if it is not a favorite, remove it if it is
  toggle(movie: Movie): void {
    if (this.isFavorite(movie.id)) {
      this.favoritesSignal.update((list) => list.filter((item) => item.id !== movie.id));
    } else {
      this.favoritesSignal.update((list) => [...list, toStoredMovie(movie)]);
    }
    this.storage.setList(FAVORITES_KEY, this.favoritesSignal());
  }

  toggleFavorite(movie: MovieDetails): void {
    this.toggle(movie);
  }

  private loadFavorites(): Movie[] {
    const current = this.storage.getList(FAVORITES_KEY, isStoredMovie);
    if (current.length > 0) return current;

    // One-time move: copy favorites saved under the old key, then delete the old key
    const oldFavorites = this.storage.getList(OLD_FAVORITES_KEY, isStoredMovie);
    if (oldFavorites.length > 0) {
      this.storage.setList(FAVORITES_KEY, oldFavorites);
    }
    this.storage.remove(OLD_FAVORITES_KEY);

    return oldFavorites;
  }
}
