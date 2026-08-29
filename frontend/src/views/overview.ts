import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, colorOf } from "../styles";
import type { Localizer } from "../localize";
import type { Config, Problem, Status } from "../types";
import "../components/entity-menu";

/** Landing page: one big verdict, then the detail underneath. */
@customElement("sg-overview")
export class Overview extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .hero {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 28px var(--sg-gap);
      }

      .hero ha-icon {
        --mdc-icon-size: 56px;
        flex-shrink: 0;
      }

      .hero .headline {
        font-size: 1.75rem;
        font-weight: 500;
        line-height: 1.2;
      }

      .hero .sub {
        color: var(--secondary-text-color);
        margin-top: 6px;
        font-size: 0.9375rem;
      }

      .counts {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }

      .count {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        border: var(--sg-border);
        font-size: 0.875rem;
      }

      .count b {
        font-weight: 600;
      }

      .problem {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px var(--sg-gap);
        border-bottom: var(--sg-border);
      }

      .problem:last-child {
        border-bottom: none;
      }

      .problem ha-icon {
        --mdc-icon-size: 22px;
        flex-shrink: 0;
      }

      .problem .body {
        min-width: 0;
        flex: 1;
      }

      .problem .name {
        font-size: 0.9375rem;
        font-weight: 500;
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }

      .problem .entity-id {
        font-family: var(--code-font-family, monospace);
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .notice {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px var(--sg-gap);
      }

      .notice ha-icon {
        --mdc-icon-size: 28px;
        color: var(--warning-color, #ffa600);
        flex-shrink: 0;
      }

      .notice .title {
        font-weight: 500;
        font-size: 0.9375rem;
      }

      .notice .sub {
        color: var(--secondary-text-color);
        font-size: 0.8125rem;
        margin-top: 2px;
      }

      .countdown {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }

      .problem .why {
        font-size: 0.8125rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .problem .actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .muted .problem .name {
        color: var(--secondary-text-color);
      }
    `,
  ];

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) status!: Status;
  @property({ attribute: false }) localize!: Localizer;

  /** Ticks once a second so the grace-period countdown stays live. */
  @state() private now = Date.now() / 1000;
  private ticker?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.ticker = window.setInterval(() => {
      this.now = Date.now() / 1000;
    }, 1000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.ticker) window.clearInterval(this.ticker);
  }

  /** Render seconds as m:ss, or h:mm:ss once it passes an hour. */
  private countdown(seconds: number): string {
    const total = Math.max(0, Math.ceil(seconds));
    const s = total % 60;
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);
    const pad = (value: number) => String(value).padStart(2, "0");
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  private fire(name: string, detail: unknown = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private since(problem: Problem): string {
    const seconds = Math.max(0, Math.floor(Date.now() / 1000 - problem.since));
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }

  /** Render the reason in the user's language, falling back to the log text. */
  private reasonText(problem: Problem): string {
    if (!problem.reason_key) return problem.reason;
    return this.localize(`reason.${problem.reason_key}`, problem.reason_params);
  }

  private severityColor(problem: Problem): string {
    const severity = this.config.severities.find((s) => s.id === problem.severity_id);
    return colorOf(severity?.color);
  }

  private severityIcon(problem: Problem): string {
    const severity = this.config.severities.find((s) => s.id === problem.severity_id);
    return severity?.icon || "mdi:alert-circle-outline";
  }

  private renderProblem(problem: Problem, muted: boolean) {
    const suppressed = problem.suppression !== "none";
    return html`
      <div class="problem">
        <ha-icon
          icon=${this.severityIcon(problem)}
          style=${`color:${muted ? "var(--secondary-text-color)" : this.severityColor(problem)}`}
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
              .localize=${this.localize}
            ></sg-entity-menu>
            <span class="entity-id">${problem.entity_id}</span>
          </div>
          <div class="why">
            ${problem.watch_name} · ${this.reasonText(problem)} ·
            ${this.since(problem)}
            ${suppressed
              ? html` · <span class="badge"
                    >${this.localize(`sup.${problem.suppression}`)}</span
                  >`
              : nothing}
          </div>
        </div>
        ${!muted
          ? html`
              <div class="actions">
                <button
                  class="plain"
                  title="8h"
                  @click=${() =>
                    this.fire("sg-snooze", {
                      watchId: problem.watch_id,
                      entityId: problem.entity_id,
                      duration: "8h",
                    })}
                >
                  <ha-icon icon="mdi:sleep"></ha-icon>
                </button>
                <button
                  class="plain"
                  @click=${() =>
                    this.fire("sg-acknowledge", {
                      watchId: problem.watch_id,
                      entityId: problem.entity_id,
                    })}
                >
                  <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                </button>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  render() {
    const active = this.status.problems.filter(
      (problem) =>
        ["alerted", "escalated"].includes(problem.status) &&
        problem.suppression === "none",
    );
    const held = this.status.problems.filter(
      (problem) => problem.suppression !== "none",
    );
    const pending = this.status.problems.filter(
      (problem) => problem.status === "pending" && problem.suppression === "none",
    );
    const paused = !this.status.monitoring_enabled;
    const watched = this.status.watched_entity_count;

    const bySeverity = new Map<string, number>();
    for (const problem of active) {
      const key = problem.severity_id ?? "";
      bySeverity.set(key, (bySeverity.get(key) ?? 0) + 1);
    }

    let icon = "mdi:shield-check";
    let color = "var(--success-color, #4caf50)";
    let headline = this.localize("overview.healthy");
    let sub = this.localize("overview.healthy_sub", { watched });

    if (paused) {
      icon = "mdi:shield-off-outline";
      color = "var(--secondary-text-color)";
      headline = this.localize("overview.paused");
      sub = this.localize("overview.paused_sub");
    } else if (active.length) {
      const top = [...active].sort(
        (a, b) => b.severity_priority - a.severity_priority,
      )[0];
      icon = this.severityIcon(top);
      color = this.severityColor(top);
      headline = this.localize(
        active.length === 1 ? "overview.problems" : "overview.problems_plural",
        { count: active.length },
      );
      sub = this.localize("overview.watching", {
        watched,
        watches: this.config.watches.length,
      });
    }

    return html`
      <div class="card">
        <div class="hero">
          <ha-icon icon=${icon} style=${`color:${color}`}></ha-icon>
          <div>
            <div class="headline">${headline}</div>
            <div class="sub">${sub}</div>
            ${bySeverity.size
              ? html`
                  <div class="counts">
                    ${this.config.severities
                      .filter((severity) => bySeverity.has(severity.id))
                      .sort((a, b) => b.priority - a.priority)
                      .map(
                        (severity) => html`
                          <span class="count">
                            <ha-icon
                              icon=${severity.icon}
                              style=${`color:${colorOf(severity.color)};--mdc-icon-size:16px`}
                            ></ha-icon>
                            <b>${bySeverity.get(severity.id)}</b> ${severity.name}
                          </span>
                        `,
                      )}
                  </div>
                `
              : nothing}
          </div>
        </div>
        <div class="row wrap" style="padding:0 var(--sg-gap) var(--sg-gap)">
          <button class="secondary" @click=${() => this.fire("sg-run-check")}>
            <ha-icon icon="mdi:refresh"></ha-icon>
            ${this.localize("overview.run_check")}
          </button>
          <button
            class="secondary"
            @click=${() => this.fire("sg-toggle-monitoring", { enabled: paused })}
          >
            <ha-icon icon=${paused ? "mdi:play" : "mdi:pause"}></ha-icon>
            ${this.localize(paused ? "overview.resume" : "overview.pause")}
          </button>
        </div>
      </div>

      ${this.status.restart_grace_until && this.status.restart_grace_until > this.now
        ? html`
            <div class="card flush">
              <div class="notice">
                <ha-icon icon="mdi:timer-sand"></ha-icon>
                <div>
                  <div class="title">${this.localize("overview.grace")}</div>
                  <div class="sub">
                    ${this.localize("overview.grace_sub")}
                    <span class="countdown"
                      >${this.countdown(
                        this.status.restart_grace_until - this.now,
                      )}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          `
        : nothing}
      ${this.status.internet_down
        ? html`
            <div class="card flush">
              <div class="notice">
                <ha-icon icon="mdi:wifi-off"></ha-icon>
                <div>
                  <div class="title">
                    ${this.localize("overview.internet_down")}
                  </div>
                  <div class="sub">
                    ${this.localize("overview.internet_sub", {
                      entity: this.config.settings.internet_entity ?? "",
                    })}
                  </div>
                </div>
              </div>
            </div>
          `
        : nothing}

      ${!this.config.watches.length
        ? html`
            <div class="card">
              <div class="empty">
                <ha-icon icon="mdi:shield-plus-outline"></ha-icon>
                <h3>${this.localize("overview.no_watches")}</h3>
                <p class="hint">${this.localize("overview.no_watches_sub")}</p>
                <br />
                <button @click=${() => this.fire("sg-navigate", { view: "watches" })}>
                  ${this.localize("watches.from_template")}
                </button>
              </div>
            </div>
          `
        : nothing}

      ${active.length
        ? html`
            <div class="card flush">
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${this.localize("overview.current")}
              </h2>
              ${active.map((problem) => this.renderProblem(problem, false))}
            </div>
          `
        : nothing}
      ${pending.length
        ? html`
            <div class="card flush muted">
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${this.localize("overview.pending")}
              </h2>
              ${pending.map((problem) => this.renderProblem(problem, true))}
            </div>
          `
        : nothing}
      ${held.length
        ? html`
            <div class="card flush muted">
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${this.localize("overview.suppressed")}
              </h2>
              ${held.map((problem) => this.renderProblem(problem, true))}
            </div>
          `
        : nothing}
    `;
  }
}
