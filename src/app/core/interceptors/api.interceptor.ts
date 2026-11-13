import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiError } from '../models/api-error.model';

// Turn a status code into a message a normal user can understand
function getFriendlyMessage(status: number): string {
  switch (status) {
    case 0:
      return 'No connection. Please check your internet and try again.';
    case 401:
      return 'Authentication error. The API key is missing or invalid.';
    case 404:
      return 'We could not find what you were looking for.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    default:
      return status >= 500
        ? 'The movie server is having problems. Please try again later.'
        : 'Something went wrong. Please try again.';
  }
}

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  // Only touch requests that go to TMDB
  if (!request.url.startsWith(environment.tmdbBaseUrl)) {
    return next(request);
  }

  // Add the API key and language to every TMDB request
  const apiRequest = request.clone({
    setParams: { api_key: environment.tmdbApiKey, language: 'en-US' },
  });

  return next(apiRequest).pipe(
    // Try again (up to 2 times) only for "too many requests" or server errors
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) =>
        error.status === 429 || error.status >= 500
          ? timer(retryCount * 1000) // wait 1 second, then 2 seconds
          : throwError(() => error),
    }),
    // If it still fails, replace the technical error with a friendly one
    catchError((error: HttpErrorResponse) =>
      throwError(() => new ApiError(getFriendlyMessage(error.status), error.status)),
    ),
  );
};
