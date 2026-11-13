import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-rating-badge',
  imports: [DecimalPipe],
  template: `
    <span [class]="badgeClass()">
      ⭐
      @if (rating() > 0) {
        {{ rating() | number: '1.1-1' }}
      } @else {
        N/A
      }
    </span>
  `,
})
export class RatingBadge {
  // The parent gives us the rating (a number from 0 to 10)
  rating = input.required<number>();

  // Pick the text color from the rating value
  badgeClass = computed(() => {
    const base =
      'inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold ';
    const rating = this.rating();

    if (rating === 0) return base + 'text-muted';
    if (rating >= 7) return base + 'text-green-400';
    if (rating >= 5) return base + 'text-yellow-400';
    return base + 'text-red-400';
  });
}
