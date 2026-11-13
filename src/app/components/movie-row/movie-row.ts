import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Movie } from '../../models/movie.model';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-row',
  imports: [MovieCard, RouterLink],
  templateUrl: './movie-row.html',
})
export class MovieRow {
  title = input.required<string>();
  movies = input.required<Movie[]>();

  // Optional: if given, a "See all" link appears (e.g. 'top_rated')
  category = input<string | null>(null);
}
