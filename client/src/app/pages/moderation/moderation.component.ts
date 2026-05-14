import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { EventService } from '../../services/event';
import { ModerationService } from '../../services/moderation';
import { EventItem, User, UserRole } from '../../models/api';
import { UserService } from '../../services/user';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
})
export class ModerationComponent {
  private readonly eventsService = inject(EventService);
  private readonly moderationService = inject(ModerationService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  readonly events = signal<EventItem[]>([]);
  readonly loadingEvents = signal(false);
  readonly errorEvents = signal<string | null>(null);

  readonly users = signal<User[]>([]);
  readonly loadingUsers = signal(false);
  readonly errorUsers = signal<string | null>(null);

  readonly isLoading = computed(() => this.loadingEvents() || this.loadingUsers());

  constructor() {
    this.refreshData();
  }

  refreshData(): void {
    this.loadEvents();
    this.loadUsers();
  }

  private loadEvents(): void {
    this.loadingEvents.set(true);
    this.errorEvents.set(null);
    this.eventsService
      .getEvents()
      .pipe(finalize(() => this.loadingEvents.set(false)))
      .subscribe({
        next: (ev) => this.events.set(ev),
        error: (err) => this.errorEvents.set(err?.message ?? String(err)),
      });
  }

  private loadUsers(): void {
    this.loadingUsers.set(true);
    this.errorUsers.set(null);
    this.userService
      .getAllUsers()
      .pipe(finalize(() => this.loadingUsers.set(false)))
      .subscribe({
        next: (list) => this.users.set(list),
        error: (err) => this.errorUsers.set(err?.message ?? String(err)),
      });
  }

  removeEvent(id: string): void {
    const reason = prompt('Powód usunięcia (opcjonalny):', 'naruszenie zasad');
    if (reason === null) return;

    this.moderationService.removeEvent({ eventId: id, reason: reason || '' }).subscribe({
      next: () => {
        this.events.update((list) => list.filter((e) => e.id !== id));
        this.notificationService.success('Wydarzenie usunięte.');
      },
      error: (err) =>
        this.notificationService.error('Błąd podczas usuwania: ' + (err?.message ?? err)),
    });
  }

  changeUserRole(userId: string, role: UserRole): void {
    if (!confirm(`Zmień rolę użytkownika na '${role}'?`)) return;
    this.userService.changeUserRole(userId, role).subscribe({
      next: (u) => {
        this.users.update((list) => list.map((x) => (x.id === u.id ? u : x)));
        this.notificationService.success('Rola zaktualizowana.');
      },
      error: (err) =>
        this.notificationService.error('Błąd podczas aktualizacji roli: ' + (err?.message ?? err)),
    });
  }

  deleteUser(userId: string): void {
    if (!confirm('Na pewno usunąć użytkownika? Ta operacja jest nieodwracalna.')) return;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== userId));
        this.notificationService.success('Użytkownik usunięty.');
      },
      error: (err) =>
        this.notificationService.error(
          'Błąd podczas usuwania użytkownika: ' + (err?.message ?? err),
        ),
    });
  }
}
