# Przypadki Użycia - Aplikacja do Organizacji Wydarzeń Lokalnych

## 1. Aktorzy Systemu

### 1.1 Anonimowy Użytkownik
- Osoba niezalogowana w systemie
- Może przeglądać i szukać dostępnych wydarzeń
- **Rola:** Odbiorca informacji o wydarzeniach

### 1.2 Zalogowany Użytkownik
- Osoba posiadająca konto i zalogowana w systemie
- Może deklarować uczestnictwo w wydarzeniach
- Może zarządzać swoim profilem
- **Rola:** Uczestnik

### 1.3 Organizator
- Zalogowany użytkownik z uprawnieniami do tworzenia zdarzeń
- Zarządza własnymi wydarzeniami
- Zmienia status uczestników
- **Rola:** Twórca i manager zdarzeń

### 1.4 Administrator Systemu
- Osoba odpowiadająca za całość systemu
- Zarządza użytkownikami i uprawnieniami
- Moderuje treści
- **Rola:** Zarządca systemu

---

## 2. Główne Przypadki Użycia

### 2.1 UC01: Przeglądanie Listy Wydarzeń
**Aktor:** Anonimowy Użytkownik / Zalogowany Użytkownik  
**Opis:** Użytkownik widzi listę wszystkich dostępnych wydarzeń w systemie  
**Warunki wstępne:** Brak  
**Scenariusz główny:**
1. Użytkownik przechodzi do aplikacji
2. System wyświetla stronę główną z listą najpopularniejszych/najnowszych zdarzeń
3. Użytkownik może przewijać listę i przeglądać więcej zdarzeń


---

### 2.2 UC02: Wyszukiwanie Wydarzeń
**Aktor:** Anonimowy Użytkownik / Zalogowany Użytkownik  
**Opis:** Użytkownik wyszukuje wydarzenia na podstawie kryteriów filtrowania  
**Warunki wstępne:** Istnieją zdarzenia w systemie  
**Scenariusz główny:**
1. Użytkownik otwiera formularz wyszukiwania
2. Użytkownik wprowadza kryteria:
   - Nazwa wydarzenia
   - Lokalizacja (miasto, adres)
   - Data/Zakres dat
   - Typ wydarzenia (kategoria)
3. Użytkownik kliknie "Szukaj"
4. System zwraca przefiltrowaną listę zdarzeń
5. Użytkownik może kliknąć na zdarzenie, aby zobaczyć szczegóły


---

### 2.3 UC03: Podgląd Szczegółów Wydarzenia
**Aktor:** Anonimowy Użytkownik / Zalogowany Użytkownik / Organizator / Administrator  
**Opis:** Użytkownik wyświetla pełne informacje o wybranym wydarzeniu  
**Warunki wstępne:** Zdarzenie istnieje w systemie  
**Scenariusz główny:**
1. Użytkownik kliknie na zdarzenie z listy
2. System wyświetla szczegóły:
   - Nazwa i opis
   - Data i godzina
   - Lokalizacja
   - Organizator
   - Liczba zarejestrowanych uczestników
   - Status (otwarte/zamknięte)
3. Użytkownik może wrócić do listy


---

### 2.4 UC04: Rejestracja Nowego Użytkownika
**Aktor:** Anonimowy Użytkownik  
**Opis:** Nowy użytkownik tworzy konto w systemie  
**Warunki wstępne:** Brak  
**Scenariusz główny:**
1. Użytkownik kliknie przycisk "Rejestracja"
2. System wyświetla formularz rejestracji
3. Użytkownik wprowadza:
   - E-mail
   - Hasło
   - Potwierdzenie hasła
   - Opcjonalnie: imię i nazwisko
4. Użytkownik kliknie "Zarejestruj się"
5. System waliduje dane
6. Konto jest utworzone
7. Użytkownik jest automatycznie zalogowany lub przekierowany do logowania
8. Użytkownik działa jako zalogowany
---

### 2.5 UC05: Logowanie Użytkownika
**Aktor:** Anonimowy Użytkownik  
**Opis:** Użytkownik loguje się do systemu  
**Warunki wstępne:** Użytkownik ma zarejestrowane konto  
**Scenariusz główny:**
1. Użytkownik kliknie przycisk "Loguj się"
2. System wyświetla formularz logowania
3. Użytkownik wprowadza e-mail i hasło
4. Użytkownik kliknie "Zaloguj się"
5. System waliduje dane
6. Użytkownik jest zalogowany
7. System przekierowuje do strony głównej z istotnymi informacjami
8. Użytkownik działa jako zalogowany
---

### 2.6 UC06: Potwierdzenie Uczestnictwa w Wydarzeniu
**Aktor:** Zalogowany Użytkownik  
**Opis:** Użytkownik deklaruje uczestnictwo w wybranym wydarzeniu  
**Warunki wstępne:** Użytkownik jest zalogowany, zdarzenie istnieje  
**Scenariusz główny:**
1. Użytkownik wyświetla szczegóły wydarzenia
2. Użytkownik kliknie przycisk "Potwierdź uczestnictwo"
3. System zarejestruje użytkownika jako uczestnika
4. Liczba uczestników zostaje zaktualizowana
5. Wyświetlony komunikat potwierdzenia
6. Przycisk zmienia się na "Anuluj uczestnictwo"

