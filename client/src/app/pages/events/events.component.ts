import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ResourceCardComponent } from '../../components/resource-card/resource-card.component';
import { EVENTS, EventItem } from '../../shared/event-data';

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
  protected readonly filters = new FormGroup<EventSearchFilters>({
    q: new FormControl('', { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    category: new FormControl('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
    status: new FormControl('', { nonNullable: true }),
  });

  protected readonly resources: EventItem[] = EVENTS;

  protected submitSearch(): void {
    const filters = this.filters.getRawValue();
    console.log('Search filters:', filters);
  }
}
