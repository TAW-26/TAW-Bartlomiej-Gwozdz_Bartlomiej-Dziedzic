import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { EventService } from '../../services/event';
import { CreateEventPayload, EventItem, Participant, UpdateEventPayload } from '../../models/api';

@Component({
  selector: 'app-organizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
})
export class OrganizerComponent {
  private readonly eventService = inject(EventService);

  readonly events = signal<EventItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly participantsMap = signal<Record<string, Participant[]>>({});
  readonly loadingParticipants = signal<Record<string, boolean>>({});
  readonly expandedParticipants = signal<Record<string, boolean>>({});

  readonly editingEventId = signal<string | null>(null);
  readonly editForm = signal<UpdateEventPayload>({});

  readonly showCreateForm = signal(false);
  readonly createLoading = signal(false);
  readonly createForm = signal<CreateEventPayload>(this.emptyCreateForm());
  readonly pendingIds = signal<Set<string>>(new Set());

  readonly isLoading = computed(() => this.loading() || this.createLoading());

  constructor() {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.loading.set(true);
    this.error.set(null);
    this.eventService
      .getMyEvents()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (ev) => this.events.set(ev),
        error: (err) => this.error.set(err?.message ?? String(err)),
      });
  }

  toggleCreateForm(): void {
    const next = !this.showCreateForm();
    this.showCreateForm.set(next);
    if (!next) this.createForm.set(this.emptyCreateForm());
  }

  submitCreate(): void {
    const payload: CreateEventPayload = {
      ...this.createForm(),
      startsAt: this.toISO(this.createForm().startsAt),
      endsAt: this.toISO(this.createForm().endsAt),
    };
    this.showCreateForm.set(false);
    this.createForm.set(this.emptyCreateForm());
    this.createLoading.set(true);
    this.eventService
      .createEvent(payload)
      .pipe(finalize(() => this.createLoading.set(false)))
      .subscribe({
        next: (ev) => this.events.update((list) => [ev, ...list]),
        error: (err) => {
          this.showCreateForm.set(true);
          alert('Błąd tworzenia: ' + (err?.message ?? err));
        },
      });
  }

  startEdit(event: EventItem): void {
    this.editingEventId.set(event.id);
    this.editForm.set({
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
    });
  }

  cancelEdit(): void {
    this.editingEventId.set(null);
    this.editForm.set({});
  }

  submitEdit(id: string): void {
    const form = this.editForm();
    const payload: UpdateEventPayload = {
      ...form,
      startsAt: form.startsAt ? this.toISO(form.startsAt) : undefined,
      endsAt: form.endsAt ? this.toISO(form.endsAt) : undefined,
    };
    const list = this.events();
    const idx = list.findIndex((e) => e.id === id);
    const snapshot = idx >= 0 ? { ...list[idx] } : null;

    this.events.update((ev) =>
      ev.map((e) => (e.id === id ? { ...e, ...(payload as Partial<EventItem>) } : e)),
    );
    this.editingEventId.set(null);
    this.pendingIds.update((s) => {
      s.add(id);
      return new Set(s);
    });

    this.eventService
      .updateEvent(id, payload)
      .pipe(
        finalize(() =>
          this.pendingIds.update((s) => {
            s.delete(id);
            return new Set(s);
          }),
        ),
      )
      .subscribe({
        next: (updated) => this.events.update((ev) => ev.map((e) => (e.id === id ? updated : e))),
        error: (err) => {
          if (snapshot && idx >= 0)
            this.events.update((ev) => ev.map((e, i) => (i === idx ? snapshot : e)));
          this.editingEventId.set(id);
          alert('Błąd edycji: ' + (err?.message ?? err));
        },
      });
  }

  deleteEvent(id: string): void {
    if (!confirm('Na pewno usunąć to wydarzenie? Operacja jest nieodwracalna.')) return;
    const saved = this.events();
    this.events.update((list) => list.filter((e) => e.id !== id));
    this.eventService.deleteEvent(id).subscribe({
      error: (err) => {
        this.events.set(saved);
        alert('Błąd podczas usuwania: ' + (err?.message ?? err));
      },
    });
  }

  toggleParticipants(eventId: string): void {
    const wasExpanded = this.expandedParticipants()[eventId];
    this.expandedParticipants.update((m) => ({ ...m, [eventId]: !wasExpanded }));
    if (!wasExpanded && !this.participantsMap()[eventId]) {
      this.loadParticipants(eventId);
    }
  }

  loadParticipants(eventId: string): void {
    this.loadingParticipants.update((m) => ({ ...m, [eventId]: true }));
    this.eventService
      .getParticipants(eventId)
      .pipe(finalize(() => this.loadingParticipants.update((m) => ({ ...m, [eventId]: false }))))
      .subscribe({
        next: (list) => this.participantsMap.update((m) => ({ ...m, [eventId]: list })),
        error: (err) => alert('Błąd ładowania uczestników: ' + (err?.message ?? err)),
      });
  }

  removeParticipant(eventId: string, userId: string): void {
    if (!confirm('Usunąć uczestnika z wydarzenia?')) return;
    this.eventService.removeParticipant(eventId, userId).subscribe({
      next: () => {
        this.participantsMap.update((m) => ({
          ...m,
          [eventId]: m[eventId].filter((p) => p.userId !== userId),
        }));
        this.events.update((list) =>
          list.map((e) =>
            e.id === eventId ? { ...e, participantsCount: e.participantsCount - 1 } : e,
          ),
        );
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
