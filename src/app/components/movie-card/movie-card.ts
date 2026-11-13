import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Movie } from '../../models/movie.model';
import { MovieService } from '../../services/movie.service';
import { FavoritesService } from '../../services/favorites';
import { RatingBadge } from '../../shared/components/rating-badge/rating-badge';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink, RatingBadge],
  templateUrl: './movie-card.html',
})
export class MovieCard {
  private movieService = inject(MovieService);
  private favoritesService = inject(FavoritesService);

  movie = input.required<Movie>();

  // Is this card's movie a favorite? Updates automatically.
  isFavorite = computed(() => this.favoritesService.isFavorite(this.movie().id));

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
    this.favoritesService.toggleFavorite(this.movie());
  }
}
