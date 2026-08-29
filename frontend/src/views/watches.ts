import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, colorOf } from "../styles";
import type { Localizer } from "../localize";
import type { Config, Meta, Status, Watch } from "../types";

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
    `,
  ];

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) meta!: Meta;
  @property({ attribute: false }) status!: Status;
  @property({ attribute: false }) localize!: Localizer;

  @state() private showTemplates = false;

  private fire(name: string, detail: unknown = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
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
              return html`
                <div class="list-item">
                  <ha-icon
                    class="watch-icon"
                    icon=${severity?.icon || "mdi:shield-outline"}
                    style=${`color:${
                      problems ? colorOf(severity?.color) : "var(--secondary-text-color)"
                    }`}
                  ></ha-icon>
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
