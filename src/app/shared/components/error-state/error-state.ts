import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  template: `
    <div class="flex flex-col items-center px-4 py-20 text-center" role="alert">
      <span class="text-5xl" aria-hidden="true">⚠️</span>
      <h2 class="mt-4 text-xl font-semibold text-white">Oops! Something went wrong</h2>
      <p class="mt-2 max-w-md text-muted">{{ message() }}</p>

      @if (showRetry()) {
        <button
          type="button"
          (click)="retry.emit()"
          class="mt-5 rounded-lg bg-accent px-5 py-2 font-semibold text-white transition hover:bg-accent-hover"
        >
          Try again
        </button>
      }
    </div>
  `,
})
export class ErrorState {
  message = input('Something went wrong. Please try again.');
  showRetry = input(true);

  // An output sends an event up to the parent (the parent decides what "retry" does)
  retry = output<void>();
}
