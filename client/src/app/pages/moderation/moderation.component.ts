import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { EventService } from '../../services/event';
import { ModerationService } from '../../services/moderation';
import { EventItem, User, UserRole } from '../../models/api';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.scss'],
})
export class ModerationComponent implements OnInit {
  events: EventItem[] = [];
  loading = false;
  error: string | null = null;
  users: User[] = [];
  loadingUsers = false;
  usersError: string | null = null;

  constructor(
    private readonly eventsService: EventService,
    private readonly moderationService: ModerationService,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.loadEvents();
    this.loadUsers();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;
    this.eventsService
      .getEvents()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (ev) => (this.events = ev),
        error: (err) => (this.error = err?.message ?? String(err)),
      });
  }

  loadUsers(): void {
    this.loadingUsers = true;
    this.usersError = null;
    this.userService
      .getAllUsers()
      .pipe(finalize(() => (this.loadingUsers = false)))
      .subscribe({
        next: (list) => (this.users = list),
        error: (err) => (this.usersError = err?.message ?? String(err)),
      });
  }

  removeEvent(id: string): void {
    const reason = prompt('Powód usunięcia (opcjonalny):', 'naruszenie zasad');
    if (reason === null) return;

    this.moderationService.removeEvent({ eventId: id, reason: reason || '' }).subscribe({
      next: () => {
        this.events = this.events.filter((e) => e.id !== id);
        alert('Wydarzenie usunięte.');
      },
      error: (err) => alert('Błąd podczas usuwania: ' + (err?.message ?? err)),
    });
  }

  changeUserRole(userId: string, role: UserRole): void {
    if (!confirm(`Zmień rolę użytkownika na '${role}'?`)) return;
    this.userService.changeUserRole(userId, role).subscribe({
      next: (u) => {
        const idx = this.users.findIndex((x) => x.id === u.id);
        if (idx >= 0) this.users[idx] = u;
        alert('Rola zaktualizowana.');
      },
      error: (err) => alert('Błąd podczas aktualizacji roli: ' + (err?.message ?? err)),
    });
  }

  deleteUser(userId: string): void {
    if (!confirm('Na pewno usunąć użytkownika? Ta operacja jest nieodwracalna.')) return;
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== userId);
        alert('Użytkownik usunięty.');
      },
      error: (err) => alert('Błąd podczas usuwania użytkownika: ' + (err?.message ?? err)),
    });
  }
}
