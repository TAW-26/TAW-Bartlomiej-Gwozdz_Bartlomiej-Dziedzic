import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EventItem } from '../../models/api';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { LoginComponent } from '../login/login.component';

const ROLE_LABEL: Record<string, string> = {
  user: 'Użytkownik',
  organizer: 'Organizator',
  admin: 'Administrator',
};

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly user = this.auth.currentUser;
  protected readonly joinedEvents = signal<EventItem[]>([]);
  protected readonly now = signal(Date.now());

  constructor() {
    effect(() => {
      const currentUser = this.user();
      if (!currentUser) {
        this.joinedEvents.set([]);
        return;
      }

      this.loadJoinedEvents();
    });

    if (typeof window !== 'undefined') {
      const timerId = window.setInterval(() => {
        this.now.set(Date.now());
      }, 60000);

      this.destroyRef.onDestroy(() => window.clearInterval(timerId));
    }
  }

  protected get roleLabel(): string {
    return ROLE_LABEL[this.user()?.role ?? ''] ?? '';
  }

  protected get countdownEvents(): Array<EventItem & { countdownLabel: string }> {
    const now = this.now();

    return this.joinedEvents()
      .filter((event) => new Date(event.endsAt).getTime() >= now)
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
      .map((event) => ({
        ...event,
        countdownLabel: this.getCountdownLabel(event.startsAt, event.endsAt),
      }));
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/user']);
  }

  private loadJoinedEvents(): void {
    this.userService.getMyEvents().subscribe({
      next: (events) => this.joinedEvents.set(events),
      error: () => this.joinedEvents.set([]),
    });
  }

  private getCountdownLabel(startsAt: string, endsAt: string): string {
    const now = this.now();
    const startTime = new Date(startsAt).getTime();
    const endTime = new Date(endsAt).getTime();

    if (now >= startTime && now <= endTime) {
      return 'Trwa teraz';
    }

    if (now > endTime) {
      return 'Zakończone';
    }

    const remainingMinutes = Math.max(1, Math.floor((startTime - now) / 60000));

    if (remainingMinutes < 60) {
      return `Start za ${remainingMinutes} min`;
    }

    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    if (hours < 24) {
      return minutes > 0 ? `Start za ${hours} h ${minutes} min` : `Start za ${hours} h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return remainingHours > 0 ? `Start za ${days} dni ${remainingHours} h` : `Start za ${days} dni`;
  }
}
