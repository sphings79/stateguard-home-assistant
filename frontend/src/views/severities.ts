import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, COLORS, colorOf } from "../styles";
import type { Localizer } from "../localize";
import type { Config, Severity } from "../types";
import "../components/chip-select";
import "../components/duration-input";

const newSeverity = (): Severity => ({
  id: "",
  name: "",
  priority: 50,
  color: "amber",
  icon: "mdi:alert-outline",
  channels: [],
  ignore_quiet_hours: false,
  persistent_notification: true,
  bundle_window: 60,
  repeat_interval: 0,
  escalation_after: 0,
  escalation_channels: [],
});

/** Manage severity levels: priority, colour and alerting behaviour. */
@customElement("sg-severities")
export class Severities extends LitElement {
  static styles = sharedStyles;

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) localize!: Localizer;

  @state() private editing: Severity | null = null;

  private fire(name: string, detail: unknown = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private patch(changes: Partial<Severity>): void {
    if (this.editing) this.editing = { ...this.editing, ...changes };
  }

  private usedBy(severity: Severity): number {
    return this.config.watches.filter((watch) => watch.severity_id === severity.id)
      .length;
  }

  private renderEditor(severity: Severity) {
    return html`
      <div class="card">
        <h2>${severity.name || this.localize("sev.add")}</h2>
        <div class="grid">
          <label class="field">
            <span>${this.localize("sev.name")}</span>
            <input
              type="text"
              .value=${severity.name}
              @input=${(event: Event) =>
                this.patch({ name: (event.target as HTMLInputElement).value })}
            />
          </label>
          <label class="field">
            <span>${this.localize("sev.priority")}</span>
            <input
              type="number"
              min="0"
              max="100"
              .value=${String(severity.priority)}
              @change=${(event: Event) =>
                this.patch({
                  priority: Number((event.target as HTMLInputElement).value),
                })}
            />
          </label>
          <label class="field">
            <span>${this.localize("sev.color")}</span>
            <select
              @change=${(event: Event) =>
                this.patch({ color: (event.target as HTMLSelectElement).value })}
            >
              ${Object.keys(COLORS).map(
                (name) => html`
                  <option value=${name} ?selected=${severity.color === name}>
                    ${this.localize(`color.${name}`)}
                  </option>
                `,
              )}
            </select>
          </label>
          <label class="field">
            <span>${this.localize("sev.icon")}</span>
            <input
              type="text"
              .value=${severity.icon}
              placeholder="mdi:alert"
              @input=${(event: Event) =>
                this.patch({ icon: (event.target as HTMLInputElement).value })}
            />
          </label>
        </div>

        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${severity.persistent_notification}
            @change=${(event: Event) =>
              this.patch({
                persistent_notification: (event.target as HTMLInputElement).checked,
              })}
          />
          <span>${this.localize("sev.persistent_notification")}</span>
        </label>
        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${severity.ignore_quiet_hours}
            @change=${(event: Event) =>
              this.patch({
                ignore_quiet_hours: (event.target as HTMLInputElement).checked,
              })}
          />
          <span>${this.localize("sev.ignore_quiet_hours")}</span>
        </label>

        <div class="grid">
          <label class="field">
            <span>${this.localize("sev.bundle_window")}</span>
            <sg-duration
              .value=${severity.bundle_window}
              .localize=${this.localize}
              @value-changed=${(event: CustomEvent) =>
                this.patch({ bundle_window: event.detail.value })}
            ></sg-duration>
            <p class="hint">${this.localize("sev.bundle_hint")}</p>
          </label>
          <label class="field">
            <span>${this.localize("sev.repeat_interval")}</span>
            <sg-duration
              .value=${severity.repeat_interval}
              .localize=${this.localize}
              @value-changed=${(event: CustomEvent) =>
                this.patch({ repeat_interval: event.detail.value })}
            ></sg-duration>
            <p class="hint">${this.localize("sev.repeat_hint")}</p>
          </label>
          <label class="field">
            <span>${this.localize("sev.escalation_after")}</span>
            <sg-duration
              .value=${severity.escalation_after}
              .localize=${this.localize}
              @value-changed=${(event: CustomEvent) =>
                this.patch({ escalation_after: event.detail.value })}
            ></sg-duration>
            <p class="hint">${this.localize("sev.escalation_hint")}</p>
          </label>
        </div>

        <label class="field" style="margin-top:8px">
          <span>${this.localize("sev.channels")}</span>
        </label>
        <sg-chip-select
          .options=${this.config.channels.map((channel) => ({
            id: channel.id,
            name: channel.name,
          }))}
          .selected=${severity.channels}
          .searchLabel=${this.localize("common.search")}
          @value-changed=${(event: CustomEvent) =>
            this.patch({ channels: event.detail.value })}
        ></sg-chip-select>

        ${severity.escalation_after > 0
          ? html`
              <label class="field" style="margin-top:14px">
                <span>${this.localize("sev.escalation_channels")}</span>
              </label>
              <sg-chip-select
                .options=${this.config.channels.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                }))}
                .selected=${severity.escalation_channels}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patch({ escalation_channels: event.detail.value })}
              ></sg-chip-select>
            `
          : nothing}

        <div class="row" style="margin-top:16px">
          <button
            @click=${() => {
              this.fire("sg-save-severity", { severity: this.editing });
              this.editing = null;
            }}
          >
            ${this.localize("editor.save")}
          </button>
          <button
            class="secondary"
            @click=${() => {
              this.editing = null;
            }}
          >
            ${this.localize("editor.cancel")}
          </button>
        </div>
      </div>
    `;
  }

  render() {
    if (this.editing) return this.renderEditor(this.editing);

    return html`
      <div class="card">
        <button
          @click=${() => {
            this.editing = newSeverity();
          }}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${this.localize("sev.add")}
        </button>
        <p class="hint">${this.localize("sev.priority_hint")}</p>
      </div>

      <div class="card flush">
        ${this.config.severities
          .slice()
          .sort((a, b) => b.priority - a.priority)
          .map((severity) => {
            const used = this.usedBy(severity);
            return html`
              <div class="list-item">
                <ha-icon
                  icon=${severity.icon}
                  style=${`color:${colorOf(severity.color)};--mdc-icon-size:24px`}
                ></ha-icon>
                <div style="flex:1;min-width:0">
                  <div class="title">
                    ${severity.name}
                    <span class="badge">${severity.priority}</span>
                  </div>
                  <div class="subtitle">
                    ${this.localize(
                      used === 1 ? "sev.in_use_one" : "sev.in_use",
                      { count: used },
                    )}
                    ${severity.ignore_quiet_hours
                      ? html` · ${this.localize("sev.ignore_quiet_hours")}`
                      : nothing}
                  </div>
                </div>
                <button
                  class="plain"
                  @click=${() => {
                    this.editing = structuredClone(severity);
                  }}
                >
                  <ha-icon icon="mdi:pencil"></ha-icon>
                </button>
                <button
                  class="plain"
                  ?disabled=${used > 0}
                  @click=${() => this.fire("sg-delete-severity", { severity })}
                >
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </div>
            `;
          })}
      </div>
    `;
  }
}
