import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

const ROLE_LABEL: Record<string, string> = {
  user: 'Użytkownik',
  organizer: 'Organizator',
  admin: 'Administrator',
};

@Component({
  selector: 'app-user',
  standalone: true,
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.currentUser;

  protected get roleLabel(): string {
    return ROLE_LABEL[this.user()?.role ?? ''] ?? '';
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}