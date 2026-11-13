import { computed, Injectable, signal } from '@angular/core';
import { Movie, MovieDetails } from '../models/movie.model';

const STORAGE_KEY = 'movie-explorer-favorites';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
toggle(_t15: MovieDetails) {
throw new Error('Method not implemented.');
}

  private favoritesSignal = signal<Movie[]>(this.loadFormStorage());
  favorites = this.favoritesSignal.asReadonly();
  count = computed(() => this.favoritesSignal().length);

  isFavorite(id: number): boolean {
    return this.favoritesSignal().some((movie) => movie.id === id);
  }
  
  toggleFavorite(movie: Movie): void {
    if (this.isFavorite(movie.id)) {
      this.favoritesSignal.update((list) => list.filter((m) => m.id !== movie.id));
    } else {
      const simpleMovie: Movie = {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        genres: undefined,
        runtime: undefined,
        tagline: undefined
      };
      this.favoritesSignal.update((list) => [...list, simpleMovie]);
    }
    this.saveToStorage();
  }
  private loadFormStorage(): Movie[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Movie[]) : [];
    } catch {
      return [];
    }
  }
   private saveToStorage(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favoritesSignal()));
  }
}
