import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { NotificationContainerComponent } from './components/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeaderComponent, RouterOutlet, NotificationContainerComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected showHeader(): boolean {
    return true;
  }
}
