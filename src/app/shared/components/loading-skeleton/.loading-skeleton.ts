import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  template: `
    <div
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      role="status"
      aria-label="Loading"
    >
      @for (item of items(); track item) {
        <!-- animate-pulse makes the gray boxes fade in and out -->
        <div class="animate-pulse overflow-hidden rounded-xl bg-card">
          <div class="aspect-[2/3] bg-white/10"></div>
          <div class="space-y-2 p-3">
            <div class="h-4 w-3/4 rounded bg-white/10"></div>
            <div class="h-3 w-1/3 rounded bg-white/10"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LoadingSkeleton {
  // How many placeholder cards to show (default 10)
  count = input(10);

  // Turn the number into a list so @for can loop over it: [0, 1, 2, ...]
  items = computed(() => Array.from({ length: this.count() }, (_, index) => index));
}
