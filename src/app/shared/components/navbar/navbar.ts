import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { FavoritesService } from '../../../services/favorites.service';
import { WatchlistService } from '../../../core/services/watchlist.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  private favoritesService = inject(FavoritesService);
  private watchlistService = inject(WatchlistService);

  // Is the mobile menu open?
  isMenuOpen = signal(false);

  // Links stored in one list, so the HTML is written only once
  links = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'Genres', path: '/genres' },
    { label: 'Actors', path: '/actors' },
    { label: 'Favorites', path: '/favorites' },
    { label: 'Watchlist', path: '/watchlist' },
  ];

  // The number shown in the red badge next to a link (0 = no badge)
  countFor(path: string): number {
    if (path === '/favorites') return this.favoritesService.count();
    if (path === '/watchlist') return this.watchlistService.count();
    return 0;
  }

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
