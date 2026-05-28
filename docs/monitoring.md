# Monitoring — Prometheus + Grafana

Dokument opisuje, jak pobrać i skonfigurować Prometheusa i Grafanę lokalnie, tak aby monitorować aplikację `taw` (backend udostępnia metryki na `/metrics`).

## Wymagania

- Uruchomiony serwer Express aplikacji (`taw`) — ustawiony na porcie `5000`.
- Prometheus pobrany i rozpakowany lokalnie (https://prometheus.io/download/) — wersja: 3.11.3 (Windows) (Konfiguracja i job w `server/prometheus.yml` przygotowane i testowane na tej wersji.)
- Grafana pobrana/zainstalowana lokalnie (https://grafana.com/grafana/download) — wersja: entreprise 13.0.1 + security (Dashboard i instrukcje importu testowane na tej wersji.)

---

## 1. Konfiguracja Prometheusa

Otwórz plik `prometheus.yml` w katalogu instalacji Prometheusa (np. `prometheus-3.11.3.windows-amd64\`) i skopiuj do niego job z pliku `server/prometheus.yml` lub kod poniżej:

```yaml
scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
        labels:
          app: "prometheus"
  - job_name: "taw-backend"
    static_configs:
      - targets: ["localhost:5000"]
    metrics_path: "/metrics"
    scrape_interval: 5s
```

Następnie uruchom Prometheusa:

```bash
.\prometheus.exe --config.file=prometheus.yml
```

Sprawdź czy metryki są zbierane: [http://localhost:9090/targets](http://localhost:9090/targets)

Oba joby (`prometheus` oraz `taw-backend`) powinny mieć status **UP**.

---

## 2. Uruchomienie Grafany

Uruchom Grafanę (domyślnie działa na porcie `3000`):

```bash
.\bin\grafana-server.exe
```

Jeśli nie zadziała, zalecane jest uruchomić z pliku exe:

```
.\bin\grafana.exe
```

Otwórz panel: [http://localhost:3000](http://localhost:3000)

Domyślne dane logowania:

- Login: `admin`
- Hasło: `admin`

---

## 3. Dodanie Prometheusa jako Data Source

1. W Grafanie przejdź do: **Connections → Data Sources → Add new data source**
2. Wybierz **Prometheus**
3. W polu **Prometheus server URL** wpisz:
   ```
   http://localhost:9090
   ```
4. Kliknij **Save & test** — powinien pojawić się komunikat o poprawnym dodaniu datasource

---

## 4. Import dashboardu

1. W Grafanie przejdź do: **Dashboards → Import**
2. Kliknij **Upload dashboard JSON file**
3. Wybierz plik `server/grafana-dashboard.json` - grafana jest już w nim odpowiednio skonfigurowana
4. Kliknij **Import**

Dashboard jest dostępny w zakładce **Dashboards** i pokazuje metryki:

- Łączna liczba żądań HTTP (`http_requests_total`)
- Czas odpowiedzi (`http_request_duration_ms`)
- Aktywne połączenia (`active_connections`)
- Błędy API (`api_errors_total`)
