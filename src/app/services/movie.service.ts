import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieCategory } from '../models/movie-category';

import { environment } from '../../environments/environment';
import {
  Credits,
  DiscoverFilters,
  GenreListResponse,
  MovieDetails,
  MovieResponse,
  VideosResponse,
} from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;

  // One helper for every API call (the interceptor adds the API key)
  private get<T>(path: string, params: Record<string, string | number> = {}): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params });
  }

  // ----- Movie lists -----

  getTrending(timeWindow: 'day' | 'week' = 'week', page = 1): Observable<MovieResponse> {
    return this.get<MovieResponse>(`/trending/movie/${timeWindow}`, { page });
  }

  getPopularMovies(page = 1): Observable<MovieResponse> {
    return this.get<MovieResponse>('/movie/popular', { page });
  }

  getNowPlaying(page = 1): Observable<MovieResponse> {
    return this.get<MovieResponse>('/movie/now_playing', { page });
  }

  getUpcoming(page = 1): Observable<MovieResponse> {
    return this.get<MovieResponse>('/movie/upcoming', { page });
  }

  getTopRated(page = 1): Observable<MovieResponse> {
    return this.get<MovieResponse>('/movie/top_rated', { page });
  }

  searchMovies(query: string, page = 1): Observable<MovieResponse> {
    return this.get<MovieResponse>('/search/movie', { query, page });
  }

  // ----- One movie -----

  getMovieDetails(id: number): Observable<MovieDetails> {
    return this.get<MovieDetails>(`/movie/${id}`);
  }

  getMovieCredits(id: number): Observable<Credits> {
    return this.get<Credits>(`/movie/${id}/credits`);
  }

  getMovieVideos(id: number): Observable<VideosResponse> {
    return this.get<VideosResponse>(`/movie/${id}/videos`);
  }

  getSimilarMovies(id: number): Observable<MovieResponse> {
    return this.get<MovieResponse>(`/movie/${id}/similar`);
  }

  getRecommendedMovies(id: number): Observable<MovieResponse> {
    return this.get<MovieResponse>(`/movie/${id}/recommendations`);
  }

  // ----- Genres and filters -----

  getGenres(): Observable<GenreListResponse> {
    return this.get<GenreListResponse>('/genre/movie/list');
  }

  // One method for all five lists, so pages don't need to know each endpoint
  getMoviesByCategory(category: MovieCategory, page = 1): Observable<MovieResponse> {
    switch (category) {
      case 'trending':
        return this.getTrending('week', page);
      case 'popular':
        return this.getPopularMovies(page);
      case 'now_playing':
        return this.getNowPlaying(page);
      case 'upcoming':
        return this.getUpcoming(page);
      case 'top_rated':
        return this.getTopRated(page);
    }
  }

  // Movies filtered by genre, year, rating and sort order
  getDiscoverMovies(filters: DiscoverFilters = {}): Observable<MovieResponse> {
    const sortBy = filters.sortBy ?? 'popularity.desc';
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      sort_by: sortBy,
    };

    if (filters.genreId) params['with_genres'] = filters.genreId;
    if (filters.year) params['primary_release_year'] = filters.year;
    if (filters.minRating) {
      params['vote_average.gte'] = filters.minRating;
      // Ignore movies with only a few votes, so the rating means something
      params['vote_count.gte'] = 100;
    }

    // When sorting by rating, ignore movies with only a few votes
    // When sorting by release date, hide movies that are not released yet
    if (sortBy.startsWith('primary_release_date')) {
      params['primary_release_date.lte'] = new Date().toISOString().slice(0, 10);
    }

    return this.get<MovieResponse>('/discover/movie', params);
  }

  // ----- Images -----

  // Poster image (small, portrait)
  getImageUrl(path: string | null): string {
    return path
      ? `${environment.tmdbImageUrl}${path}`
      : 'https://placehold.co/500x750?text=No+Image';
  }

  // Backdrop image (large, wide)
  getBackdropUrl(path: string | null): string {
    return path ? `${environment.tmdbBackdropUrl}${path}` : '';
  }
}
