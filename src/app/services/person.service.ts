import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { PersonDetails, PersonMovieCredits, PersonResponse } from '../models/personal.model';


@Injectable({ providedIn: 'root' })
export class PersonService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;

  getPopularPeople(page = 1): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(`${this.baseUrl}/person/popular`, { params: { page } });
  }

  searchPeople(query: string, page = 1): Observable<PersonResponse> {
    return this.http.get<PersonResponse>(`${this.baseUrl}/search/person`, {
      params: { query, page },
    });
  }

  getPersonDetails(id: number): Observable<PersonDetails> {
    return this.http.get<PersonDetails>(`${this.baseUrl}/person/${id}`);
  }

  // The movies this actor appeared in
  getPersonMovieCredits(id: number): Observable<PersonMovieCredits> {
    return this.http.get<PersonMovieCredits>(`${this.baseUrl}/person/${id}/movie_credits`);
  }

  // Actor photo: w185 is small (for lists), h632 is large (for profile pages)
  getProfileUrl(path: string | null, size: 'w185' | 'h632' = 'w185'): string {
    return path
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : 'https://placehold.co/185x278?text=No+Photo';
  }
}
