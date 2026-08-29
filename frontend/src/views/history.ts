import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, colorOf } from "../styles";
import type { Localizer } from "../localize";
import type { Config, Incident } from "../types";
import "../components/entity-menu";

const PAGE_SIZE = 50;
const RANGES = [1, 7, 30, 90, 365];

/** Past incidents, filterable by watch, severity and period. */
@customElement("sg-history")
export class HistoryView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        align-items: end;
      }

      .incident {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px var(--sg-gap);
        border-bottom: var(--sg-border);
      }

      .incident:last-child {
        border-bottom: none;
      }

      .incident ha-icon {
        --mdc-icon-size: 20px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .incident .body {
        flex: 1;
        min-width: 0;
      }

      .incident .name {
        font-size: 0.9375rem;
        font-weight: 500;
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }

      .incident .id {
        font-family: var(--code-font-family, monospace);
        font-size: 0.7rem;
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .incident .meta {
        font-size: 0.8125rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .incident .when {
        text-align: right;
        font-size: 0.8125rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .open {
        color: var(--warning-color, #ffa600);
      }
    `,
  ];

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) localize!: Localizer;
  @property({ attribute: false }) incidents: Incident[] = [];
  @property({ type: Number }) total = 0;

  @state() private watchId = "";
  @state() private severityId = "";
  @state() private days = 30;
  @state() private openOnly = false;

  private request(offset = 0): void {
    this.dispatchEvent(
      new CustomEvent("sg-load-history", {
        detail: {
          limit: PAGE_SIZE,
          offset,
          watch_id: this.watchId || null,
          severity_id: this.severityId || null,
          days: this.days,
          open_only: this.openOnly,
          append: offset > 0,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  firstUpdated(): void {
    this.request();
  }

  private duration(seconds: number): string {
    const total = Math.max(0, Math.round(seconds));
    if (total < 60) return `${total}s`;
    if (total < 3600) return `${Math.floor(total / 60)}m`;
    if (total < 86400) return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
    return `${Math.floor(total / 86400)}d ${Math.floor((total % 86400) / 3600)}h`;
  }

  private when(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  render() {
    const t = this.localize;
    return html`
      <div class="card">
        <div class="filters">
          <label class="field" style="margin:0">
            <span>${t("nav.watches")}</span>
            <select
              @change=${(event: Event) => {
                this.watchId = (event.target as HTMLSelectElement).value;
                this.request();
              }}
            >
              <option value="">${t("hist.all_watches")}</option>
              ${this.config.watches.map(
                (watch) => html`
                  <option value=${watch.id} ?selected=${this.watchId === watch.id}>
                    ${watch.name}
                  </option>
                `,
              )}
            </select>
          </label>
          <label class="field" style="margin:0">
            <span>${t("nav.severities")}</span>
            <select
              @change=${(event: Event) => {
                this.severityId = (event.target as HTMLSelectElement).value;
                this.request();
              }}
            >
              <option value="">${t("hist.all_severities")}</option>
              ${this.config.severities.map(
                (severity) => html`
                  <option
                    value=${severity.id}
                    ?selected=${this.severityId === severity.id}
                  >
                    ${severity.name}
                  </option>
                `,
              )}
            </select>
          </label>
          <label class="field" style="margin:0">
            <span>${t("hist.range")}</span>
            <select
              @change=${(event: Event) => {
                this.days = Number((event.target as HTMLSelectElement).value);
                this.request();
              }}
            >
              ${RANGES.map(
                (days) => html`
                  <option value=${days} ?selected=${this.days === days}>
                    ${t("hist.days", { count: days })}
                  </option>
                `,
              )}
            </select>
          </label>
        </div>
        <label class="checkbox" style="margin-top:12px;margin-bottom:0">
          <input
            type="checkbox"
            .checked=${this.openOnly}
            @change=${(event: Event) => {
              this.openOnly = (event.target as HTMLInputElement).checked;
              this.request();
            }}
          />
          <span>${t("hist.open_only")}</span>
        </label>
      </div>

      <div class="card flush">
        ${this.incidents.length
          ? html`
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${t("hist.total", { count: this.total })}
              </h2>
              ${this.incidents.map((incident) => {
                const severity = this.config.severities.find(
                  (item) => item.id === incident.severity_id,
                );
                const resolved = incident.resolved_at !== null;
                return html`
                  <div class="incident">
                    <ha-icon
                      icon=${severity?.icon || "mdi:alert-circle-outline"}
                      style=${`color:${
                        resolved
                          ? "var(--secondary-text-color)"
                          : colorOf(severity?.color)
                      }`}
                    ></ha-icon>
                    <div class="body">
                      <div class="name">
                        <sg-entity-menu
                          .entityId=${incident.entity_id}
                          .label=${incident.friendly_name ?? incident.entity_id}
                          .localize=${t}
                        ></sg-entity-menu>
                        <span class="id">${incident.entity_id}</span>
                      </div>
                      <div class="meta">
                        ${incident.watch_name} · ${incident.reason_text}
                        ${incident.escalated_at
                          ? html` · <span class="badge">${t("hist.escalated")}</span>`
                          : nothing}
                      </div>
                    </div>
                    <div class="when">
                      ${this.when(incident.started_at)}<br />
                      ${resolved
                        ? t("hist.resolved_after", {
                            duration: this.duration(
                              (incident.resolved_at ?? 0) - incident.started_at,
                            ),
                          })
                        : html`<span class="open">${t("hist.ongoing")}</span>`}
                    </div>
                  </div>
                `;
              })}
              ${this.incidents.length < this.total
                ? html`
                    <div style="padding:12px var(--sg-gap)">
                      <button
                        class="secondary"
                        @click=${() => this.request(this.incidents.length)}
                      >
                        ${t("hist.more")}
                      </button>
                    </div>
                  `
                : nothing}
            `
          : html`<div class="empty">
              <ha-icon icon="mdi:history"></ha-icon>
              <div>${t("hist.empty")}</div>
            </div>`}
      </div>
    `;
  }
}
