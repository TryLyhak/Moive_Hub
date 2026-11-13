import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FavoritesService } from '../../../services/favorites';


@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  // public so the template can show the favorites count
  favoritesService = inject(FavoritesService);

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

  toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
