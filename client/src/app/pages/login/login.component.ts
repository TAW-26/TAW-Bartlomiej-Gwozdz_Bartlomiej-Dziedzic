import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginPayload, RegisterPayload } from '../../models/api';
import { AuthService } from '../../services/auth';
import { LoginFormComponent } from './login-form/login-form.component';
import { RegisterFormComponent } from './register-form/register-form.component';

type FormMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, RegisterFormComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private showAlert(text: string): void {
    if (typeof window !== 'undefined') {
      window.alert(text);
    }
  }

  protected mode: FormMode = 'login';
  protected isSubmitting = false;
  protected message = '';
  protected messageKind: 'success' | 'error' = 'success';
  protected loginEmail = '';

  protected get panelActionText(): string {
    return this.mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się';
  }

  protected setMode(mode: FormMode): void {
    this.mode = mode;
    this.message = '';
  }

  ngOnInit(): void {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    if (mode === 'register') this.mode = 'register';
    const prefillEmail = this.route.snapshot.queryParamMap.get('email');
    if (prefillEmail) this.loginEmail = prefillEmail;
  }

  protected submitLogin(payload: LoginPayload): void {
    this.isSubmitting = true;
    this.message = '';

    this.auth.login(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showAlert('Logowanie udane. Przekierowuję do panelu użytkownika.');
        void this.router.navigate(['/user']);
      },
      error: (err: { status?: number; error?: { error?: string } }) => {
        this.isSubmitting = false;
        this.messageKind = 'error';
        const backendMessage = err?.error?.error;
        this.message =
          err?.status === 401
            ? 'Błędny email lub hasło.'
            : (backendMessage ?? 'Błąd logowania. Sprawdź dane i spróbuj ponownie.');
        this.showAlert(`Logowanie nieudane: ${this.message}`);
      },
    });
  }

  protected submitRegister(payload: RegisterPayload): void {
    if (payload.password !== payload.confirmPassword) {
      this.messageKind = 'error';
      this.message = 'Hasła muszą być identyczne.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.auth.register(payload).subscribe({
      next: () => {
        // after successful registration, attempt to log the user in immediately
        this.auth.login({ email: payload.email, password: payload.password }).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.showAlert(
              'Rejestracja i logowanie powiodły się. Przekierowuję do panelu użytkownika.',
            );
            void this.router.navigate(['/user']);
          },
          error: () => {
            // registration succeeded but automatic login failed
            this.isSubmitting = false;
            this.messageKind = 'error';
            this.message =
              'Rejestracja zakończona, ale automatyczne logowanie nie powiodło się. Proszę zalogować się ręcznie.';
            this.setMode('login');
            this.loginEmail = payload.email;
          },
        });
      },
      error: (err: { error?: { error?: string } }) => {
        this.isSubmitting = false;
        this.messageKind = 'error';
        this.message = err?.error?.error ?? 'Błąd rejestracji. Spróbuj ponownie.';
      },
    });
  }
}
