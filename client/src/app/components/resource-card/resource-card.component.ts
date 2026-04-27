import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventItem } from '../../shared/event-data';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './resource-card.component.html',
  styleUrl: './resource-card.component.scss',
})
export class ResourceCardComponent {
  @Input({ required: true }) resource!: EventItem;
}
