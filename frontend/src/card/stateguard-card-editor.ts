import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  fallbackLocalizer,
  loadCatalogue,
  localize,
  type Localizer,
} from "../localize";
import { sharedStyles, colorOf } from "../styles";
import type { CardData, HomeAssistant } from "../types";
import "../components/chip-select";

export interface CardConfig {
  type: string;
  title?: string;
  severities?: string[];
  watches?: string[];
  hide_when_healthy?: boolean;
  show_suppressed?: boolean;
  max?: number;
}

/**
 * Visual editor for the card.
 *
 * Its real job is the two filters: watch ids are random hex strings, so
 * without a picker nobody could sensibly fill them in by hand.
 */
@customElement("stateguard-card-editor")
export class StateGuardCardEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        display: block;
        padding: 8px 0;
      }
    `,
  ];

  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private config: CardConfig = { type: "custom:stateguard-card" };
  @state() private data?: CardData;
  @state() private translator: Localizer = fallbackLocalizer;

  /** Lovelace hands us the current YAML. */
  setConfig(config: CardConfig): void {
    this.config = { ...config };
  }

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && !this.data) {
      void this.load();
    }
  }

  private get localize(): Localizer {
    return this.translator;
  }

  private async load(): Promise<void> {
    this.translator = localize(await loadCatalogue(this.hass?.language || "en"));
    try {
      this.data = await this.hass.callWS<CardData>({ type: "stateguard/card" });
    } catch {
      // StateGuard is not set up; the pickers simply stay empty.
    }
  }

  /** Tell Lovelace about the change, dropping keys that are back to default. */
  private patch(changes: Partial<CardConfig>): void {
    const next: CardConfig = { ...this.config, ...changes };
    for (const [key, value] of Object.entries(next)) {
      const empty =
        value === undefined ||
        value === "" ||
        value === false ||
        (Array.isArray(value) && value.length === 0);
      if (empty && key !== "type") delete next[key as keyof CardConfig];
    }
    this.config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const t = this.localize;
    const severities = (this.data?.severities ?? [])
      .slice()
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    const watches = this.data?.watches ?? [];

    return html`
      <label class="field">
        <span>${t("card.title")}</span>
        <input
          type="text"
          .value=${this.config.title ?? ""}
          placeholder="StateGuard"
          @input=${(event: Event) =>
            this.patch({ title: (event.target as HTMLInputElement).value })}
        />
        <p class="hint">${t("card.title_hint")}</p>
      </label>

      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${this.config.hide_when_healthy ?? false}
          @change=${(event: Event) =>
            this.patch({
              hide_when_healthy: (event.target as HTMLInputElement).checked,
            })}
        />
        <span>${t("card.hide_when_healthy")}</span>
      </label>

      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${this.config.show_suppressed ?? false}
          @change=${(event: Event) =>
            this.patch({
              show_suppressed: (event.target as HTMLInputElement).checked,
            })}
        />
        <span>${t("card.show_suppressed")}</span>
      </label>
      <p class="hint" style="margin:-8px 0 14px 28px">
        ${t("card.show_suppressed_hint")}
      </p>

      <label class="field">
        <span>${t("card.max")}</span>
        <input
          type="number"
          min="1"
          .value=${this.config.max === undefined ? "" : String(this.config.max)}
          @change=${(event: Event) => {
            const raw = (event.target as HTMLInputElement).value.trim();
            this.patch({ max: raw ? Math.max(1, Number(raw)) : undefined });
          }}
        />
        <p class="hint">${t("card.max_hint")}</p>
      </label>

      <label class="field"><span>${t("card.severities")}</span></label>
      <sg-chip-select
        .options=${severities.map((severity) => ({
          id: severity.id as string,
          name: severity.name as string,
          icon: severity.icon,
          color: severity.color,
        }))}
        .selected=${this.config.severities ?? []}
        .searchLabel=${t("common.search")}
        @value-changed=${(event: CustomEvent) =>
          this.patch({ severities: event.detail.value })}
      ></sg-chip-select>

      <label class="field" style="margin-top:16px">
        <span>${t("card.watches")}</span>
      </label>
      ${watches.length
        ? html`
            <sg-chip-select
              .options=${watches}
              .selected=${this.config.watches ?? []}
              .searchLabel=${t("common.search")}
              @value-changed=${(event: CustomEvent) =>
                this.patch({ watches: event.detail.value })}
            ></sg-chip-select>
          `
        : html`<p class="hint">${t("card.no_watches")}</p>`}

      <p class="hint" style="margin-top:12px">${t("card.filter_hint")}</p>
      ${severities.length
        ? nothing
        : html`<p class="hint" style="color:${colorOf("amber")}">
            ${t("error.not_loaded")}
          </p>`}
    `;
  }
}
