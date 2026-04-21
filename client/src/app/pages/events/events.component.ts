import { Component } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ResourceCardComponent } from '../../components/resource-card/resource-card.component';

type ResourceItem = {
  title: string;
  categories: string;
  city: string;
  location: string;
  startAt: string;
  endAt: string;
  status: string;
  description: string;
};

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

  protected readonly resources: ResourceItem[] = [
    {
      title: 'NAME',
      categories: 'Category1, category2',
      city: 'city',
      location: 'location',
      startAt: 'start at:',
      endAt: 'end at:',
      status: 'status:',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat ut orci non mattis...',
    },
    {
      title: 'NAME',
      categories: 'Category1, category2',
      city: 'city',
      location: 'location',
      startAt: 'start at:',
      endAt: 'end at:',
      status: 'status:',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat ut orci non mattis...',
    },
    {
      title: 'NAME',
      categories: 'Category1, category2',
      city: 'city',
      location: 'location',
      startAt: 'start at:',
      endAt: 'end at:',
      status: 'status:',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consequat ut orci non mattis...',
    },
  ];

  protected submitSearch(): void {
    const filters = this.filters.getRawValue();
    console.log('Search filters:', filters);
  }
}
