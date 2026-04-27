import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'events',
    component: EventsComponent,
  },
  {
    path: 'events/:id',
    component: EventDetailsComponent,
  },
  {
    path: 'user',
    component: UserComponent,
  },
];
