# Monitoring — Prometheus + Grafana

Dokument opisuje dwa sposoby uruchomienia monitoringu: przez Docker Compose (zalecane) oraz ręcznie.

Backend udostępnia metryki na `/metrics` i domyślnie nasłuchuje na porcie `5000`.

---

## Sposób 1: Docker Compose (zalecany)

Wszystkie serwisy (backend, frontend, Prometheus, Grafana) uruchamia jedno polecenie z głównego katalogu projektu:

```bash
docker compose up --build
```

Adresy po uruchomieniu:

| Serwis     | Adres                                        |
|------------|----------------------------------------------|
| Backend    | http://localhost:5000                        |
| Frontend   | http://localhost:4200                        |
| Prometheus | http://localhost:9090                        |
| Grafana    | http://localhost:3001                        |

Grafana loguje się danymi: `admin` / `admin`.

Konfiguracja Prometheusa (`monitoring/prometheus/prometheus.yml`) oraz provisioning Grafany (`monitoring/grafana/provisioning/`) są ładowane automatycznie z wolumenów — nie wymaga ręcznej konfiguracji.

Dashboard Grafany jest importowany automatycznie z pliku `server/grafana-dashboard.json`.

---

## Sposób 2: Uruchomienie ręczne (lokalne)

### Wymagania

- Uruchomiony serwer Express aplikacji (`taw`) na porcie `5000`.
- Prometheus pobrany i rozpakowany lokalnie (https://prometheus.io/download/) — wersja: 3.11.3 (Windows).
- Grafana pobrana/zainstalowana lokalnie (https://grafana.com/grafana/download) — wersja: enterprise 13.0.1.

### 1. Konfiguracja Prometheusa

Otwórz plik `prometheus.yml` w katalogu instalacji Prometheusa i skopiuj do niego zawartość pliku `server/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'taw-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

Następnie uruchom Prometheusa:

```bash
.\prometheus.exe --config.file=prometheus.yml
```

Sprawdź czy metryki są zbierane: [http://localhost:9090/targets](http://localhost:9090/targets)

Job `taw-backend` powinien mieć status **UP**.

### 2. Uruchomienie Grafany

Uruchom Grafanę (domyślnie port `3000`):

```bash
.\bin\grafana-server.exe
```

Jeśli nie zadziała, uruchom z:

```bash
.\bin\grafana.exe
```

Otwórz panel: [http://localhost:3000](http://localhost:3000)

Domyślne dane logowania:

- Login: `admin`
- Hasło: `admin`

### 3. Dodanie Prometheusa jako Data Source

1. W Grafanie przejdź do: **Connections → Data Sources → Add new data source**
2. Wybierz **Prometheus**
3. W polu **Prometheus server URL** wpisz:
   ```
   http://localhost:9090
   ```
4. Kliknij **Save & test** — powinien pojawić się komunikat o poprawnym dodaniu datasource.

### 4. Import dashboardu

1. W Grafanie przejdź do: **Dashboards → Import**
2. Kliknij **Upload dashboard JSON file**
3. Wybierz plik `server/grafana-dashboard.json`
4. Kliknij **Import**

---

## Dostępne metryki

| Metryka | Opis |
|---|---|
| `http_requests_total` | Łączna liczba żądań HTTP (etykiety: method, route, status_code) |
| `http_request_duration_ms` | Czas odpowiedzi w milisekundach (histogram) |
| `active_connections` | Aktualnie obsługiwane połączenia |
| `api_errors_total` | Liczba błędów API według typu |
