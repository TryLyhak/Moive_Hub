import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoritesService } from '../../core/services/favorite.service';
import { MovieCard } from '../../shared/components/movie-card/movie-card';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-favorites',
  imports: [MovieCard, RouterLink, EmptyState],
  templateUrl: './favorites.html',
})
export class Favorites {
  // public so the template can read favoritesService.favorites()
  favoritesService = inject(FavoritesService);
}
