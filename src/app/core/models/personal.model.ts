import { Movie } from './movie.model';

// A person (actor) in a list
export interface Person {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  popularity: number;
}

export interface PersonResponse {
  page: number;
  results: Person[];
  total_pages: number;
  total_results: number;
}

// Full actor profile
export interface PersonDetails extends Person {
  biography: string;
  birthday: string | null;
  deathday: string | null; // empty if the person is still alive
  place_of_birth: string | null;
}

// A movie in an actor's filmography (a Movie plus a few extra fields)
export interface CreditMovie extends Movie {
  popularity: number;
  character: string; // the role the actor played
  adult: boolean;
}

// The movies an actor has appeared in
export interface PersonMovieCredits {
  id: number;
  cast: CreditMovie[];
}
