import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { EventService } from '../../services/event';
import {
  CreateEventPayload,
  EventItem,
  Participant,
  UpdateEventPayload,
} from '../../models/api';

@Component({
  selector: 'app-organizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
})
export class OrganizerComponent implements OnInit {
  events: EventItem[] = [];
  loading = false;
  error: string | null = null;

  participantsMap: Record<string, Participant[]> = {};
  loadingParticipants: Record<string, boolean> = {};
  expandedParticipants: Record<string, boolean> = {};

  editingEventId: string | null = null;
  editForm: UpdateEventPayload = {};

  showCreateForm = false;
  createLoading = false;
  createForm: CreateEventPayload = this.emptyCreateForm();
  readonly pendingIds = new Set<string>();

  constructor(private readonly eventService: EventService) {}

  ngOnInit(): void {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.loading = true;
    this.error = null;
    this.eventService
      .getMyEvents()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (ev) => (this.events = ev),
        error: (err) => (this.error = err?.message ?? String(err)),
      });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) this.createForm = this.emptyCreateForm();
  }

  submitCreate(): void {
    const payload: CreateEventPayload = {
      ...this.createForm,
      startsAt: this.toISO(this.createForm.startsAt),
      endsAt: this.toISO(this.createForm.endsAt),
    };
    this.showCreateForm = false;
    this.createForm = this.emptyCreateForm();
    this.createLoading = true;
    this.eventService
      .createEvent(payload)
      .pipe(finalize(() => (this.createLoading = false)))
      .subscribe({
        next: (ev) => {
          this.events = [ev, ...this.events];
        },
        error: (err) => {
          this.showCreateForm = true;
          alert('Błąd tworzenia: ' + (err?.message ?? err));
        },
      });
  }

  startEdit(event: EventItem): void {
    this.editingEventId = event.id;
    this.editForm = {
      name: event.name,
      description: event.description,
      city: event.city,
      location: event.location,
      category: event.category,
      startsAt: event.startsAt.slice(0, 16),
      endsAt: event.endsAt.slice(0, 16),
      maxParticipants: event.maxParticipants,
      imageUrl: event.imageUrl ?? '',
      status: event.status,
    };
  }

  cancelEdit(): void {
    this.editingEventId = null;
    this.editForm = {};
  }

  submitEdit(id: string): void {
    const payload: UpdateEventPayload = {
      ...this.editForm,
      startsAt: this.editForm.startsAt ? this.toISO(this.editForm.startsAt) : undefined,
      endsAt: this.editForm.endsAt ? this.toISO(this.editForm.endsAt) : undefined,
    };
    const idx = this.events.findIndex((e) => e.id === id);
    const snapshot = idx >= 0 ? { ...this.events[idx] } : null;
    if (idx >= 0) {
      this.events = this.events.map((e) =>
        e.id === id ? { ...e, ...(payload as Partial<EventItem>) } : e,
      );
    }
    this.editingEventId = null;
    this.pendingIds.add(id);
    this.eventService.updateEvent(id, payload).pipe(finalize(() => this.pendingIds.delete(id))).subscribe({
      next: (updated) => {
        const i = this.events.findIndex((e) => e.id === id);
        if (i >= 0) this.events[i] = updated;
      },
      error: (err) => {
        if (snapshot && idx >= 0) this.events[idx] = snapshot;
        this.editingEventId = id;
        alert('Błąd edycji: ' + (err?.message ?? err));
      },
    });
  }

  deleteEvent(id: string): void {
    if (!confirm('Na pewno usunąć to wydarzenie? Operacja jest nieodwracalna.')) return;
    const saved = [...this.events];
    this.events = this.events.filter((e) => e.id !== id);
    this.eventService.deleteEvent(id).subscribe({
      error: (err) => {
        this.events = saved;
        alert('Błąd podczas usuwania: ' + (err?.message ?? err));
      },
    });
  }

  toggleParticipants(eventId: string): void {
    const wasExpanded = this.expandedParticipants[eventId];
    this.expandedParticipants[eventId] = !wasExpanded;
    if (!wasExpanded && !this.participantsMap[eventId]) {
      this.loadParticipants(eventId);
    }
  }

  loadParticipants(eventId: string): void {
    this.loadingParticipants[eventId] = true;
    this.eventService
      .getParticipants(eventId)
      .pipe(finalize(() => (this.loadingParticipants[eventId] = false)))
      .subscribe({
        next: (list) => (this.participantsMap[eventId] = list),
        error: (err) => alert('Błąd ładowania uczestników: ' + (err?.message ?? err)),
      });
  }

  removeParticipant(eventId: string, userId: string): void {
    if (!confirm('Usunąć uczestnika z wydarzenia?')) return;
    this.eventService.removeParticipant(eventId, userId).subscribe({
      next: () => {
        this.participantsMap[eventId] = this.participantsMap[eventId].filter(
          (p) => p.userId !== userId,
        );
        const idx = this.events.findIndex((e) => e.id === eventId);
        if (idx >= 0)
          this.events[idx] = {
            ...this.events[idx],
            participantsCount: this.events[idx].participantsCount - 1,
          };
      },
      error: (err) => alert('Błąd podczas usuwania uczestnika: ' + (err?.message ?? err)),
    });
  }

  private toISO(local: string): string {
    if (!local) return '';
    return new Date(local).toISOString();
  }

  private emptyCreateForm(): CreateEventPayload {
    return {
      name: '',
      description: '',
      city: '',
      location: '',
      category: '',
      startsAt: '',
      endsAt: '',
    };
  }
}
