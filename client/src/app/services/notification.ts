import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notifications = signal<Notification[]>([]);
  private notificationCounter = 0;

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }

  private show(message: string, type: NotificationType, duration: number): void {
    const id = `notification-${++this.notificationCounter}`;
    const notification: Notification = { id, message, type, duration };

    const current = this.notifications();
    this.notifications.set([...current, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    this.notifications.update((notifications) => notifications.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}
