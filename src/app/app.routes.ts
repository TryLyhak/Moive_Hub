import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'MovieHUB',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'movies',
    title: 'Movies | MovieHUB',
    loadComponent: () => import('./features/movies/movies').then((m) => m.Movies),
  },
  {
    path: 'movies/:id',
    title: 'Movie Details | MovieHUB',
    loadComponent: () =>
      import('./features/movie-detail/movie-detail').then((m) => m.MovieDetail),
  },
  {
    path: 'search',
    title: 'Search | MovieHUB',
    loadComponent: () => import('./features/search/search').then((m) => m.Search),
  },
  {
    path: 'genres',
    title: 'Genres | MovieHUB',
    loadComponent: () => import('./features/genres/genres').then((m) => m.Genres),
  },
  {
    path: 'genres/:id',
    title: 'Genre | MovieHUB',
    loadComponent: () =>
      import('./features/genres/genre-details/genre-details').then((m) => m.GenreDetails),
  },
  {
    path: 'actors',
    title: 'Actors | MovieHUB',
    loadComponent: () => import('./features/actors/actors').then((m) => m.Actors),
  },
  {
    path: 'actors/:id',
    title: 'Actor | MovieHUB',
    loadComponent: () =>
      import('./features/actors/actor-details/actor-details').then((m) => m.ActorDetails),
  },
  {
    path: 'favorites',
    title: 'Favorites | MovieHUB',
    loadComponent: () => import('./features/favorites/favorites').then((m) => m.Favorites),
  },
  {
    path: 'watchlist',
    title: 'Watchlist | MovieHUB',
    loadComponent: () => import('./features/watchlist/watchlist').then((m) => m.Watchlist),
  },

  // Old addresses still work: they redirect to the new ones
  { path: 'movie/:id', redirectTo: 'movies/:id' },
  { path: 'browse', redirectTo: 'movies' },

  {
    // ** matches any address we did not define above
    path: '**',
    title: 'Page Not Found | MovieHUB',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
