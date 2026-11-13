import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="flex flex-col items-center px-4 py-20 text-center">
      <span class="text-5xl" aria-hidden="true">{{ icon() }}</span>
      <h2 class="mt-4 text-xl font-semibold text-white">{{ title() }}</h2>

      @if (message()) {
        <p class="mt-2 max-w-md text-muted">{{ message() }}</p>
      }

      <!-- Anything placed between <app-empty-state> tags appears here (for example a button) -->
      <div class="mt-5">
        <ng-content />
      </div>
    </div>
  `,
})
export class EmptyState {
  icon = input('🎬');
  title = input.required<string>();
  message = input('');
}
