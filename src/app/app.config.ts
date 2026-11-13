import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Scroll back to the top every time the page changes
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Every HTTP request now passes through our interceptor
    provideHttpClient(withInterceptors([apiInterceptor])),
  ],
};
