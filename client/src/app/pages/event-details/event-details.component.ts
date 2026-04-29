import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventItem } from '../../models/api';
import { EventService } from '../../services/event';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-event-details',
  standalone: true,
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss'],
})
export class EventDetailsComponent {
  private readonly eventService = inject(EventService);
  protected readonly auth = inject(AuthService);

  protected readonly event = signal<EventItem | null>(null);
  protected readonly isParticipant = signal(false);

  constructor(route: ActivatedRoute) {
    const eventId = route.snapshot.paramMap.get('id');
    if (eventId) {
      this.eventService.getEventById(eventId).subscribe({
        next: (event) => this.event.set(event),
      });
    }
  }

  protected toggleParticipation(): void {
    const currentEvent = this.event();
    if (!currentEvent) return;

    if (this.isParticipant()) {
      this.eventService.leaveEvent(currentEvent.id).subscribe({
        next: () => this.isParticipant.set(false),
      });
    } else {
      this.eventService.joinEvent(currentEvent.id).subscribe({
        next: () => this.isParticipant.set(true),
      });
    }
  }
}
