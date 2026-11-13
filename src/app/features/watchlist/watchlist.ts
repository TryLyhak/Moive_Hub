import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MovieService } from '../../core/services/movie.service';
import { WatchlistService } from '../../core/services/watchlist.service';
import { RatingBadge } from '../../shared/components/rating-badge/rating-badge';
import { EmptyState } from '../../shared/components/empty-state/empty-state';

type WatchFilter = 'all' | 'watched' | 'unwatched';

@Component({
  selector: 'app-watchlist',
  imports: [RouterLink, RatingBadge, EmptyState],
  templateUrl: './watchlist.html',
})
export class Watchlist {
  // public so the template can call watchlistService.toggleWatched(...)
  watchlistService = inject(WatchlistService);
  private movieService = inject(MovieService);

  filters: { key: WatchFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unwatched', label: 'Unwatched' },
    { key: 'watched', label: 'Watched' },
  ];

  filter = signal<WatchFilter>('all');

  watchedCount = computed(
    () => this.watchlistService.items().filter((item) => item.watched).length,
  );

  // The movies that match the selected filter
  visibleItems = computed(() => {
    const items = this.watchlistService.items();

    switch (this.filter()) {
      case 'watched':
        return items.filter((item) => item.watched);
      case 'unwatched':
        return items.filter((item) => !item.watched);
      default:
        return items;
    }
  });

  // The number shown on each filter button
  countFor(filter: WatchFilter): number {
    const total = this.watchlistService.count();

    switch (filter) {
      case 'watched':
        return this.watchedCount();
      case 'unwatched':
        return total - this.watchedCount();
      default:
        return total;
    }
  }

  posterUrl(path: string | null): string {
    return this.movieService.getImageUrl(path);
  }

  year(date: string): string {
    return date?.slice(0, 4) || 'N/A';
  }
}
