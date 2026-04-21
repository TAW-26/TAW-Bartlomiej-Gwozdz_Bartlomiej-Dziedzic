import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { UserComponent } from './pages/user/user.component';
import { EventsComponent } from './pages/events/events.component';

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
    path: 'user',
    component: UserComponent,
  },
];
