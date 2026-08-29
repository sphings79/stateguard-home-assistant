import type { CardData, Channel, Config, HistoryPage, Meta, PreviewEntity, Severity, Settings, Status, Watch, WatchEntity, HomeAssistant } from "./types";

/**
 * Drop an empty id before sending.
 *
 * An empty string is not "no id" to the server — it is an id that every new
 * object would share, so each would overwrite the previous one. Leaving the
 * key out entirely says "this is new" unambiguously.
 */
function withoutEmptyId<T extends { id: string }>(item: T): Partial<T> {
  if (item.id) return item;
  const { id: _unused, ...rest } = item;
  return rest as Partial<T>;
}

/** Thin wrapper around the panel's WebSocket commands. */
export class StateGuardApi {
  constructor(private hass: HomeAssistant) {}

  /** Point the wrapper at a fresher hass object. */
  update(hass: HomeAssistant): void {
    this.hass = hass;
  }

  getConfig(): Promise<{ config: Config; meta: Meta }> {
    return this.hass.callWS({ type: "stateguard/config/get" });
  }

  /** Readable by every user; carries no configuration. */
  getCardData(): Promise<CardData> {
    return this.hass.callWS({ type: "stateguard/card" });
  }

  getStatus(): Promise<Status> {
    return this.hass.callWS({ type: "stateguard/status" });
  }

  saveWatch(watch: Watch): Promise<{ watch: Watch }> {
    return this.hass.callWS({
      type: "stateguard/watch/save",
      watch: withoutEmptyId(watch),
    });
  }

  deleteWatch(watchId: string): Promise<{ deleted: string }> {
    return this.hass.callWS({ type: "stateguard/watch/delete", watch_id: watchId });
  }

  saveSeverity(severity: Severity): Promise<{ severity: Severity }> {
    return this.hass.callWS({
      type: "stateguard/severity/save",
      severity: withoutEmptyId(severity),
    });
  }

  deleteSeverity(severityId: string): Promise<{ deleted: string }> {
    return this.hass.callWS({
      type: "stateguard/severity/delete",
      severity_id: severityId,
    });
  }

  saveSettings(settings: Settings): Promise<{ settings: Settings }> {
    return this.hass.callWS({ type: "stateguard/settings/save", settings });
  }

  watchEntities(watchId: string): Promise<{ count: number; entities: WatchEntity[] }> {
    return this.hass.callWS({
      type: "stateguard/watch/entities",
      watch_id: watchId,
    });
  }

  preview(target: Watch["target"]): Promise<{ count: number; entities: PreviewEntity[] }> {
    return this.hass.callWS({ type: "stateguard/preview", target });
  }

  saveChannel(channel: Channel): Promise<{ channel_id: string }> {
    return this.hass.callWS({
      type: "stateguard/channel/save",
      channel: withoutEmptyId(channel),
    });
  }

  deleteChannel(channelId: string): Promise<{ deleted: string }> {
    return this.hass.callWS({
      type: "stateguard/channel/delete",
      channel_id: channelId,
    });
  }

  testChannel(channel: Channel): Promise<{ ok: boolean; error: string | null }> {
    return this.hass.callWS({ type: "stateguard/channel/test", channel });
  }

  history(filters: {
    limit?: number;
    offset?: number;
    watch_id?: string | null;
    severity_id?: string | null;
    days?: number | null;
    open_only?: boolean;
  }): Promise<HistoryPage> {
    return this.hass.callWS({ type: "stateguard/history", ...filters });
  }

  runCheck(): Promise<unknown> {
    return this.hass.callService("stateguard", "run_check", {});
  }

  setMonitoring(enabled: boolean): Promise<{ enabled: boolean }> {
    // Not the switch entity: its id depends on the interface language.
    return this.hass.callWS({ type: "stateguard/monitoring/set", enabled });
  }

  snooze(watchId: string | null, entityId: string | null, duration: string): Promise<unknown> {
    const data: Record<string, unknown> = { duration };
    if (watchId) data.watch_id = watchId;
    if (entityId) data.entity_id = entityId;
    return this.hass.callService("stateguard", "snooze", data);
  }

  acknowledge(watchId: string, entityId: string): Promise<unknown> {
    return this.hass.callService("stateguard", "acknowledge", {
      watch_id: watchId,
      entity_id: entityId,
    });
  }
}
