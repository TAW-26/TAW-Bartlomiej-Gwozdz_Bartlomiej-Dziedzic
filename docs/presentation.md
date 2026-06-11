# Plan prezentacji projektu — Aplikacja do organizacji wydarzeń lokalnych

## Realizatorzy

- Bartłomiej Gwóźdź – 37685
- Bartłomiej Dziedzic – 37677

---

## 1. Cel i zakres projektu

- Aplikacja webowa do tworzenia, zarządzania i przeglądania wydarzeń lokalnych (koncerty, warsztaty, konferencje, inicjatywy społeczne).
- Łączy organizatorów z uczestnikami, umożliwia wyszukiwanie wydarzeń po nazwie, lokalizacji i dacie.
- Role w systemie: anonimowy użytkownik, zalogowany użytkownik, organizator, administrator (RBAC).
- Szczegółowy opis: [topic_selection.md](topic_selection.md), pełna lista przypadków użycia: [USE_CASES.md](USE_CASES.md).

---

## 2. Architektura systemu

- **Frontend:** Angular (`client/`)
- **Backend:** Node.js + Express (`server/`)
- **Baza danych:** MongoDB
- **Autentykacja:** JWT, **autoryzacja:** RBAC
- **Monitoring:** Prometheus + Grafana (`monitoring/`)
- Diagramy: [ERD.png](ERD.png), [UML.png](UML.png)
- **Dwa tryby uruchomienia, oba przez `docker compose up --build`:**
  - `main` (dev) — frontend serwowany przez dev-server Angulara (`ng serve` + proxy do backendu)
  - `docker-production` (prod) — frontend budowany i serwowany jako Angular SSR (`ng build` → `node dist/client/server/server.mjs`)
  - Backend, Prometheus i Grafana skonfigurowane tak samo na obu gałęziach

---

## 3. Live demo

### 3.1 Wersja deweloperska (gałąź `main`)

1. Uruchomienie: `docker compose up --build` na gałęzi `main`.
2. Pokazanie adresów:
   - Frontend: `http://localhost:4200`
   - Backend: `http://localhost:5000` (`/api/health`, `/metrics`)
   - Prometheus: `http://localhost:9090`
   - Grafana: `http://localhost:3001` (login `admin`/`admin`, dashboard "TAW Backend Monitoring")
3. Scenariusz funkcjonalny:
   - Przeglądanie listy wydarzeń jako użytkownik anonimowy (UC01, UC02, UC03)
   - Rejestracja / logowanie użytkownika (UC04)
   - Podgląd profilu użytkownika (endpoint `/me`)
   - Zapis na wydarzenie jako zalogowany użytkownik
   - Tworzenie/edycja wydarzenia jako organizator
   - Panel moderacji/administracji (zarządzanie użytkownikami i wydarzeniami)
4. Pokazanie monitoringu na żywo:
   - Wygenerowanie kilku requestów i podgląd metryk w Prometheus (`/metrics`)
   - Dashboard Grafany — czas odpowiedzi, liczba requestów, oznaczanie wolnych odpowiedzi

### 3.2 Wersja produkcyjna (gałąź `docker-production`)

1. Przełączenie: `git checkout docker-production`
2. Uruchomienie: `docker compose up --build` (te same adresy co w wersji dev)
3. Pokazanie różnic względem wersji dev:
   - **Frontend** — zamiast dev-servera Angulara z proxy (`ng serve --proxy-config proxy.conf.docker.json`) działa zbudowana aplikacja SSR: multi-stage build (`ng build`), runtime z `NODE_ENV=production`, `npm ci --omit=dev`, uruchamiany przez `node dist/client/server/server.mjs`, łączący się z backendem przez zmienną `BACKEND_URL=http://backend:5000`
   - **Backend, Prometheus, Grafana** — bez zmian względem dev (ten sam multi-stage Dockerfile i konfiguracja monitoringu)
4. Krótkie porównanie: ten sam zestaw funkcjonalności co w demo na `main`, ale frontend działa jako zbudowana aplikacja produkcyjna (SSR) zamiast dev-servera.

---

## 4. Testy

- Backend: `cd server && npm test` — testy jednostkowe i integracyjne (m.in. testy równoległych żądań i równoległego dołączania do wydarzenia).
- Frontend: testy komponentów Angular (`client/src/app/TESTS.md`).

---

## 5. Napotkane wyzwania i rozwiązania

- **Utrzymanie dwóch wersji aplikacji (dev / prod)** — rozwiązaliśmy przez podzielenie na dwie gałęzie: `main` z wersją deweloperska oraz `docker-production` z wersją produkcyjną, obie uruchamiane tym samym poleceniem `docker compose up --build`.
- **Brak możliwości wyświetlenia profilu zalogowanego użytkownika** — dadaliśmy nowy endpoint `/me` zwracający dane aktualnie zalogowanego użytkownika na podstawie tokenu JWT.
- **Kolizja endpointów naszego API z endpointem Grafany** — zmiana nazewnictwa endpointów serwera, by nie kolidowały z Grafaną oraz zmiana portu działania serwera na 5000 (Oczywiście potem dzięki dockerowi, zmieniliśmy port dockerowej grafany na 3001, ale już nie przywróciliśmy portu 3000 dla serwera)
- **Problem z mergem przy refaktoryzacji** — po zmergowaniu z `develop` częściowo cofneło nam wprowadzone zmiany (część komentarzy i poprawionego kodu wróciła do poprzedniej wersji), spowodowało to błędy kompilacji — musieliśmy to ręcznie poprawić przy merge.

---

## 6. Podsumowanie

- Odniesienie się do dokumentacji [topic_selection.md](topic_selection.md) - co się zmieniło, co zreazlizowaliśmy
- Co zrobiliśmy ponad pierwotny plan (monitoring, dockeryzacja dev/prod, testy współbieżności).
