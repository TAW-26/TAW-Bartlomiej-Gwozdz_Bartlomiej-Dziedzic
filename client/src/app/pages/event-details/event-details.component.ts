import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EVENTS, EventItem } from '../../shared/event-data';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent {
  protected readonly event: EventItem | undefined;

  constructor(route: ActivatedRoute) {
    const eventId = route.snapshot.paramMap.get('id');
    this.event = EVENTS.find((item) => item.id === eventId) ?? EVENTS[0];
  }
}
