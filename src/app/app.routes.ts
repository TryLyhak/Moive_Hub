import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'MovieVerse',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  {
    // Your existing search + pagination page (becomes the full Discover page later)
    path: 'movies',
    title: 'Movies | MovieVerse',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'movies/:id',
    title: 'Movie Details | MovieVerse',
    loadComponent: () => import('./pages/movie-detail/movie-detail').then((m) => m.MovieDetail),
  },
  {
    path: 'search',
    title: 'Search | MovieVerse',
    loadComponent: () => import('./features/search/search').then((m) => m.Search),
  },
  {
    path: 'genres',
    title: 'Genres | MovieVerse',
    loadComponent: () => import('./features/genres/genres').then((m) => m.Genres),
  },
  {
    path: 'genres/:id',
    title: 'Genre | MovieVerse',
    loadComponent: () =>
      import('./features/genres/genre-details/genre-details').then((m) => m.GenreDetails),
  },
  {
    path: 'actors',
    title: 'Actors | MovieVerse',
    loadComponent: () => import('./features/actors/actors').then((m) => m.Actors),
  },
  {
    path: 'actors/:id',
    title: 'Actor | MovieVerse',
    loadComponent: () =>
      import('./features/actors/actor-details/actor-details').then((m) => m.ActorDetails),
  },
  {
    path: 'favorites',
    title: 'Favorites | MovieVerse',
    loadComponent: () => import('./pages/favorites/favorites').then((m) => m.Favorites),
  },
  {
    path: 'watchlist',
    title: 'Watchlist | MovieVerse',
    loadComponent: () => import('./features/watchlist/watchlist').then((m) => m.Watchlist),
  },

  // Old addresses still work: they redirect to the new ones
  { path: 'movie/:id', redirectTo: 'movies/:id' },
  { path: 'browse', redirectTo: 'movies' },

  {
    // ** matches any address we did not define above
    path: '**',
    title: 'Page Not Found | MovieVerse',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
