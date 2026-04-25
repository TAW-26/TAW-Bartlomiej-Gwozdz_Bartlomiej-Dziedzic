import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
      return;
    }

    this.messageKind = 'success';
    this.message = 'Formularz logowania gotowy (logika API będzie podłączona później).';
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

    this.messageKind = 'success';
    this.message = 'Formularz rejestracji gotowy (logika API będzie podłączona później).';
  }
}
