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

Backend API: `http://localhost:3000`
Endpoint testowy: `http://localhost:3000/api/health`

### Frontend

```bash
cd client
npm install
ng serve
```

Aplikacja: `http://localhost:4200`

## Użyte technologie
- Frontend: Angular
- Backend: Node.js
- Baza danych: MongoDB
- Autentykacja: JWT
- Autoryzacja: OAuth2

## Link do dokumentacji
- [Dokumentacja projektu](docs/topic_selection.md)