---

### 2.7 UC07: Anulowanie Uczestnictwa
**Aktor:** Zalogowany Użytkownik  
**Opis:** Użytkownik wycofuje się z uczestnictwa w wydarzeniu  
**Warunki wstępne:** Użytkownik jest zalogowany i uczestnikiem wydarzenia  
**Scenariusz główny:**
1. Użytkownik wyświetla szczegóły wydarzenia, dla którego jest uczestnikiem
2. Użytkownik kliknie przycisk "Anuluj uczestnictwo"
3. System prosi o potwierdzenie
4. Użytkownik potwierdza
5. Rejestracja użytkownika zostaje usunięta
6. Liczba uczestników zostaje zmniejszona

---

### 2.8 UC08: Tworzenie Nowego Wydarzenia
**Aktor:** Organizator  
**Opis:** Organizator tworzy nowe zdarzenie w systemie  
**Warunki wstępne:** Użytkownik jest zalogowany i ma rolę organizatora  
**Scenariusz główny:**
1. Organizator kliknie przycisk "Utwórz zdarzenie"
2. System wyświetla formularz tworzenia
3. Organizator wprowadza:
   - Nazwę
   - Opis
   - Data i godzina rozpoczęcia
   - Data i godzina zakończenia
   - Lokalizacja (adres)
   - Typ/kategoria
   - Maksymalna liczba uczestników (opcjonalnie)
   - Grafika/zdjęcie (opcjonalnie)
4. Organizator kliknie "Utwórz"
5. System waliduje dane
6. Zdarzenie jest tworzone
7. Organizator jest przekierowany do widoku swojego zdarzenia


---

### 2.9 UC09: Edycja Wydarzenia
**Aktor:** Organizator (właściciel wydarzenia)  
**Opis:** Organizator modyfikuje istniejące zdarzenie  
**Warunki wstępne:** Organizator ma uprawnienia do zdarzenia  
**Scenariusz główny:**
1. Organizator wyświetla szczegóły swojego zdarzenia
2. Kliknie przycisk "Edytuj"
3. System wyświetla formularz z aktualnymi danymi
4. Organizator zmienia potrzebne informacje
5. Kliknie "Zapisz zmiany"
6. System waliduje dane
7. Zmiany są zapisywane
8. System wyświetla zaktualizowane szczegóły

---

### 2.10 UC10: Usunięcie Wydarzenia
**Aktor:** Organizator (właściciel) / Administrator  
**Opis:** Zdarzenie jest usuwane z systemu  
**Warunki wstępne:** Organizator/Admin ma uprawnienia do zdarzenia  
**Scenariusz główny:**
1. Organizator wyświetla szczegóły swojego zdarzenia
2. Kliknie przycisk "Usuń"
3. System prosi o potwierdzenie usunięcia
4. Organizator potwierdza
5. Zdarzenie jest usuwane z systemu
6. Organizator zostaje przekierowany do listy swoich zdarzeń

---

### 2.11 UC11: Zarządzanie Uczestnikami Wydarzenia
**Aktor:** Organizator (właściciel)  
**Opis:** Organizator przegląda i zarządza listą uczestników  
**Warunki wstępne:** Zdarzenie istnieje i ma uczestników  
**Scenariusz główny:**
1. Organizator wyświetla szczegóły swego zdarzenia
2. Kliknie przycisk "Zarządzaj uczestnikami"
3. System wyświetla listę wszystkich zarejestrowanych uczestników
4. Organizator może:
   - Przeglądać dane uczestników
   - Usunąć uczestnika z listy

---

### 2.12 UC12: Zarządzanie Użytkownikami
**Aktor:** Administrator  
**Opis:** Administrator zarządza kontami użytkowników i uprawnieniami  
**Warunki wstępne:** Użytkownik ma rolę administratora  
**Scenariusz główny:**
1. Administrator przechodzi do panelu administracyjnego
2. Administrator wybiera "Zarządzanie użytkownikami"
3. System wyświetla listę wszystkich użytkowników
4. Administrator może:
   - Przeglądać dane użytkownika
   - Zmienić role użytkownika (zwykły użytkownik → organizator)
   - Usunąć konto

---

### 2.13 UC13: Moderowanie Treści
**Aktor:** Administrator  
**Opis:** Administrator usuwa nieodpowiednie zdarzenia
**Warunki wstępne:** Zdarzenie narusza regulamin  
**Scenariusz główny:**
1. Administrator znajduje nieodpowiednie zdarzenie
2. Administrator przechodzi do panelu moderacji
3. Administrator przegląda szczegóły zdarzenia
4. Administrator może:
   - Usunąć zdarzenie
5. System rejestruje akcję moderacji
