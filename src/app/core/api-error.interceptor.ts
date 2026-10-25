import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

/**
 * Turns every failed API call into one readable toast. The backend answers
 * errors as {"message": "..."}; status 0 means the request never reached it.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        toast.error(messageFor(error));
      }
      return throwError(() => error);
    }),
  );
};

export function messageFor(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'The API is not reachable. Check that the backend is running on port 8070.';
  }
  const message = typeof error.error === 'object' && error.error ? error.error.message : null;
  return message || `The request failed (${error.status} ${error.statusText}).`;
}
