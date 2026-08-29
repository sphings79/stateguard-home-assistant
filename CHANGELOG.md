# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/sphings79/stateguard-home-assistant/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/sphings79/stateguard-home-assistant/releases/tag/v0.1.0
