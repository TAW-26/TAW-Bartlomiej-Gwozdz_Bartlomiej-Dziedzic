import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

type LoginFormModel = {
  email: FormControl<string>;
  password: FormControl<string>;
};

type RegisterFormModel = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

type FormMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private showAlert(text: string): void {
    if (typeof window !== 'undefined') {
      window.alert(text);
    }
  }

  protected mode: FormMode = 'login';
  protected isSubmitting = false;
  protected message = '';
  protected messageKind: 'success' | 'error' = 'success';

  protected get panelActionText(): string {
    return this.mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się';
  }

  protected readonly loginForm = new FormGroup<LoginFormModel>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly registerForm = new FormGroup<RegisterFormModel>({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected setMode(mode: FormMode): void {
    this.mode = mode;
    this.message = '';
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showAlert('Wypełnij poprawnie email i hasło przed zalogowaniem.');
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.auth.login(this.loginForm.getRawValue()).subscribe({
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

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.getRawValue();

    if (payload.password !== payload.confirmPassword) {
      this.messageKind = 'error';
      this.message = 'Hasła muszą być identyczne.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    this.auth.register(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.messageKind = 'success';
        this.message = 'Konto utworzone! Możesz się teraz zalogować.';
        this.setMode('login');
        this.loginForm.patchValue({ email: payload.email });
      },
      error: (err: { error?: { error?: string } }) => {
        this.isSubmitting = false;
        this.messageKind = 'error';
        this.message = err?.error?.error ?? 'Błąd rejestracji. Spróbuj ponownie.';
      },
    });
  }
}
