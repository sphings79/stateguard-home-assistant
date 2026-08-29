# StateGuard

**Label the devices that matter, and StateGuard tells you when they stop answering.**

Watches Home Assistant labels for entities going unavailable, falling silent, or
crossing a threshold — with its own panel, its own Lovelace card, and
notifications through SMTP, Telegram, Pushover, ntfy or any Home Assistant
service.

## What it catches

- **Unavailable or unknown** — a device fell off the network
- **No data for too long** — measured against `last_reported`, so devices that
  keep sending the same value are not mistaken for dead
- **Numeric thresholds** — battery below 25 %, with a separate recovery value
  so readings do not flap around the limit
- **State is (not)**, **stuck in a state**, **entity disappeared**

## What makes it quiet when it should be

- Grace period after a Home Assistant restart, with a visible countdown
- One message when an integration or a bridge fails, not fifty
- Quiet hours that defer rather than discard
- Snooze and acknowledge, per entity or per watch

## After installing

Settings → Devices & services → Add integration → **StateGuard**. There is
nothing to fill in; open **StateGuard** in the sidebar and start from one of
the five templates. The Lovelace card registers itself.

Full documentation, screenshots and automation examples are in the
[README](https://github.com/sphings79/stateguard-home-assistant).

---

Unofficial and community built — not affiliated with or endorsed by the Home
Assistant project. Telegram, Pushover and ntfy are operated by their
respective owners.

If it saves you a dead battery, a ⭐ helps others find it.
