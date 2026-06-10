# Plik zawierający przykładowe testy POSTMAN

## Adresy bazowe

- Główny adres serwera: `http://localhost:5000`
- Główny endpoint testowy: `GET /api/health`

### Wbudowane konto administratora używane przez serwer:

- Email: `admin@local-events.app`
- Hasło: `admin1234`

## Testowe zapytania (do skopiowania i wklejenia do Postman):

### 1) Sprawdzenie działania

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/health
```

**Oczekiwana odpowiedź:**

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### 2) Rejestracja użytkownika

**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/users/register
```

**Zawartość body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "fullName": "Test User"
}
```

**Oczekiwana odpowiedź:** publiczny obiekt użytkownika z polami `id`, `email`, `fullName`, `role`, `createdAt`.

### 3) Logowanie użytkownika

**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/users/login
```

**Zawartość body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Oczekiwana odpowiedź:**

```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "fullName": "Test User",
    "role": "user",
    "createdAt": "..."
  },
  "token": "..."
}
```

### 4) Logowanie admina

**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/users/login
```

**Zawartość body:**

```json
{
  "email": "admin@local-events.app",
  "password": "admin1234"
}
```

**Oczekiwana odpowiedź:**

```json
{
  "user": {
    "id": "...",
    "email": "admin@local-events.app",
    "fullName": "System Administrator",
    "role": "admin",
    "createdAt": "..."
  },
  "token": "..."
}
```

### 5) Lista wydarzeń

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/events
```

**Przykładowe filtry:**

```
http://localhost:5000/api/events?q=Python&city=Krakow&category=Edukacja&status=open
```

```
http://localhost:5000/api/events?from=2026-04-20T16:00:00.000Z&to=2026-04-20T19:00:00.000Z
```

### 6) Szczegóły wydarzenia

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}
```

**Oczekiwana odpowiedź:**

```json
{
  "event": {
    "id": "69d8727d1e0ad4758e13bd75",
    "name": "Warsztaty Python od podstaw",
    "description": "3-godzinne warsztaty dla osob poczatkujacych. Laptop wymagany.",
    "startsAt": "2026-04-20T16:00:00.000Z",
    "endsAt": "2026-04-20T19:00:00.000Z",
    "location": "Centrum Nauki, sala A12",
    "city": "Krakow",
    "category": "Edukacja",
    "maxParticipants": 25,
    "imageUrl": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    "organizerId": "69d86fee1a90286c27e93379",
    "status": "open",
    "participantsCount": 0,
    "createdAt": "2026-04-10T03:46:05.260Z",
    "updatedAt": "2026-04-10T03:46:05.260Z"
  },
  "organizer": {
    "id": "69d86fee1a90286c27e93379",
    "email": "admin@local-events.app",
    "fullName": "System Administrator",
    "role": "admin",
    "createdAt": "2026-04-10T03:35:10.349Z"
  }
}
```

### 7) Tworzenie wydarzenia

(Wymaga roli `organizer` lub `admin`.)
**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/events
```

**Zawartość body:**

```json
{
  "name": "Spring Meetup",
  "description": "Community event for local developers.",
  "startsAt": "2026-05-01T18:00:00.000Z",
  "endsAt": "2026-05-01T20:00:00.000Z",
  "location": "Main Hall, Center 1",
  "city": "Warszawa",
  "category": "Tech",
  "maxParticipants": 50,
  "imageUrl": "https://example.com/event.png",
  "status": "open"
}
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z wcześniejszego logowania się admina.

### 8) Edycja wydarzenia

(Wymaga właściciela wydarzenia lub roli `admin`.)

**Metoda:**

```
PUT
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}
```

**Zawartość body:**

```json
{
  "description": "Updated description",
  "status": "open"
}
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z wcześniejszego logowania się admina.

### 9) Usunięcie wydarzenia

(Wymaga właściciela wydarzenia lub roli `admin`.)

**Metoda:**

```
DELETE
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}
```

Oczekiwana odpowiedź: `204 No Content`.

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z wcześniejszego logowania się admina.

### 10) Dołączenie do wydarzenia

**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}/join
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania użytkownika

### 11) Rezygnacja z wydarzenia

**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}/leave
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania użytkownika

### 12) Lista uczestników

(Wymaga właściciela wydarzenia lub roli `admin`.)

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}/participants
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina

### 13) Lista własnych wydarzeń organizatora

(Wymaga właściciela wydarzenia lub roli `admin`.)

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/events/organizer/my-events
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina

### 14) Usunięcie uczestnika z wydarzenia

(Wymaga właściciela wydarzenia lub roli `admin`.)

**Metoda:**

```
DELETE
```

**URL:**

```
http://localhost:5000/api/events/{id_wydarzenia}/participants/{id_użytkownika}
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina

### 15) Lista użytkowników jako admin

(Wymaga roli `admin`.)

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/users
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina

### 16) Lista wydarzeń zalogowanego użytkownika

(Wymaga zalogowanego użytkownika.)

**Metoda:**

```
GET
```

**URL:**

```
http://localhost:5000/api/users/me/events
```

**Oczekiwana odpowiedź:** lista wydarzeń, do których użytkownik już dołączył. Każdy element ma taki sam format jak `GET /api/events`.

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania użytkownika

### 17) Zmiana roli użytkownika

(Wymaga roli `admin`.)

**Metoda:**

```
PUT
```

**URL:**

```
http://localhost:5000/api/users/{id_użytkownika}/role
```

**Zawartość body:**

```json
{
  "role": "organizer"
}
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina

### 18) Usunięcie użytkownika

(Wymaga roli `admin`.)

**Metoda:**

```
DELETE
```

**URL:**

```
http://localhost:5000/api/users/{id_użytkownika}
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina

### 19) Moderacja usunięcia wydarzenia

(Wymaga roli `admin`.)

**Metoda:**

```
POST
```

**URL:**

```
http://localhost:5000/api/moderation/remove-event
```

**Zawartość body:**

```json
{
  "eventId": "{{id_wydarzenia}}",
  "reason": "Violation of event rules"
}
```

**Autoryzacja:**

- Otwórz zakładkę Authorization w Postman w parametrach zapytania
- Wybierz opcję bearer token z listy
- Wklej token z logowania admina
