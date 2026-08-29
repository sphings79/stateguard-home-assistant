import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "./styles";
import { localize, type Localizer } from "./localize";
import { StateGuardApi } from "./api";
import type {
  CardData,
  Channel,
  Config,
  Incident,
  HomeAssistant,
  Meta,
  PreviewEntity,
  Severity,
  Settings,
  Status,
  Template,
  Watch,
} from "./types";
import "./views/overview";
import "./views/watches";
import "./views/watch-editor";
import "./views/channels";
import "./views/history";
import "./views/severities";
import "./views/settings";

type View =
  | "overview"
  | "watches"
  | "channels"
  | "severities"
  | "history"
  | "settings";

const STATUS_INTERVAL = 5000;

/** Sidebar panel shell: navigation, data loading and action handling. */
@customElement("stateguard-panel")
export class StateGuardPanel extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        background: var(--primary-background-color);
        min-height: 100vh;
        display: block;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 56px;
        padding: 0 16px;
        background: var(--app-header-background-color, var(--primary-color));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        font-size: 1.25rem;
        font-weight: 400;
        box-sizing: border-box;
      }

      .tabs {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        background: var(--app-header-background-color, var(--primary-color));
        padding: 0 8px;
      }

      .tab {
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        border-radius: 0;
        padding: 12px 16px;
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        opacity: 0.75;
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
      }

      .tab[data-active="true"] {
        opacity: 1;
        border-bottom-color: currentColor;
      }

      .content {
        padding: 16px;
        max-width: 900px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      .menu {
        background: transparent;
        border: none;
        padding: 6px;
        color: inherit;
        cursor: pointer;
      }

      .loading {
        padding: 48px;
        text-align: center;
        color: var(--secondary-text-color);
      }
    `,
  ];

  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ type: Boolean }) narrow = false;

  @state() private config?: Config;
  @state() private meta?: Meta;
  @state() private status?: Status;
  @state() private view: View = "overview";
  @state() private editingWatch: Watch | null = null;
  @state() private editingTemplate: Template | null = null;
  @state() private editorOpen = false;
  @state() private error = "";
  @state() private incidents: Incident[] = [];
  @state() private historyTotal = 0;

  @state() private cardData?: CardData;

  private api?: StateGuardApi;
  private timer?: number;

  /** Non-admins may look, not change. */
  private get isAdmin(): boolean {
    return this.hass?.user?.is_admin !== false;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.timer = window.setInterval(() => this.refreshStatus(), STATUS_INTERVAL);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearInterval(this.timer);
  }

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass) {
      if (!this.api) {
        this.api = new StateGuardApi(this.hass);
        void this.load();
      } else {
        this.api.update(this.hass);
      }
    }
  }

  private get localize(): Localizer {
    const preference = this.config?.settings.ui_language ?? "auto";
    return localize(
      preference === "auto" ? this.hass?.language || "en" : preference,
    );
  }

  private async load(): Promise<void> {
    if (!this.api) return;
    if (!this.isAdmin) {
      // Only the command every user may call — the configuration itself
      // never reaches a non-admin browser.
      try {
        this.cardData = await this.api.getCardData();
        this.error = "";
      } catch (err) {
        this.error = this.describeError(err);
      }
      return;
    }
    try {
      const { config, meta } = await this.api.getConfig();
      this.config = config;
      this.meta = meta;
      this.status = await this.api.getStatus();
      this.error = "";
    } catch (err) {
      this.error = this.describeError(err);
    }
  }

  private async refreshStatus(): Promise<void> {
    if (!this.api) return;
    try {
      if (!this.isAdmin) {
        this.cardData = await this.api.getCardData();
        return;
      }
      if (this.config) this.status = await this.api.getStatus();
    } catch {
      // A dropped connection recovers on the next tick.
    }
  }

  private async run(action: () => Promise<unknown>): Promise<void> {
    try {
      await action();
      await this.load();
    } catch (err) {
      this.error = this.describeError(err);
    }
  }

  /** Turn a websocket error into a sentence in the user's language. */
  private describeError(err: unknown): string {
    const error = err as { code?: string; message?: string };
    if (error?.code === "in_use") {
      return this.localize("error.in_use", { names: error.message ?? "" });
    }
    if (error?.code && ["not_loaded", "not_found"].includes(error.code)) {
      return this.localize(`error.${error.code}`);
    }
    return this.localize("common.error", {
      message: String(error?.message ?? err),
    });
  }

  private closeEditor(): void {
    this.editorOpen = false;
    this.editingWatch = null;
    this.editingTemplate = null;
  }

  private renderView() {
    if (!this.isAdmin) {
      if (!this.cardData) return html`<div class="loading">…</div>`;
      return html`
        <sg-overview
          .config=${{
            severities: this.cardData.severities,
            watches: [],
            channels: [],
            settings: { internet_entity: null },
          }}
          .status=${{
            problems: this.cardData.problems,
            watched_entity_count: this.cardData.watched_entity_count,
            resolved: {},
            monitoring_enabled: this.cardData.monitoring_enabled,
            restart_grace_until: this.cardData.restart_grace_until,
            internet_down: this.cardData.internet_down,
          }}
          .localize=${this.localize}
          .readOnly=${true}
        ></sg-overview>
      `;
    }
    if (!this.config || !this.meta || !this.status) {
      return html`<div class="loading">…</div>`;
    }

    if (this.editorOpen) {
      return html`
        <sg-watch-editor
          .config=${this.config}
          .meta=${this.meta}
          .localize=${this.localize}
          .watch=${this.editingWatch}
          .template=${this.editingTemplate}
        ></sg-watch-editor>
      `;
    }

    switch (this.view) {
      case "watches":
        return html`
          <sg-watches
            .config=${this.config}
            .meta=${this.meta}
            .status=${this.status}
            .localize=${this.localize}
          ></sg-watches>
        `;
      case "channels":
        return html`
          <sg-channels
            .config=${this.config}
            .meta=${this.meta}
            .localize=${this.localize}
          ></sg-channels>
        `;
      case "severities":
        return html`
          <sg-severities
            .config=${this.config}
            .localize=${this.localize}
          ></sg-severities>
        `;
      case "history":
        return html`
          <sg-history
            .config=${this.config}
            .localize=${this.localize}
            .incidents=${this.incidents}
            .total=${this.historyTotal}
          ></sg-history>
        `;
      case "settings":
        return html`
          <sg-settings
            .settings=${this.config.settings}
            .localize=${this.localize}
          ></sg-settings>
        `;
      default:
        return html`
          <sg-overview
            .config=${this.config}
            .status=${this.status}
            .localize=${this.localize}
          ></sg-overview>
        `;
    }
  }

  render() {
    const t = this.localize;
    // Non-admins only get the overview, so the tab bar is pointless for them.
    const views: [View, string][] = this.isAdmin
      ? [
          ["overview", "nav.overview"],
          ["watches", "nav.watches"],
          ["channels", "nav.channels"],
          ["severities", "nav.severities"],
          ["history", "nav.history"],
          ["settings", "nav.settings"],
        ]
      : [];

    return html`
      <div
        @sg-navigate=${(event: CustomEvent) => {
          this.view = event.detail.view;
        }}
        @sg-run-check=${() => this.run(() => this.api!.runCheck())}
        @sg-toggle-monitoring=${(event: CustomEvent) =>
          this.run(() => this.api!.setMonitoring(event.detail.enabled))}
        @sg-snooze=${(event: CustomEvent) =>
          this.run(() =>
            this.api!.snooze(
              event.detail.watchId,
              event.detail.entityId,
              event.detail.duration,
            ),
          )}
        @sg-acknowledge=${(event: CustomEvent) =>
          this.run(() =>
            this.api!.acknowledge(event.detail.watchId, event.detail.entityId),
          )}
        @sg-edit-watch=${(event: CustomEvent) => {
          this.editingWatch = event.detail.watch ?? null;
          this.editingTemplate = event.detail.template ?? null;
          this.editorOpen = true;
        }}
        @sg-cancel-edit=${() => this.closeEditor()}
        @sg-save-watch=${(event: CustomEvent) => {
          this.closeEditor();
          void this.run(() => this.api!.saveWatch(event.detail.watch));
        }}
        @sg-delete-watch=${(event: CustomEvent) => {
          const watch = event.detail.watch as Watch;
          if (!confirm(t("watches.confirm_delete", { name: watch.name }))) return;
          void this.run(() => this.api!.deleteWatch(watch.id));
        }}
        @sg-toggle-watch=${(event: CustomEvent) =>
          this.run(() =>
            this.api!.saveWatch({
              ...event.detail.watch,
              enabled: event.detail.enabled,
            }),
          )}
        @sg-save-channel=${(event: CustomEvent) =>
          this.run(() => this.api!.saveChannel(event.detail.channel as Channel))}
        @sg-delete-channel=${(event: CustomEvent) => {
          const channel = event.detail.channel as Channel;
          if (!confirm(t("ch.confirm_delete", { name: channel.name }))) return;
          void this.run(() => this.api!.deleteChannel(channel.id));
        }}
        @sg-test-channel=${(event: CustomEvent) => {
          const { channel, callback } = event.detail as {
            channel: Channel;
            callback: (result: { ok: boolean; error: string | null }) => void;
          };
          this.api
            ?.testChannel(channel)
            .then(callback)
            .catch((err) =>
              callback({ ok: false, error: String((err as Error)?.message ?? err) }),
            );
        }}
        @sg-load-history=${(event: CustomEvent) => {
          const { append, ...filters } = event.detail as Record<string, unknown> & {
            append: boolean;
          };
          this.api
            ?.history(filters)
            .then((page) => {
              this.incidents = append
                ? [...this.incidents, ...page.incidents]
                : page.incidents;
              this.historyTotal = page.total;
            })
            .catch((err) => {
              this.error = this.describeError(err);
            });
        }}
        @sg-watch-entities=${(event: CustomEvent) => {
          const { watchId, callback } = event.detail as {
            watchId: string;
            callback: (result: unknown) => void;
          };
          this.api
            ?.watchEntities(watchId)
            .then(callback)
            .catch(() => callback(null));
        }}
        @sg-save-severity=${(event: CustomEvent) =>
          this.run(() => this.api!.saveSeverity(event.detail.severity as Severity))}
        @sg-delete-severity=${(event: CustomEvent) => {
          const severity = event.detail.severity as Severity;
          if (!confirm(t("sev.confirm_delete", { name: severity.name }))) return;
          void this.run(() => this.api!.deleteSeverity(severity.id));
        }}
        @sg-save-settings=${(event: CustomEvent) =>
          this.run(() => this.api!.saveSettings(event.detail.settings as Settings))}
        @sg-preview=${(event: CustomEvent) => {
          const { target, callback } = event.detail as {
            target: Watch["target"];
            callback: (result: { count: number; entities: PreviewEntity[] }) => void;
          };
          this.api
            ?.preview(target)
            .then(callback)
            .catch(() => callback({ count: 0, entities: [] }));
        }}
      >
        <div class="toolbar">
          ${this.narrow
            ? html`
                <button
                  class="menu"
                  @click=${() =>
                    this.dispatchEvent(
                      new CustomEvent("hass-toggle-menu", {
                        bubbles: true,
                        composed: true,
                      }),
                    )}
                >
                  <ha-icon icon="mdi:menu"></ha-icon>
                </button>
              `
            : nothing}
          <span>StateGuard</span>
        </div>
        <div class="tabs" ?hidden=${!views.length}>
          ${views.map(
            ([id, label]) => html`
              <button
                class="tab"
                data-active=${!this.editorOpen && this.view === id}
                @click=${() => {
                  this.closeEditor();
                  this.view = id;
                }}
              >
                ${t(label)}
              </button>
            `,
          )}
        </div>
        <div class="content">
          ${this.error ? html`<p class="error">${this.error}</p>` : nothing}
          ${this.renderView()}
        </div>
      </div>
    `;
  }
}
