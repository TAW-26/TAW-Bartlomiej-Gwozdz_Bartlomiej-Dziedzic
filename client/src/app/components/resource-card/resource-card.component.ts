import { Component, Input } from '@angular/core';

export type ResourceItem = {
  title: string;
  categories: string;
  city: string;
  location: string;
  startAt: string;
  endAt: string;
  status: string;
  description: string;
};

@Component({
  selector: 'app-resource-card',
  standalone: true,
  templateUrl: './resource-card.component.html',
  styleUrl: './resource-card.component.scss',
})
export class ResourceCardComponent {
  @Input({ required: true }) resource!: ResourceItem;
}
