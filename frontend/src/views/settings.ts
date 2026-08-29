import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";
import type { Localizer } from "../localize";
import type { QuietWindow, Settings } from "../types";
import "../components/duration-input";

/** Global settings: restart grace, connectivity entity, quiet hours, history. */
@customElement("sg-settings")
export class SettingsView extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .window {
        border: var(--sg-border);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
      }
    `,
  ];

  @property({ attribute: false }) settings!: Settings;
  @property({ attribute: false }) localize!: Localizer;

  @state() private draft?: Settings;
  @state() private saved = false;

  private get current(): Settings {
    return this.draft ?? this.settings;
  }

  private patch(changes: Partial<Settings>): void {
    this.draft = { ...this.current, ...changes };
    this.saved = false;
  }

  private patchQuiet(changes: Partial<Settings["quiet_hours"]>): void {
    this.patch({ quiet_hours: { ...this.current.quiet_hours, ...changes } });
  }

  private patchWindow(index: number, changes: Partial<QuietWindow>): void {
    const windows = this.current.quiet_hours.windows.map((window, position) =>
      position === index ? { ...window, ...changes } : window,
    );
    this.patchQuiet({ windows });
  }

  /** A window whose end is at or before its start runs past midnight. */
  private wraps(window: QuietWindow): boolean {
    return window.end <= window.start;
  }

  private renderWindow(window: QuietWindow, index: number) {
    const t = this.localize;
    return html`
      <div class="window">
        <div class="grid">
          <label class="field" style="margin:0">
            <span>${t("settings.quiet_from")}</span>
            <input
              type="time"
              .value=${window.start}
              @change=${(event: Event) =>
                this.patchWindow(index, {
                  start: (event.target as HTMLInputElement).value,
                })}
            />
          </label>
          <label class="field" style="margin:0">
            <span>${t("settings.quiet_to")}</span>
            <input
              type="time"
              .value=${window.end}
              @change=${(event: Event) =>
                this.patchWindow(index, {
                  end: (event.target as HTMLInputElement).value,
                })}
            />
          </label>
        </div>
        ${this.wraps(window)
          ? html`<p class="hint">↪ ${t("settings.window_wraps")}</p>`
          : nothing}

        <label class="field" style="margin-top:12px">
          <span>${t("settings.weekdays")}</span>
        </label>
        <div class="chips">
          ${[0, 1, 2, 3, 4, 5, 6].map(
            (day) => html`
              <button
                type="button"
                class="chip"
                data-selected=${window.weekdays.includes(day)}
                @click=${() =>
                  this.patchWindow(index, {
                    weekdays: window.weekdays.includes(day)
                      ? window.weekdays.filter((item) => item !== day)
                      : [...window.weekdays, day].sort((a, b) => a - b),
                  })}
              >
                ${t(`day.${day}`)}
              </button>
            `,
          )}
        </div>
        ${!window.weekdays.length
          ? html`<p class="error">${t("settings.window_no_days")}</p>`
          : nothing}

        <button
          class="plain"
          style="margin-top:8px"
          @click=${() =>
            this.patchQuiet({
              windows: this.current.quiet_hours.windows.filter(
                (_, position) => position !== index,
              ),
            })}
        >
          <ha-icon icon="mdi:close"></ha-icon>
          ${t("settings.remove_window")}
        </button>
      </div>
    `;
  }

  render() {
    const settings = this.current;
    const quiet = settings.quiet_hours;

    return html`
      <div class="card">
        <h2>${this.localize("nav.settings")}</h2>

        <label class="field">
          <span>${this.localize("settings.restart_grace")}</span>
          <sg-duration
            .value=${settings.restart_grace_period}
            .localize=${this.localize}
            @value-changed=${(event: CustomEvent) =>
              this.patch({ restart_grace_period: event.detail.value })}
          ></sg-duration>
          <p class="hint">${this.localize("settings.restart_hint")}</p>
        </label>

        <label class="field">
          <span>${this.localize("settings.internet_entity")}</span>
          <input
            type="text"
            .value=${settings.internet_entity ?? ""}
            placeholder="binary_sensor.internet"
            @change=${(event: Event) =>
              this.patch({
                internet_entity:
                  (event.target as HTMLInputElement).value.trim() || null,
              })}
          />
          <p class="hint">${this.localize("settings.internet_hint")}</p>
        </label>

        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${settings.report_failed_integrations}
            @change=${(event: Event) =>
              this.patch({
                report_failed_integrations: (event.target as HTMLInputElement)
                  .checked,
              })}
          />
          <span>${this.localize("settings.failed_integrations")}</span>
        </label>
        ${settings.report_failed_integrations
          ? html`
              <label class="field">
                <select
                  @change=${(event: Event) =>
                    this.patch({
                      failed_integrations_scope: (event.target as HTMLSelectElement)
                        .value as Settings["failed_integrations_scope"],
                    })}
                >
                  <option
                    value="watched"
                    ?selected=${settings.failed_integrations_scope === "watched"}
                  >
                    ${this.localize("settings.scope_watched")}
                  </option>
                  <option
                    value="all"
                    ?selected=${settings.failed_integrations_scope === "all"}
                  >
                    ${this.localize("settings.scope_all")}
                  </option>
                </select>
              </label>
            `
          : nothing}
      </div>

      <div class="card">
        <h3>${this.localize("settings.quiet_hours")}</h3>
        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${quiet.enabled}
            @change=${(event: Event) =>
              this.patchQuiet({
                enabled: (event.target as HTMLInputElement).checked,
              })}
          />
          <span>${this.localize("settings.quiet_enabled")}</span>
        </label>
        ${quiet.enabled
          ? html`
              ${quiet.windows.length
                ? quiet.windows.map((window, index) =>
                    this.renderWindow(window, index),
                  )
                : html`<p class="hint">
                    ${this.localize("settings.no_windows")}
                  </p>`}
              <button
                class="secondary"
                @click=${() =>
                  this.patchQuiet({
                    windows: [
                      ...quiet.windows,
                      { start: "22:00", end: "07:00", weekdays: [0, 1, 2, 3, 4] },
                    ],
                  })}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this.localize("settings.add_window")}
              </button>
              <p class="hint">${this.localize("settings.quiet_hint")}</p>
            `
          : nothing}
      </div>

      <div class="card">
        <label class="field">
          <span>${this.localize("settings.history_retention")}</span>
          <div class="suffixed">
            <input
              type="number"
              min="1"
              .value=${String(settings.history_retention_days)}
              @change=${(event: Event) =>
                this.patch({
                  history_retention_days: Number(
                    (event.target as HTMLInputElement).value,
                  ),
                })}
            />
            <span class="suffix">${this.localize("unit.days")}</span>
          </div>
        </label>
        <label class="field">
          <span>${this.localize("settings.language")}</span>
          <select
            @change=${(event: Event) =>
              this.patch({
                ui_language: (event.target as HTMLSelectElement).value,
              })}
          >
            <option value="auto" ?selected=${settings.ui_language === "auto"}>
              ${this.localize("settings.language_auto")}
            </option>
            <option value="en" ?selected=${settings.ui_language === "en"}>
              English
            </option>
            <option value="de" ?selected=${settings.ui_language === "de"}>
              Deutsch
            </option>
          </select>
        </label>

        <div class="row">
          <button
            @click=${() => {
              this.dispatchEvent(
                new CustomEvent("sg-save-settings", {
                  detail: { settings },
                  bubbles: true,
                  composed: true,
                }),
              );
              this.saved = true;
            }}
          >
            ${this.localize("settings.save")}
          </button>
          ${this.saved
            ? html`<span class="badge">${this.localize("settings.saved")}</span>`
            : nothing}
        </div>
      </div>
    `;
  }
}
