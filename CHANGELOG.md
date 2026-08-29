# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-29

### Added

- Nine more languages: Dutch, French, Spanish, Italian, Polish, Danish,
  Swedish, Czech and Portuguese, alongside the existing English and German.
  Everything is translated — the panel, the card, the notification texts
  assembled at runtime, and the config flow and service descriptions Home
  Assistant shows.
- The panel language can be pinned to any of them in the settings, or left
  following Home Assistant.

### Changed

- Catalogues are now loaded on demand, one chunk per language. A German
  installation never fetches the Polish catalogue, so eleven languages cost
  the panel nothing: it is still 16 kB gzipped, and the Lovelace card 3 kB.

## [0.1.3] - 2026-08-29

### Added

- A watch in the list can be opened to see what it actually covers: every
  entity with its name, its id, its current state, and the reason for any
  problem. Previously the row said "covers 12 entities" without saying which
  twelve, and the only way to find out was to open the editor.
  The list is fetched when opened rather than shipped with every status
  update, because a watch over a whole domain can cover thousands of
  entities. Problems are sorted to the top.

## [0.1.2] - 2026-08-29

### Added

- The Lovelace card now has a visual editor. It matters most for the two
  filters: watch ids are random strings, so picking "Front door" from a list
  beats looking up `56e55bdabdf0` and typing it into YAML.

### Fixed

- The card stayed empty for up to ten seconds after being placed. It loaded
  once when inserted, but Lovelace sets its data afterwards, so the first
  attempt found nothing and it waited for the next refresh.

## [0.1.1] - 2026-08-29

### Fixed

- The Lovelace card stayed empty for anyone who is not an administrator.
  Every websocket command required admin rights, including the two the card
  reads. There is now a separate read-only command carrying just what a
  problem needs to be displayed — no channels, no credentials, no settings.

### Added

- **Who sees StateGuard in the sidebar** is now a setting: administrators
  only, or everyone. Non-administrators get a read-only overview; changing
  anything stays with administrators either way. The change takes effect
  without a restart.

## [0.1.0] - 2026-08-29

First release.

### Added

- Label-driven monitoring: pick Home Assistant labels, optionally narrowed by
  area, floor, domain or integration, with per-watch exclusions.
- Six condition types — unavailable states, no data for too long, numeric
  threshold with a recovery value, state match, stuck in a state, and entity
  disappeared.
- Freely definable severity levels with their own priority, colour, channels,
  bundling window, repeat interval and escalation step.
- Suppression chain: paused watches, snooze, acknowledgement, grace period
  after a restart, connectivity entity, failed integrations, parent devices
  that are down, and quiet hours that defer rather than discard. Quiet hours
  take several periods, so weekends can differ from weekdays.
- Notification channels: any Home Assistant service, plus built-in SMTP,
  Telegram, Pushover and ntfy with their own credentials. Message text is
  Jinja2 and can be overridden per channel.
- Sidebar panel with an overview, watch editor with a live preview of the
  entities a target covers, channels, severities, incident history and
  settings. English and German.
- Lovelace card, registered automatically, showing the current problems.
- Incident history in its own SQLite file with a configurable retention.
- Entities (`binary_sensor` per watch, problem counters, a monitoring switch),
  services and events for use in automations.

[Unreleased]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/sphings79/stateguard-home-assistant/releases/tag/v0.1.0
