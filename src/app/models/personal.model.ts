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
  place_of_birth: string | null;
}

// The movies an actor has appeared in
export interface PersonMovieCredits {
  id: number;
  cast: Movie[];
}
