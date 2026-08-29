import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  fallbackLocalizer,
  loadCatalogue,
  localize,
  type Localizer,
} from "../localize";
import { colorOf } from "../styles";
import type { CardData, HomeAssistant, Problem, Severity } from "../types";
import "../components/entity-menu";
import "./stateguard-card-editor";
import type { CardConfig } from "./stateguard-card-editor";

const REFRESH_INTERVAL = 10000;

/**
 * Lovelace card showing StateGuard's current problems. Shipped with the
 * integration and registered automatically, so there is nothing to install.
 */
@customElement("stateguard-card")
export class StateGuardCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    ha-card {
      padding: 0;
      overflow: hidden;
    }

    .head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 16px 8px;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .head .count {
      margin-left: auto;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 2px 10px;
      border-radius: 999px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
      color: var(--secondary-text-color);
    }

    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
    }

    .row ha-icon {
      --mdc-icon-size: 22px;
      flex-shrink: 0;
    }

    .row .body {
      min-width: 0;
      flex: 1;
    }

    .row .name {
      font-size: 0.9375rem;
      font-weight: 500;
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }

    .row .id {
      font-family: var(--code-font-family, monospace);
      font-size: 0.7rem;
      font-weight: 400;
      color: var(--secondary-text-color);
    }

    .row .why {
      font-size: 0.8125rem;
      color: var(--secondary-text-color);
      margin-top: 2px;
    }

    .row .age {
      color: var(--secondary-text-color);
      font-size: 0.8125rem;
      white-space: nowrap;
    }

    .row.muted .name {
      color: var(--secondary-text-color);
    }

    .healthy {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      color: var(--secondary-text-color);
    }

    .healthy ha-icon {
      --mdc-icon-size: 26px;
      color: var(--success-color, #43a047);
    }
  `;

  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private cardConfig: CardConfig = { type: "" };
  @state() private data?: CardData;
  @state() private translator: Localizer = fallbackLocalizer;
  private loadedLanguage = "";

  private timer?: number;

  /** Lovelace calls this with the YAML the user wrote. */
  setConfig(config: CardConfig): void {
    this.cardConfig = { ...config };
  }

  getCardSize(): number {
    return 1 + Math.min(this.visible().length, 6);
  }

  static getStubConfig(): CardConfig {
    return { type: "custom:stateguard-card" };
  }

  /** Lovelace asks for this to show a visual editor instead of raw YAML. */
  static getConfigElement(): HTMLElement {
    return document.createElement("stateguard-card-editor");
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this.load();
    this.timer = window.setInterval(() => void this.load(), REFRESH_INTERVAL);
  }

  protected willUpdate(changed: Map<string, unknown>): void {
    // Lovelace sets hass after inserting the card, so the load in
    // connectedCallback finds nothing. Without this the card would sit
    // empty until the next refresh tick.
    if (changed.has("hass") && this.hass && !this.data) {
      void this.load();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearInterval(this.timer);
  }

  private get localize(): Localizer {
    return this.translator;
  }

  private async load(): Promise<void> {
    if (!this.hass) return;
    const language = this.hass.language || "en";
    if (language !== this.loadedLanguage) {
      this.loadedLanguage = language;
      this.translator = localize(await loadCatalogue(language));
    }
    try {
      // A command every user may call: an ordinary household member has to
      // be able to see the card too, not just administrators.
      this.data = await this.hass.callWS<CardData>({ type: "stateguard/card" });
    } catch {
      // Not set up yet — the card simply stays empty.
    }
  }

  private severity(problem: Problem): Partial<Severity> | undefined {
    return this.data?.severities.find((item) => item.id === problem.severity_id);
  }

  private visible(): Problem[] {
    if (!this.data) return [];
    const wantedSeverities = this.cardConfig.severities ?? [];
    const wantedWatches = this.cardConfig.watches ?? [];

    let problems = this.data.problems.filter((problem) =>
      this.cardConfig.show_suppressed
        ? problem.status !== "pending"
        : ["alerted", "escalated"].includes(problem.status) &&
          problem.suppression === "none",
    );
    if (wantedSeverities.length) {
      problems = problems.filter(
        (problem) =>
          problem.severity_id !== null &&
          wantedSeverities.includes(problem.severity_id),
      );
    }
    if (wantedWatches.length) {
      problems = problems.filter((problem) =>
        wantedWatches.includes(problem.watch_id),
      );
    }
    problems.sort((a, b) => b.severity_priority - a.severity_priority || a.since - b.since);
    return this.cardConfig.max ? problems.slice(0, this.cardConfig.max) : problems;
  }

  private age(problem: Problem): string {
    const seconds = Math.max(0, Math.floor(Date.now() / 1000 - problem.since));
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }

  private reason(problem: Problem): string {
    if (!problem.reason_key) return problem.reason;
    return this.localize(`reason.${problem.reason_key}`, problem.reason_params);
  }

  render() {
    if (!this.data) return nothing;
    const problems = this.visible();
    const t = this.localize;

    if (!problems.length && this.cardConfig.hide_when_healthy) return nothing;

    return html`
      <ha-card>
        <div class="head">
          <ha-icon
            icon=${problems.length ? "mdi:shield-alert" : "mdi:shield-check"}
            style=${`color:${
              problems.length
                ? colorOf(this.severity(problems[0])?.color)
                : "var(--success-color, #43a047)"
            }`}
          ></ha-icon>
          <span>${this.cardConfig.title ?? "StateGuard"}</span>
          ${problems.length
            ? html`<span class="count">${problems.length}</span>`
            : nothing}
        </div>

        ${problems.length
          ? problems.map((problem) => {
              const severity = this.severity(problem);
              const muted = problem.suppression !== "none";
              return html`
                <div class=${muted ? "row muted" : "row"}>
                  <ha-icon
                    icon=${severity?.icon || "mdi:alert-circle-outline"}
                    style=${`color:${
                      muted ? "var(--secondary-text-color)" : colorOf(severity?.color)
                    }`}
                  ></ha-icon>
                  <div class="body">
                    <div class="name">
                      <sg-entity-menu
                        .entityId=${problem.entity_id}
                        .label=${problem.friendly_name}
                        .deviceId=${problem.device_id}
                        .deviceName=${problem.device_name}
                        .integrationDomain=${problem.integration_domain}
                        .integrationTitle=${problem.integration_title}
                        .localize=${t}
                      ></sg-entity-menu>
                      <span class="id">${problem.entity_id}</span>
                    </div>
                    <div class="why">
                      ${problem.watch_name} · ${this.reason(problem)}
                      ${muted ? html` · ${t(`sup.${problem.suppression}`)}` : nothing}
                    </div>
                  </div>
                  <span class="age">${this.age(problem)}</span>
                </div>
              `;
            })
          : html`
              <div class="healthy">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                <span>${t("overview.healthy")}</span>
              </div>
            `}
      </ha-card>
    `;
  }
}

// Make the card discoverable in the Lovelace card picker.
const registry = (window as unknown as { customCards?: unknown[] }).customCards ?? [];
registry.push({
  type: "stateguard-card",
  name: "StateGuard",
  description: "Current problems reported by StateGuard.",
  preview: true,
});
(window as unknown as { customCards: unknown[] }).customCards = registry;
