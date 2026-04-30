import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ResourceCardComponent } from '../../components/resource-card/resource-card.component';
import { EventItem, EventStatus } from '../../models/api';
import { EventService } from '../../services/event';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { finalize } from 'rxjs/operators';

type EventSearchFilters = {
  q: FormControl<string>;
  city: FormControl<string>;
  category: FormControl<string>;
  from: FormControl<string>;
  to: FormControl<string>;
  status: FormControl<string>;
};

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [ReactiveFormsModule, ResourceCardComponent, RouterLink],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent {
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  protected readonly isOrganizer = inject(AuthService).isOrganizer;

  protected readonly filters = new FormGroup<EventSearchFilters>({
    q: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
  });

  protected readonly resources = signal<EventItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.resources.set((this.route.snapshot.data['events'] as EventItem[] | undefined) ?? []);
  }

  protected submitSearch(event?: Event): void {
    event?.preventDefault();
    this.loadEvents();
  }

  private loadEvents(): void {
    const raw = this.filters.getRawValue();
    this.loading.set(true);
    this.error.set(null);
    this.eventService
      .getEvents({
        q: raw.q || undefined,
        city: raw.city || undefined,
        category: raw.category || undefined,
        from: raw.from || undefined,
        to: raw.to || undefined,
        status: (raw.status as EventStatus) || undefined,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (events) => {
          this.resources.set(events);
          if (events.length === 0) {
            this.notificationService.info('Brak wydarzeń spełniających kryteria wyszukiwania.');
          }
        },
        error: (err: any) => {
          this.error.set('Nie udało się załadować wydarzeń.');
        },
      });
  }
}
