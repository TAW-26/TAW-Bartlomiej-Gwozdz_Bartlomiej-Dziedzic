import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user.component';
import { EventsComponent } from './pages/events/events.component';
import { EventDetailsComponent } from './pages/event-details/event-details.component';
import { ModerationComponent } from './pages/moderation/moderation.component';
import { eventsResolver } from './pages/events/events.resolver';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'login',
    redirectTo: 'user',
    pathMatch: 'full',
  },
  {
    path: 'events',
    component: EventsComponent,
    resolve: {
      events: eventsResolver,
    },
  },
  {
    path: 'events/:id',
    component: EventDetailsComponent,
  },
  {
    path: 'user',
    component: UserComponent,
  },
  {
    path: 'moderation',
    component: ModerationComponent,
  },
];
