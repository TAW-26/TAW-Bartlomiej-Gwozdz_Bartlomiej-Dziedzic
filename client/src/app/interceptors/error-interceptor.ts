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
      let errorMessage = 'Nieznany błąd. Spróbuj ponownie.';

      if (error.error?.error) {
        // Wiadomość błędu backendu
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

      // Pokazuje powiadomienia dla błędów backendu
      if (req.url.includes('/api/')) {
        notificationService.error(errorMessage);
      }

      return throwError(() => ({
        ...error,
        userMessage: errorMessage,
      }));
    }),
  );
};
