import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ResourceCardComponent } from '../../components/resource-card/resource-card.component';
import { EventItem, EventStatus } from '../../models/api';
import { EventService } from '../../services/event';

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
  imports: [ReactiveFormsModule, ResourceCardComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {
  private readonly eventService = inject(EventService);
  private readonly route = inject(ActivatedRoute);

  protected readonly filters = new FormGroup<EventSearchFilters>({
    q: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
  });

  protected resources: EventItem[] = [];

  constructor() {
    this.resources = (this.route.snapshot.data['events'] as EventItem[] | undefined) ?? [];
  }

  protected submitSearch(): void {
    this.loadEvents();
  }

  private loadEvents(): void {
    const raw = this.filters.getRawValue();
    this.eventService
      .getEvents({
        q: raw.q || undefined,
        city: raw.city || undefined,
        category: raw.category || undefined,
        from: raw.from || undefined,
        to: raw.to || undefined,
        status: (raw.status as EventStatus) || undefined,
      })
      .subscribe((events) => {
        this.resources = events;
      });
  }
}
