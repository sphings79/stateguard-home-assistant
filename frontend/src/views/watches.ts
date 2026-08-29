import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, colorOf } from "../styles";
import type { Localizer } from "../localize";
import type { Config, Meta, Status, Watch, WatchEntity } from "../types";
import "../components/entity-menu";

/** List of configured watches, plus the template picker for new ones. */
@customElement("sg-watches")
export class Watches extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .template {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px var(--sg-gap);
        border-bottom: var(--sg-border);
        cursor: pointer;
      }

      .template:last-child {
        border-bottom: none;
      }

      .template:hover {
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
      }

      .template ha-icon {
        --mdc-icon-size: 24px;
        color: var(--primary-color);
        margin-top: 2px;
      }

      .watch-icon {
        --mdc-icon-size: 24px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* The whole row opens the list, so it has to look clickable. */
      .list-item .opener {
        flex: 1;
        min-width: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .opener .chevron {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }

      .entities {
        border-top: var(--sg-border);
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.06));
      }

      .entity {
        display: flex;
        align-items: baseline;
        gap: 10px;
        padding: 9px var(--sg-gap) 9px 52px;
        border-bottom: var(--sg-border);
        flex-wrap: wrap;
      }

      .entity:last-child {
        border-bottom: none;
      }

      .entity .id {
        font-family: var(--code-font-family, monospace);
        font-size: 0.72rem;
        color: var(--secondary-text-color);
      }

      .entity .why {
        flex-basis: 100%;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        padding-left: 0;
      }

      .entity .value {
        margin-left: auto;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .entity.bad .value {
        color: var(--error-color, #db4437);
      }

      .entity.bad .why {
        color: var(--error-color, #db4437);
      }

      .entities .note {
        padding: 12px var(--sg-gap) 12px 52px;
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
    `,
  ];

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) meta!: Meta;
  @property({ attribute: false }) status!: Status;
  @property({ attribute: false }) localize!: Localizer;

  @state() private showTemplates = false;
  @state() private expanded: string | null = null;
  @state() private entities: WatchEntity[] | null = null;
  @state() private loading = false;

  private fire(name: string, detail: unknown = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  /** Open a watch's entity list, or close it again. */
  private toggleEntities(watch: Watch): void {
    if (this.expanded === watch.id) {
      this.expanded = null;
      this.entities = null;
      return;
    }
    this.expanded = watch.id;
    this.entities = null;
    this.loading = true;
    this.dispatchEvent(
      new CustomEvent("sg-watch-entities", {
        detail: {
          watchId: watch.id,
          callback: (result: { entities: WatchEntity[] } | null) => {
            this.loading = false;
            // A second click may have moved on while this was in flight.
            if (this.expanded === watch.id) this.entities = result?.entities ?? [];
          },
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private reasonText(entity: WatchEntity): string {
    const problem = entity.problem;
    if (!problem) return "";
    if (!problem.reason_key) return problem.reason;
    return this.localize(`reason.${problem.reason_key}`, problem.reason_params);
  }

  private renderEntities() {
    const t = this.localize;
    if (this.loading) {
      return html`<div class="note">${t("watches.loading")}</div>`;
    }
    if (!this.entities?.length) {
      return html`<div class="note">${t("watches.entities_none")}</div>`;
    }
    return this.entities.map((entity) => {
      const problem = entity.problem;
      const bad = problem !== null && problem.status !== "ok";
      return html`
        <div class=${bad ? "entity bad" : "entity"}>
          <sg-entity-menu
            .entityId=${entity.entity_id}
            .label=${entity.friendly_name}
            .deviceId=${entity.device_id}
            .deviceName=${entity.device_name}
            .integrationDomain=${entity.integration_domain}
            .integrationTitle=${entity.integration_title}
            .localize=${t}
          ></sg-entity-menu>
          <span class="id">${entity.entity_id}</span>
          <span class="value">${entity.state ?? "—"}</span>
          ${bad
            ? html`<span class="why">
                ${this.reasonText(entity)}
                ${problem.suppression !== "none"
                  ? html` · ${t(`sup.${problem.suppression}`)}`
                  : nothing}
              </span>`
            : nothing}
        </div>
      `;
    });
  }

  private problemsFor(watch: Watch): number {
    return this.status.problems.filter(
      (problem) =>
        problem.watch_id === watch.id &&
        ["alerted", "escalated"].includes(problem.status) &&
        problem.suppression === "none",
    ).length;
  }

  render() {
    return html`
      <div class="card">
        <div class="row wrap">
          <button @click=${() => this.fire("sg-edit-watch", { watch: null })}>
            <ha-icon icon="mdi:plus"></ha-icon>
            ${this.localize("watches.add")}
          </button>
          <button
            class="secondary"
            @click=${() => {
              this.showTemplates = !this.showTemplates;
            }}
          >
            <ha-icon icon="mdi:file-document-multiple-outline"></ha-icon>
            ${this.localize("watches.from_template")}
          </button>
        </div>
      </div>

      ${this.showTemplates
        ? html`
            <div class="card flush">
              ${this.meta.templates.map(
                (template) => html`
                  <div
                    class="template"
                    @click=${() => {
                      this.showTemplates = false;
                      this.fire("sg-edit-watch", { template });
                    }}
                  >
                    <ha-icon icon=${template.icon}></ha-icon>
                    <div>
                      <div class="title">
                        ${this.localize(`template.${template.template_id}.name`)}
                      </div>
                      <div class="subtitle">
                        ${this.localize(
                          `template.${template.template_id}.description`,
                        )}
                      </div>
                    </div>
                  </div>
                `,
              )}
            </div>
          `
        : nothing}

      <div class="card flush">
        ${this.config.watches.length
          ? this.config.watches.map((watch) => {
              const severity = this.config.severities.find(
                (item) => item.id === watch.severity_id,
              );
              const problems = this.problemsFor(watch);
              const covered = this.status.resolved[watch.id] ?? 0;
              const open = this.expanded === watch.id;
              return html`
                <div class="list-item">
                  <ha-icon
                    class="watch-icon"
                    icon=${severity?.icon || "mdi:shield-outline"}
                    style=${`color:${
                      problems ? colorOf(severity?.color) : "var(--secondary-text-color)"
                    }`}
                  ></ha-icon>
                  <div
                    class="opener"
                    role="button"
                    tabindex="0"
                    title=${this.localize(
                      open ? "watches.hide_entities" : "watches.show_entities",
                    )}
                    @click=${() => this.toggleEntities(watch)}
                    @keydown=${(event: KeyboardEvent) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        this.toggleEntities(watch);
                      }
                    }}
                  >
                    <div style="flex:1;min-width:0">
                    <div class="title">
                      ${watch.name}
                      ${!watch.enabled
                        ? html`<span class="badge"
                            >${this.localize("watches.paused")}</span
                          >`
                        : nothing}
                      ${problems
                        ? html`<span
                            class="badge"
                            style=${`background:${colorOf(
                              severity?.color,
                            )};color:#fff`}
                            >${problems}</span
                          >`
                        : nothing}
                    </div>
                    <div class="subtitle">
                      ${severity?.name ?? "—"} ·
                      ${this.localize(
                        covered === 1 ? "watches.covers_one" : "watches.covers",
                        { count: covered },
                      )}
                    </div>
                    </div>
                    <ha-icon
                      class="chevron"
                      icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}
                    ></ha-icon>
                  </div>
                  <button
                    class="plain"
                    @click=${() =>
                      this.fire("sg-toggle-watch", {
                        watch,
                        enabled: !watch.enabled,
                      })}
                  >
                    <ha-icon
                      icon=${watch.enabled ? "mdi:pause" : "mdi:play"}
                    ></ha-icon>
                  </button>
                  <button
                    class="plain"
                    @click=${() => this.fire("sg-edit-watch", { watch })}
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="plain"
                    @click=${() => this.fire("sg-delete-watch", { watch })}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
                ${open
                  ? html`<div class="entities">${this.renderEntities()}</div>`
                  : nothing}
              `;
            })
          : html`<div class="empty">
              <ha-icon icon="mdi:shield-outline"></ha-icon>
              <div>${this.localize("watches.empty")}</div>
            </div>`}
      </div>
    `;
  }
}
