import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventItem } from '../../models/api';
import { EventService } from '../../services/event';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-event-details',
  standalone: true,
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent {
  private readonly eventService = inject(EventService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  protected readonly auth = inject(AuthService);
  protected readonly placeholderImage = '/event-placeholder.svg';

  protected readonly event = signal<EventItem | null>(null);
  protected readonly isParticipant = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (image && image.src !== this.placeholderImage) {
      image.src = this.placeholderImage;
    }
  }

  protected readonly canManageEvent = computed(() => {
    const currentEvent = this.event();
    const user = this.auth.currentUser();
    if (!currentEvent || !user) return false;
    return (
      user.role === 'admin' || (user.role === 'organizer' && currentEvent.organizerId === user.id)
    );
  });

  constructor(route: ActivatedRoute) {
    const eventId = route.snapshot.paramMap.get('id');
    if (eventId) {
      this.loading.set(true);
      this.eventService.getEventById(eventId).subscribe({
        next: (event) => {
          this.event.set(event);
          this.loading.set(false);
          this.loadParticipationStatus(event.id);
        },
        error: (err: any) => {
          this.error.set('Nie udało się załadować szczegółów wydarzenia.');
          this.loading.set(false);
        },
      });
    }
  }

  private loadParticipationStatus(eventId: string): void {
    this.userService.getMyEvents().subscribe({
      next: (events) => this.isParticipant.set(events.some((e) => e.id === eventId)),
      error: () => this.isParticipant.set(false),
    });
  }

  protected toggleParticipation(): void {
    const currentEvent = this.event();
    if (!currentEvent) return;

    if (this.isParticipant()) {
      this.eventService.leaveEvent(currentEvent.id).subscribe({
        next: () => {
          this.isParticipant.set(false);
          this.notificationService.success('Rezygnacja z wydarzenia przyjęta.');
        },
        error: (err: any) => {
          this.notificationService.error('Nie udało się zrezygnować z wydarzenia.');
        },
      });
    } else {
      this.eventService.joinEvent(currentEvent.id).subscribe({
        next: () => {
          this.isParticipant.set(true);
          this.notificationService.success('Dołączyłeś do wydarzenia!');
        },
        error: (err: any) => {
          this.notificationService.error('Nie udało się dołączyć do wydarzenia.');
        },
      });
    }
  }

  protected deleteEvent(): void {
    if (!confirm('Na pewno usunąć to wydarzenie? Operacja jest nieodwracalna.')) return;
    const currentEvent = this.event();
    if (!currentEvent) return;

    this.loading.set(true);
    this.eventService.deleteEvent(currentEvent.id).subscribe({
      next: () => {
        this.notificationService.success('Wydarzenie zostało usunięte.');
        void this.router.navigate(['/events']);
      },
      error: (err: any) => {
        this.loading.set(false);
        this.notificationService.error('Nie udało się usunąć wydarzenia.');
      },
    });
  }
}
