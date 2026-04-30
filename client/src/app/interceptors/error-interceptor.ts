import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Determine error message based on status and response
      let errorMessage = 'Nieznąd błąd. Spróbuj ponownie.';

      if (error.error?.error) {
        // Backend error message
        errorMessage = error.error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Błędne dane. Sprawdź wpisane informacje.';
            break;
          case 401:
            errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
            authService.logout();
            void router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Brak uprawnień do tej operacji.';
            break;
          case 404:
            errorMessage = 'Zasób nie znaleziony.';
            break;
          case 409:
            errorMessage = 'Konflikt danych. Element już istnieje.';
            break;
          case 500:
            errorMessage = 'Błąd serwera. Spróbuj ponownie później.';
            break;
          case 0:
            errorMessage = 'Błąd połączenia. Sprawdź dostęp do internetu.';
            break;
        }
      }

      // Show notification for API errors
      if (req.url.includes('/api/')) {
        notificationService.error(errorMessage);
      }

      // Return the error for component-specific handling if needed
      return throwError(() => ({
        ...error,
        userMessage: errorMessage,
      }));
    }),
  );
};
