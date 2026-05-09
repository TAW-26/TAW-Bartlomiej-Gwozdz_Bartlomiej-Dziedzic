# Frontend Unit Tests

## Przegląd

Testy frontendu sprawdzają poprawność komunikacji serwisów Angulara z backendem. Weryfikują:

- Poprawne HTTP metody (GET, POST, PUT, DELETE)
- Poprawne URL endpointów
- Poprawne payloady requestów
- Poprawne mapowanie i obsługa odpowiedzi

## Gdzie są testy?

```
client/src/app/
├── services/
│   ├── auth.spec.ts               (2 unit testy)
│   ├── auth.integration.spec.ts   (2 integration testy)
│   ├── event.spec.ts              (8 unit testów)
│   ├── user.spec.ts               (4 unit testy)
│   └── moderation.spec.ts          (1 unit test)
├── interceptors/
│   └── auth-interceptor.spec.ts   (1 unit test)
└── app.spec.ts                     (2 unit testy)
```

**Razem: 20 testów**

## Jak uruchomić?

```bash
cd client

# Wszystkie testy (unit + integration)
npm test -- --watch=false

# Testy z watchem (auto-reload na zmianę)
npm test
```

## Co testują poszczególne pliki?

### **auth.spec.ts** — AuthService Unit Tests

Testuje logikę rejestracji i logowania:

| Test                                                     | Co sprawdza                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `should send register payload to the backend`            | POST `/api/users/register` z poprawnym payloadem            |
| `should send login payload and store the returned token` | POST `/api/users/login` i zapisanie tokenu w `localStorage` |

```typescript
// Przykład
service.register({
  email: 'new@example.com',
  password: 'secret123',
  confirmPassword: 'secret123',
  fullName: 'New User'
}).subscribe(...)

// Oczekuje: POST /api/users/register z tym payloadem
```

### **auth.integration.spec.ts** — AuthService Integration Tests

Testuje rzeczywiste połączenie z backendem (wymaga uruchomionego serwera na :3000):

| Test                                                              | Co sprawdza                               |
| ----------------------------------------------------------------- | ----------------------------------------- |
| `should fail to register with invalid data if backend rejects it` | Backend zwraca błąd na nieprawidłowe dane |
| `should fail to login with wrong credentials`                     | Backend zwraca 401/404 na błędne hasło    |

**Uwaga:** Te testy mogą się zwieść, jeśli backend nie słucha na `http://localhost:3000`.

### **event.spec.ts** — EventService Unit Tests

Testuje wszystkie operacje na eventach:

| Test                                                | Endpoint                                                    |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `should request events with query params`           | GET `/api/events?q=demo&city=Warszawa&status=open`          |
| `should map getEventById response`                  | GET `/api/events/{id}`                                      |
| `should create an event`                            | POST `/api/events`                                          |
| `should update an event`                            | PUT `/api/events/{id}`                                      |
| `should delete an event`                            | DELETE `/api/events/{id}`                                   |
| `should join and leave an event`                    | POST `/api/events/{id}/join`, POST `/api/events/{id}/leave` |
| `should load participants and remove a participant` | GET/DELETE `/api/events/{id}/participants`                  |
| `should load organizer events`                      | GET `/api/events/organizer/my-events`                       |

### **user.spec.ts** — UserService Unit Tests

Testuje zarządzanie użytkownikami:

| Test                                        | Endpoint                   |
| ------------------------------------------- | -------------------------- |
| `should request all users from the backend` | GET `/api/users`           |
| `should change a user role`                 | PUT `/api/users/{id}/role` |
| `should delete a user`                      | DELETE `/api/users/{id}`   |
| `should request the logged-in users events` | GET `/api/users/me/events` |

### **moderation.spec.ts** — ModerationService Unit Tests

Testuje moderację:

| Test                                               | Endpoint                            |
| -------------------------------------------------- | ----------------------------------- |
| `should call the moderation remove-event endpoint` | POST `/api/moderation/remove-event` |

### **auth-interceptor.spec.ts** — Auth Interceptor Test

Testuje czy interceptor jest prawidłowo zarejstrowany (podstawowy test).

### **app.spec.ts** — Root Component Tests

Testuje główny komponent aplikacji:

| Test                    | Co sprawdza                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `should create the app` | Komponent się tworzy                                            |
| `should render title`   | Nagłówek wyświetla "Aplikacja do obsługi gebeurteneń lokalnych" |

## Jak działają testy unit?

```typescript
beforeEach(() => {
  // Konfiguracja: HttpTestingController mockuje wszystkie HTTP requesty
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
});

it('should create an event', () => {
  const payload = { name: 'Event', ... };

  // 1. Wywołujemy serwis
  service.createEvent(payload).subscribe((response) => {
    expect(response).toEqual(mockEvent);
  });

  // 2. Sprawdzamy, czy poprawny request został wysłany
  const request = httpMock.expectOne('/api/events');
  expect(request.request.method).toBe('POST');
  expect(request.request.body).toEqual(payload);

  // 3. Mockujemy odpowiedź backendu
  request.flush(mockEvent);
});

afterEach(() => {
  // Weryfikujemy, że nie było żadnych "wiszących" requestów
  httpMock.verify();
});
```

## Wynik testów

```
✓ Test Files  7 passed (7)
✓ Tests  20 passed (20)
```

Jeśli by jakiś test padł, widzielibyśmy:

```
✗ Test Files  1 failed | 6 passed
✗ Tests  1 failed | 19 passed

⎯⎯⎯⎯⎯ Failed Tests ⎯⎯⎯⎯⎯
 FAIL  src/app/services/event.spec.ts > should create an event
AssertionError: expected {...} to equal {...}
```

## Notatki

- **Unit testy** (`*.spec.ts`) zawsze przechodzą, bo mockują HTTP
- **Integration testy** (`*.integration.spec.ts`) wymuszają rzeczywiste połączenie z backendem
- Brak backendu = integration testy zobaczą `status: 0` (ECONNREFUSED)
- Wszystkie testy są niezależne — nie wymagają określonej kolejności uruchomienia
