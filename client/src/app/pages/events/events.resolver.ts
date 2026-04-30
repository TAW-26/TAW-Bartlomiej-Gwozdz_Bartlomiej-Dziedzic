import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EventItem } from '../../models/api';
import { EventService } from '../../services/event';

export const eventsResolver: ResolveFn<EventItem[]> = () => {
  const eventService = inject(EventService);
  return eventService.getEvents();
};
