# Aplikacja do organizacji wydarzeń lokalnych

## Opis projektu
Projekt to aplikacja webowa do tworzenia, zarządzania i przeglądania wydarzeń lokalnych (np. koncerty, warsztaty, konferencje, inicjatywy społeczne). System łączy organizatorów z uczestnikami i pozwala wyszukiwać wydarzenia po nazwie, lokalizacji lub dacie.

## Instrukcja uruchomienia
### Skopiowanie  i przemieszczenie do lokalizacji repozytorium
```bash
git clone https://github.com/TAW-26/TAW-Bartlomiej-Gwozdz_Bartlomiej-Dziedzic.git
cd TAW-Bartlomiej-Gwozdz_Bartlomiej-Dziedzic
```

### Backend

```bash
cd server
npm install
npm run dev
```

#### Testy

```bash
cd server
npm test
```

Backend API: `http://localhost:5000`
Endpoint testowy: `http://localhost:5000/api/health`

### Frontend

```bash
cd client
npm install
ng serve
```

Aplikacja: `http://localhost:4200`

### Docker (cała aplikacja na raz)

Wymaga zainstalowanego Dockera oraz pliku `server/secrets.json` z danymi do MongoDB (patrz sekcja Backend).

```bash
docker compose up --build
```

Uruchamia jednocześnie:
- Backend: `http://localhost:5000` (metryki: `http://localhost:5000/metrics`)
- Frontend: `http://localhost:4200`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001` (login: `admin` / `admin`, dashboard "TAW Backend Monitoring" wczytuje się automatycznie)

## Użyte technologie
- Frontend: Angular
- Backend: Node.js
- Baza danych: MongoDB
- Autentykacja: JWT
- Autoryzacja: RBAC (role-based access control)

## Link do dokumentacji
- [Dokumentacja projektu](docs/topic_selection.md)
