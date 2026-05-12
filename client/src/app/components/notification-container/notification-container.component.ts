import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          class="notification"
          [ngClass]="'notification--' + notification.type"
          [@slideIn]
          (@slideIn.done)="handleAnimationDone($event, notification.id)"
        >
          <span class="notification__message">{{ notification.message }}</span>
          <button
            class="notification__close"
            (click)="notificationService.remove(notification.id)"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .notification {
      padding: 12px 16px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      word-break: break-word;
    }

    .notification--success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .notification--error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .notification--warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .notification--info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }

    .notification__message {
      flex: 1;
      font-size: 14px;
    }

    .notification__close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      opacity: 0.7;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification__close:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 600px) {
      .notification-container {
        max-width: calc(100% - 20px);
        right: 10px;
        left: 10px;
      }
    }
  `,
})
export class NotificationContainerComponent {
  protected notificationService = inject(NotificationService);
}
