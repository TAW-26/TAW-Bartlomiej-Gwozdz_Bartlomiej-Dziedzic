import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventItem } from '../../models/api';

@Component({
  selector: 'app-resource-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './resource-card.component.html',
  styleUrls: ['./resource-card.component.scss'],
})
export class ResourceCardComponent {
  @Input({ required: true }) resource!: EventItem;
}
