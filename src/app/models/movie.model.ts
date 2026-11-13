// One movie, with only the fields we need from TMDB
export interface Movie {
genres: any;
runtime: any;
tagline: any;
  id: number;
  title: string;
  overview: string;
  poster_path: string | null; // can be empty if the movie has no poster
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

// The response TMDB sends back for lists (popular, search, discover...)
export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// A genre such as "Action" or "Comedy"
export interface Genre {
  id: number;
  name: string;
}

// The response for the list of all genres
export interface GenreListResponse {
  genres: Genre[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
}

// A single movie with extra details (extends = has everything Movie has, plus more)
export interface MovieDetails extends Movie {
  runtime: number | null; // length in minutes
  tagline: string;
  genres: Genre[];
  vote_count: number;
  status: string; // for example "Released"
  production_companies: ProductionCompany[];
}

// An actor in a movie
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number; // 0 = main star
}

// A crew member such as the director
export interface CrewMember {
  id: number;
  name: string;
  job: string; // for example "Director"
  department: string;
  profile_path: string | null;
}

export interface Credits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

// A video such as a trailer
export interface Video {
  id: string;
  key: string; // the YouTube video id
  name: string;
  site: string; // for example "YouTube"
  type: string; // for example "Trailer"
  official: boolean;
}

export interface VideosResponse {
  id: number;
  results: Video[];
}

// Options for the Discover page filters (all optional)
export interface DiscoverFilters {
  genreId?: number;
  sortBy?: string; // for example "popularity.desc"
  year?: number;
  minRating?: number;
  page?: number;
}
