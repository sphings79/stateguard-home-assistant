<div align="center">
  <img src="assets/banner.svg" alt="StateGuard für Home Assistant — Überwachung von Entitäten und Geräten mit drei Beispielmeldungen: ein Türschloss seit 12 Minuten nicht erreichbar, ein Fenstersensor mit 10 Prozent Batterie, eine Wetterstation ohne Meldung seit über zwei Tagen" width="100%">

  # StateGuard — Geräte- und Entitätsüberwachung für Home Assistant

  **Labele die Geräte, auf die es ankommt — StateGuard meldet sich, wenn sie nicht mehr antworten.**
  Eine Integration, die anhand von Home-Assistant-Labels überwacht, ob Entitäten nicht mehr verfügbar sind, keine Daten mehr senden oder einen Grenzwert überschreiten — mit eigenem Panel, eigener Lovelace-Karte und Benachrichtigung über SMTP, Telegram, Pushover, ntfy oder jeden Home-Assistant-Dienst.

  [![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5?style=for-the-badge)](https://hacs.xyz)
  [![Release](https://img.shields.io/github/v/release/sphings79/stateguard-home-assistant?style=for-the-badge&color=7C7CF5)](https://github.com/sphings79/stateguard-home-assistant/releases)
  [![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2026.1%2B-41BDF5?style=for-the-badge)](https://www.home-assistant.io)
  [![Lizenz](https://img.shields.io/badge/Lizenz-MIT-3ddc97?style=for-the-badge)](LICENSE)

  [English](README.md) · **Deutsch**
</div>

## Inhaltsverzeichnis

- [Was die Integration macht](#was-die-integration-macht)
- [Warum nicht einfach eine Automation](#warum-nicht-einfach-eine-automation)
- [Welche Entitäten entstehen](#welche-entitäten-entstehen)
- [Wie es funktioniert](#wie-es-funktioniert)
- [Warum ein erkanntes Problem still bleiben kann](#warum-ein-erkanntes-problem-still-bleiben-kann)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Benachrichtigungskanäle](#benachrichtigungskanäle)
- [Automationsbeispiele](#automationsbeispiele)
- [Dashboard-Beispiel](#dashboard-beispiel)
- [Dienste](#dienste)
- [Fehlersuche](#fehlersuche)
- [Häufige Fragen](#häufige-fragen)
- [Weitere Home-Assistant-Projekte](#weitere-home-assistant-projekte)
- [Mitwirken](#mitwirken)
- [Haftungsausschluss](#haftungsausschluss)
- [Lizenz](#lizenz)

## Was die Integration macht

Eine Batterie ist leer. Ein Zigbee-Gerät fällt aus dem Netz. Ein Sensor meldet seit zwei Tagen denselben Wert, weil er in Wahrheit tot ist. Home Assistant zeigt dann bereitwillig für immer `unavailable` an und sagt kein Wort.

StateGuard überwacht die Entitäten, die du labelst, und meldet, wenn etwas nicht stimmt:

| Bedingung | Was sie erkennt |
| --- | --- |
| **Nicht verfügbar oder unbekannt** | Ein Gerät ist aus dem Netz gefallen oder seine Integration ist kaputt |
| **Zu lange keine Daten** | Die Entität existiert noch, meldet aber nichts mehr |
| **Zahlenwert-Schwelle** | Batterie unter 25 %, Temperatur über 60 °C — mit eigener Rückfallschwelle, damit nichts pendelt |
| **Zustand ist (nicht)** | Eine Tür, die etwas anderes meldet als `closed` |
| **Hängt in einem Zustand** | Ein Schloss, das seit über einer Stunde `unlocked` ist |
| **Entität verschwunden** | Eine Entity-ID, die es gar nicht mehr gibt |

Jede Überwachung hat einen **Schweregrad**, den du selbst festlegst. Ein Temperatursensor und ein Türschloss sind nicht dieselbe Art von Problem — also müssen sie sich weder Meldewege noch Ruhezeiten teilen.

## Warum nicht einfach eine Automation

Eine einzelne Überwachung baut man auch als Automation. Sperrig wird erst, was danach kommt:

- Dich nicht um 3 Uhr nachts für einen Sensor zu wecken, der um 8 Uhr immer noch kaputt ist.
- Nicht fünfzig Nachrichten zu schicken, wenn ein Zigbee-Koordinator ausfällt.
- Nach jedem Neustart zehn Minuten Ruhe zu geben, während das halbe Haus kurz `unavailable` ist.
- Batteriewerte, die in 25-Prozent-Stufen kommen und sonst um die Schwelle pendeln.
- Festzuhalten, was wann und wie lange kaputt war.

Genau diese zweite Hälfte ist StateGuard — einmal gebaut, konfigurierbar in einer Oberfläche statt in YAML.

## Welche Entitäten entstehen

<img src="assets/entities.svg" alt="Entitäten, die StateGuard anlegt: ein Problem-Binärsensor je Überwachung mit den betroffenen Entity-IDs als Attribute, ein Gesamtzähler, ein Zähler je Schweregrad und ein Schalter zum Pausieren" width="100%">

| Entität | Beispiel | Bedeutung |
| --- | --- | --- |
| `binary_sensor.stateguard_<überwachung>` | `on` | Diese Überwachung hat aktive Probleme. Die Attribute nennen die betroffenen Entitäten und den Grund. |
| `sensor.stateguard_probleme` | `3` | Aktive Probleme insgesamt |
| `sensor.stateguard_problems_<schweregrad>` | `1` | Aktive Probleme eines Schweregrads |
| `switch.stateguard_uberwachung` | `on` | Pausiert alle Überwachungen auf einmal |

## Wie es funktioniert

<img src="assets/architecture.svg" alt="Funktionsweise von StateGuard: Labels werden zu einer Entitätenmenge aufgelöst, Bedingungen werden bei jeder Zustandsänderung und alle 30 Sekunden geprüft, eine Karenzzeit muss ablaufen, eine Unterdrückungskette filtert Fehlalarme, der Rest wird gebündelt an die Kanäle geschickt und in der Historie festgehalten" width="100%">

Zwei Dinge treiben die Prüfung an: Zustandsänderungen werden sofort erfasst, und ein Durchlauf alle 30 Sekunden erledigt, was kein eigenes Ereignis hat — eine Entität, die verstummt ist, eine ablaufende Karenzzeit, eine fällige Eskalation.

Die Prüfung „keine Daten" misst gegen **`last_reported`**, nicht gegen `last_changed`. Das ist der entscheidende Unterschied: Ein Homematic-Batteriesensor kann drei Tage lang bei 75 % stehen und trotzdem alle halbe Stunde zuverlässig melden. Gegen `last_changed` gemessen sähe er tot aus.

## Warum ein erkanntes Problem still bleiben kann

<img src="assets/suppression-chain.svg" alt="Die Unterdrückungskette der Reihe nach: Überwachung pausiert, geschlummert oder quittiert, Karenzzeit nach Neustart, Internet-Entität aus, Integration ausgefallen, Elterngerät ausgefallen, Ruhezeit — jede hält die Meldung aus einem anderen Grund zurück" width="100%">

Es gibt zwei Sorten, und der Unterschied ist wichtig:

- **Du hast es angeordnet** — Überwachung aus, pausiert, Schlummern, Quittieren. Eine laufende Meldung wird *zurückgenommen*: Der Sensor geht aus, die Benachrichtigung verschwindet.
- **Das System entscheidet** — Karenzzeit nach Neustart, kein Internet, Integration ausgefallen, Elterngerät weg. Hier werden nur *neue* Meldungen zurückgehalten. Was schon gemeldet wurde, bleibt gemeldet — so meldet ein Neustart nie erneut, was du längst weißt.

**Ruhezeiten sind keines von beiden**: Die Meldung wird verzögert und danach nachgeholt, aber nur, wenn das Problem noch besteht. Du kannst mehrere Zeiträume anlegen, weil das Wochenende meist anders aussieht — 22:00–07:00 von Montag bis Freitag, 23:00–09:00 am Wochenende. Ein Zeitraum über Mitternacht gehört zu dem Tag, an dem er beginnt: „Freitag 23:00–07:00" deckt also den frühen Samstagmorgen mit ab.

## Installation

<img src="assets/install.svg" alt="Installation in vier Schritten: Repository in HACS hinzufügen, installieren und neu starten, Integration unter Einstellungen hinzufügen, dann StateGuard in der Seitenleiste öffnen und mit einer Vorlage beginnen" width="100%">

### Über HACS

1. HACS → Integrationen → ⋮ → **Benutzerdefinierte Repositories**
2. `https://github.com/sphings79/stateguard-home-assistant` hinzufügen, Kategorie **Integration**
3. **StateGuard** installieren, dann Home Assistant neu starten
4. Einstellungen → Geräte & Dienste → **Integration hinzufügen** → StateGuard

Es gibt nichts auszufüllen — alles Weitere passiert im Panel.

### Von Hand

`custom_components/stateguard` nach `config/custom_components/` kopieren und neu starten.

## Konfiguration

Alles liegt unter **StateGuard** in der Seitenleiste (nur für Administratoren).

### Mit einer Vorlage anfangen

Fünf Vorlagen decken die üblichen Fälle ab: Verfügbarkeit, Batterie schwach, Keine Daten, Sicherheitsgeräte, Verschwundene Entitäten. Eine auswählen, Labels wählen, speichern. Die Batterie-Vorlage nimmt **25 %** statt 20 %, weil viele Geräte in groben Stufen melden (Homematic nutzt 100 / 75 / 50 / 37,5 / 25 / 0) — bei einer Grenze von 20 % würde sie erst bei null auslösen.

### Was eine Überwachung erfasst

Labels sind der Hauptselektor, und der Editor zeigt eine **Live-Vorschau**, welche Entitäten die aktuelle Auswahl genau erfasst — noch vor dem Speichern. Danach kannst du eine Überwachung in der Liste aufklappen und siehst dasselbe für die gespeicherte Regel: jede Entität mit Name, ID, aktuellem Zustand und dem Grund, falls etwas nicht stimmt.

| Einstellung | Wirkung |
| --- | --- |
| Labels + Verknüpfung | Eines davon oder alle davon |
| Entitäten gelabelter Geräte | Ein Label am Gerät erfasst dessen Entitäten |
| Diagnose-Entitäten | Standardmäßig aus, damit Signalstärke-Sensoren nicht stören |
| Bereiche, Etagen, Domains, Integrationen | Schränken die Label-Auswahl weiter ein |
| Einzelne Entitäten | Kommen zusätzlich dazu |
| Ausschlüsse | Ein Ignorier-Label oder bestimmte Entity-IDs |

Ausgefüllte Kategorien werden mit **UND** verknüpft, einzeln aufgeführte Entitäten mit **ODER** ergänzt.

### Wer es sehen darf

Standardmäßig ist der Eintrag in der Seitenleiste nur für Administratoren. In
den Einstellungen kannst du ihn für alle freigeben — Nicht-Administratoren
bekommen dann eine reine Statusansicht und können nichts ändern. Das Bearbeiten
bleibt in jedem Fall bei Administratoren, und die Umstellung wirkt ohne
Neustart.

Die **Lovelace-Karte funktioniert unabhängig davon für jeden Benutzer**, du
kannst die aktuellen Probleme also auf ein Familien-Dashboard legen, ohne die
Konfiguration herauszugeben.

### Schweregrade

Frei definierbar, jeder mit einer Priorität, die entscheidet, wer gewinnt, wenn zwei Überwachungen dieselbe Entität erfassen. Am Schweregrad hängen: seine Kanäle, ob er Ruhezeiten ignoriert, ob er eine Home-Assistant-Benachrichtigung erzeugt, das Bündelungsfenster, die Wiederholung und die Eskalationsstufe.

## Benachrichtigungskanäle

| Kanal | Zugangsdaten liegen | Hinweise |
| --- | --- | --- |
| **Home-Assistant-Dienst** | nirgends | `notify.mobile_app_…`, ein eingerichteter Telegram-Bot, die SMTP-Integration, ein Skript — alles mit einem Dienst |
| **SMTP** | in StateGuard | Mail direkt über den eigenen Server, unabhängig von Home Assistant |
| **Telegram** | in StateGuard | Eigener Bot-Token und Chat-ID |
| **Pushover** | in StateGuard | Anwendungs-Token und Benutzerschlüssel, mit Priorität und Ton |
| **ntfy** | in StateGuard | ntfy.sh oder eigener Server, mit Tags und Klick-Ziel |

Jeder Kanal kann einen eigenen Nachrichtentext als Jinja2-Vorlage bekommen, mit `watch`, `severity`, `count` und `problems` (je mit `name`, `entity_id`, `state`, `reason`, `device`, `integration`, `url`). Leer lassen für den eingebauten Text, der deiner Home-Assistant-Sprache folgt.

Jeder Kanal hat einen Knopf **Test senden** — so merkst du jetzt, dass der Token falsch ist, und nicht beim nächsten Ausfall.

## Automationsbeispiele

<img src="assets/automation.svg" alt="Ablauf für Automationen: StateGuard feuert ein stateguard_alert-Ereignis mit Überwachung, Entität, Schweregrad und Grund, auf das eine Automation reagieren kann" width="100%">

Licht blinken lassen, wenn ein Sicherheitsgerät ausfällt:

```yaml
automation:
  - alias: "Blinken bei Sicherheitsmeldung"
    trigger:
      - trigger: event
        event_type: stateguard_alert
        event_data:
          severity: Sicherheit
    action:
      - action: light.turn_on
        target: { entity_id: light.flur }
        data: { flash: long, color_name: red }
```

Beim Nachhausekommen ansagen, was ansteht:

```yaml
automation:
  - alias: "Probleme bei Ankunft melden"
    trigger:
      - trigger: state
        entity_id: person.ich
        to: home
    condition:
      - condition: numeric_state
        entity_id: sensor.stateguard_probleme
        above: 0
    action:
      - action: tts.speak
        data:
          message: >-
            {{ states('sensor.stateguard_probleme') }} Geräte brauchen Aufmerksamkeit:
            {{ state_attr('sensor.stateguard_probleme', 'entities') | join(', ') }}
```

Während der Netzwerkarbeit Ruhe geben:

```yaml
action:
  - action: stateguard.snooze
    data:
      duration: "1h"
```

## Dashboard-Beispiel

<img src="assets/dashboard.svg" alt="Dashboard-Entwurf mit der StateGuard-Lovelace-Karte mit drei aktuellen Problemen und der Panel-Übersicht mit zwei aktiven Problemen und sichtbarem Countdown der Neustart-Karenzzeit" width="100%">

Die Karte wird automatisch registriert — sie taucht in der Kartenauswahl auf,
ohne dass du eine Ressource hinzufügen musst, und bringt einen visuellen Editor
mit. Der lohnt sich vor allem für die beiden Filter: Überwachungs-IDs sind
Zufallszeichenfolgen, da ist Auswählen deutlich angenehmer als Nachschlagen.
Das YAML dahinter:

```yaml
type: custom:stateguard-card
title: Geräte, die Aufmerksamkeit brauchen
hide_when_healthy: true
severities:
  - security
  - critical
max: 5
```

| Option | Vorgabe | Bedeutung |
| --- | --- | --- |
| `title` | `StateGuard` | Überschrift der Karte |
| `hide_when_healthy` | `false` | Karte ganz ausblenden, wenn nichts ansteht |
| `severities` | alle | Nur diese Schweregrad-IDs zeigen |
| `watches` | alle | Nur diese Überwachungs-IDs zeigen |
| `show_suppressed` | `false` | Auch geschlummerte und zurückgehaltene Probleme auflisten |
| `max` | unbegrenzt | Zeilenzahl begrenzen |

Bei einem **Dashboard im YAML-Modus** verwaltet Home Assistant die Ressourcen nicht — dort einmal von Hand eintragen:

```yaml
lovelace:
  resources:
    - url: /stateguard-frontend/stateguard-card.js
      type: module
```

## Dienste

| Dienst | Wirkung |
| --- | --- |
| `stateguard.snooze` | Stummschalten für 1 h, 8 h, 24 h oder bis morgen früh — je Überwachung, je Entität oder für alles |
| `stateguard.acknowledge` | Als bekannt markieren; bis zur Behebung keine weiteren Meldungen |
| `stateguard.clear_acknowledgement` | Quittierung oder Schlummern aufheben |
| `stateguard.pause_watch` / `resume_watch` | Eine einzelne Überwachung aus- und wieder einschalten |
| `stateguard.run_check` | Ziele neu auflösen und sofort auswerten |
| `stateguard.export_config` | Die vollständige Konfiguration zurückgeben (Antwortdaten) |
| `stateguard.import_config` | Konfiguration aus einer Sicherung wiederherstellen |

## Fehlersuche

**Es wird nichts gemeldet.** Die Übersicht sagt, warum. Solange die Karenzzeit nach einem Neustart läuft, erscheint dort ein Countdown, und wenn die Internet-Entität aus ist, ein entsprechender Hinweis. Vielleicht steht auch einfach der Überwachungsschalter auf aus.

**Eine Überwachung erfasst null Entitäten.** Öffne sie: Die Live-Vorschau zeigt, was die Auswahl gerade ergibt. Meistens sitzt das Label am *Gerät*, während „Entitäten gelabelter Geräte einbeziehen" aus ist — oder es sind Diagnose-Entitäten.

**Ein Batteriesensor pendelt.** Setze eine Rückfallschwelle oberhalb des Grenzwerts. Mit 25 % und einer Rückfallschwelle von 40 % entwarnt StateGuard erst, wenn der Wert wirklich wieder oben ist.

**Ich bekomme eine Meldung für jedes Gerät hinter einer Bridge.** Lass „Unterdrücken, wenn das Elterngerät ausgefallen ist" eingeschaltet. StateGuard folgt `via_device` nach oben und schweigt über die Kinder, solange das Elternteil selbst nicht erreichbar ist.

**Die Karte taucht nicht auf.** Bei einem Dashboard im Storage-Modus registriert sie sich selbst; im YAML-Modus braucht es den Ressourcen-Eintrag von oben. Ein harter Neuladen (Strg+Umschalt+R) räumt ein zwischengespeichertes altes Bundle weg.

## Häufige Fragen

### Funktioniert das ohne Internet?

Ja. Alles läuft lokal. Nur die Kanäle, die du wählst — Telegram, Pushover, ntfy — reden nach draußen, und du kannst eine Entität für die Internetverbindung angeben, damit sie schweigen, solange die Leitung weg ist.

### Muss ich alles labeln?

Nein. Labels sind der Hauptselektor, aber eine Überwachung nimmt auch Bereiche, Etagen, Domains, ganze Integrationen oder einzelne Entity-IDs.

### Was passiert bei einem Neustart von Home Assistant?

Für die Karenzzeit, standardmäßig zehn Minuten, wird nichts gemeldet, weil nach einem Neustart viele Entitäten kurz nicht verfügbar sind. Probleme, die schon vor dem Neustart gemeldet waren, bleiben gemeldet — du wirst nicht zweimal benachrichtigt.

### Ersetzt das Watchman?

Es überschneidet sich. Watchman findet auf Zuruf fehlende und nicht verfügbare Entitäten; StateGuard ergänzt label-basierte Regeln, Schwellwerte, Stale-Erkennung, Eskalation, Ruhezeiten und eine Historie. Beides kann nebeneinander laufen.

### Bremst das Home Assistant aus?

Es lauscht nur auf die Entitäten, die deine Überwachungen tatsächlich erfassen, und läuft alle 30 Sekunden einmal über dieselbe Menge. Eine „keine Daten"-Prüfung über ein paar hundert Entitäten sind eine Handvoll Zeitstempel-Vergleiche.

### Wo liegt die Historie?

In `stateguard_history.db` neben deiner Konfiguration, bewusst nicht in der Recorder-Datenbank — eine Überwachungsintegration soll nicht die Datenbank aufblähen, von der alles andere abhängt. Die Aufbewahrung liegt standardmäßig bei 90 Tagen.

### Sind meine Passwörter sicher?

Die Zugangsdaten der Kanäle liegen im Speicher von Home Assistant, dort, wo jede andere Integration ihre Geheimnisse ablegt. An den Browser gehen sie nie zurück: Das Panel zeigt einen Platzhalter, und wer ihn nicht anfasst, behält den gespeicherten Wert.

### Welche Sprachen kann es?

Englisch, Deutsch, Niederländisch, Französisch, Spanisch, Italienisch, Polnisch, Dänisch, Schwedisch, Tschechisch und Portugiesisch. Das Panel folgt deiner Home-Assistant-Sprache und lässt sich in den Einstellungen auf eine davon festnageln. Übersetzt ist alles, auch die Benachrichtigungstexte und die Beschreibungen der Dienste.

Die Kataloge werden bei Bedarf geladen, einer je Sprache — eine deutsche Installation holt nie den polnischen, die zusätzlichen Sprachen kosten also nichts an Ladegewicht.

## Weitere Home-Assistant-Projekte

- [Marstek Venus Modbus](https://github.com/sphings79/marstek_venus_modbus_dev) — Marstek-Venus-Batteriespeicher über lokales Modbus TCP
- [Shelly Modbus](https://github.com/sphings79/shelly-modbus-home-assistant) — Shelly-Energiezähler und -Relais über Modbus TCP, ohne Cloud
- [MyIP.wtf](https://github.com/sphings79/myip-wtf-home-assistant) — öffentliche IPv4/IPv6, Provider und Standort als Sensoren
- [Leasing-KM-Rechner](https://github.com/sphings79/km_leasing_check_ha) — Kilometerkontingent eines Leasingfahrzeugs
- [Leasing-KM-Karte](https://github.com/sphings79/leasing_km_card) — die passende Lovelace-Karte
- [Marstek Venus BLE](https://github.com/sphings79/ha-marstek-ble) — Marstek Venus E über Bluetooth LE
- [Marstek Offline-Endpunkt](https://github.com/sphings79/Marstek-offline-endpoint) — Venus-Batterie ohne Cloud betreiben
- [venuscontrol](https://github.com/sphings79/venuscontrol) — cloudfreies Web-Bedienfeld über Web Bluetooth

## Mitwirken

Issues und Pull Requests sind willkommen. Fürs Frontend in `frontend/` einmal `npm install` und `npm run build` — die gebauten Bundles liegen im Repository, weil HACS keinen Build ausführt.

Wenn dir StateGuard eine leere Batterie oder einen stummen Rauchmelder erspart, hilft ein ⭐ auf dem Repository anderen wirklich beim Finden.

<a href="https://buymeacoffee.com/sphings"><img src="https://img.shields.io/badge/Buy%20me%20a%20coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy me a coffee"></a>

## Haftungsausschluss

StateGuard ist eine inoffizielle, aus der Community entstandene Integration. Sie steht in keiner Verbindung zum Home-Assistant-Projekt oder Nabu Casa, Inc. und wird von dort weder unterstützt noch empfohlen. Telegram, Pushover und ntfy werden von ihren jeweiligen Betreibern verantwortet; deren Nutzungsbedingungen und Ratenbegrenzungen gelten. Siehe [NOTICE](NOTICE).

**StateGuard ist eine Bequemlichkeit, kein Sicherheitssystem.** Verlass dich nicht allein darauf bei Rauchmeldern, Wassermeldern oder anderem, wo eine verpasste Meldung echte Folgen hat.

## Lizenz

[MIT](LICENSE) © sphings79

---

<sub>Home Assistant Überwachung · Entität nicht verfügbar · Gerät offline melden · Batterie schwach Warnung · Sensor meldet nicht mehr · Stale-Erkennung · Label-basierte Überwachung · HACS Integration · Telegram Benachrichtigung · Pushover · ntfy · SMTP E-Mail · Lovelace-Karte · Ruhezeiten · Eskalation · Vorfall-Historie</sub>
