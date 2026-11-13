import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { FavoritesService } from '../../services/favorites.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { RatingBadge } from '../../shared/components/rating-badge/rating-badge';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink, RatingBadge],
  templateUrl: './movie-card.html',
})
export class MovieCard {
  private movieService = inject(MovieService);
  private favoritesService = inject(FavoritesService);
  private watchlistService = inject(WatchlistService);

  movie = input.required<Movie>();

  // These update automatically when the lists change
  isFavorite = computed(() => this.favoritesService.isFavorite(this.movie().id));
  isInWatchlist = computed(() => this.watchlistService.isInWatchlist(this.movie().id));

  get posterUrl(): string {
    return this.movieService.getImageUrl(this.movie().poster_path);
  }

  get releaseYear(): string {
    return this.movie().release_date?.slice(0, 4) || 'N/A';
  }

  toggleFavorite(event: Event): void {
    // The card is a link, so stop the click from opening the detail page
    event.preventDefault();
    event.stopPropagation();
    this.favoritesService.toggle(this.movie());
  }

  toggleWatchlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.watchlistService.toggle(this.movie());
  }
}
