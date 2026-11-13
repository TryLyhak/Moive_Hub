import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MovieService } from '../../services/movie.service';
import { Genre } from '../../models/movie.model';
import { ErrorState } from '../../shared/components/error-state/error-state';

// An emoji for each genre name (unknown genres get 🎬)
const GENRE_ICONS: Record<string, string> = {
  Action: '💥',
  Adventure: '🧭',
  Animation: '🎨',
  Comedy: '😂',
  Crime: '🕵️',
  Documentary: '🎥',
  Drama: '🎭',
  Family: '👨‍👩‍👧',
  Fantasy: '🧙',
  History: '🏛️',
  Horror: '👻',
  Music: '🎵',
  Mystery: '🔍',
  Romance: '❤️',
  'Science Fiction': '🚀',
  'TV Movie': '📺',
  Thriller: '😱',
  War: '⚔️',
  Western: '🤠',
};

@Component({
  selector: 'app-genres',
  imports: [RouterLink, ErrorState],
  templateUrl: './genres.html',
})
export class Genres {
  private movieService = inject(MovieService);

  genres = signal<Genre[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // 12 empty boxes shown as a loading placeholder
  placeholders = Array.from({ length: 12 });

  constructor() {
    this.loadGenres();
  }

  // Also used by the "Try again" button
  loadGenres() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.movieService.getGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres);
        this.isLoading.set(false);
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      },
    });
  }

  iconFor(name: string): string {
    return GENRE_ICONS[name] ?? '🎬';
  }
}
