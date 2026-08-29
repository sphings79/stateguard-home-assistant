import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";
import type { Localizer } from "../localize";
import type {
  Condition,
  ConditionType,
  Config,
  Meta,
  PreviewEntity,
  Target,
  Template,
  Watch,
} from "../types";
import "../components/chip-select";
import "../components/entity-list";
import "../components/duration-input";

const CONDITION_TYPES: ConditionType[] = [
  "unavailable_state",
  "stale",
  "numeric_threshold",
  "state_match",
  "state_duration",
  "entity_missing",
];

const BAD_STATES = ["unavailable", "unknown", "", "none"];

const emptyTarget = (): Target => ({
  labels: [],
  label_mode: "any",
  areas: [],
  floors: [],
  domains: [],
  integrations: [],
  entities: [],
  include_device_entities: true,
  include_diagnostic: false,
  exclude_labels: [],
  exclude_entities: [],
});

const emptyCondition = (type: ConditionType): Condition => ({
  type,
  states: type === "unavailable_state" ? ["unavailable", "unknown"] : [],
  negate: false,
  time_basis: "last_reported",
  duration: type === "stale" ? 86400 : 600,
  target_state: null,
  source: "state",
  operator: "le",
  value: type === "numeric_threshold" ? 25 : null,
  value2: null,
  recovery_value: null,
});

const emptyWatch = (severityId: string): Watch => ({
  id: "",
  name: "",
  enabled: true,
  severity_id: severityId,
  order: 0,
  target: emptyTarget(),
  conditions: [emptyCondition("unavailable_state")],
  grace_period: 300,
  restart_grace: null,
  overlap_mode: "all",
  notify_on_clear: true,
  suppress_by_parent: true,
  group_alerts: true,
  channels: [],
});

/** Editor for a single watch, with a live preview of what it covers. */
@customElement("sg-watch-editor")
export class WatchEditor extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .section {
        border-top: var(--sg-border);
        padding-top: var(--sg-gap);
        margin-top: var(--sg-gap);
      }

      .condition {
        border: var(--sg-border);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 10px;
      }

      .duration {
        display: flex;
        gap: 8px;
      }

      .duration input {
        flex: 1;
      }

      .duration select {
        width: auto;
      }

      details summary {
        cursor: pointer;
        font-weight: 500;
        padding: 6px 0;
        user-select: none;
      }

      .preview-head {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 8px;
      }

      .sticky {
        position: sticky;
        bottom: 0;
        background: var(--card-background-color, #fff);
        border-top: var(--sg-border);
        padding: 12px var(--sg-gap);
        display: flex;
        gap: 10px;
        margin: var(--sg-gap) calc(-1 * var(--sg-gap)) calc(-1 * var(--sg-gap));
      }
    `,
  ];

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) meta!: Meta;
  @property({ attribute: false }) localize!: Localizer;
  @property({ attribute: false }) watch: Watch | null = null;
  @property({ attribute: false }) template: Template | null = null;

  @state() private draft!: Watch;
  @state() private preview: PreviewEntity[] = [];
  @state() private previewCount = 0;
  @state() private error = "";
  private previewTimer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    // Prefer a mid-range severity over whichever happens to be stored first.
    const ranked = [...this.config.severities].sort(
      (a, b) => a.priority - b.priority,
    );
    const fallback =
      ranked[Math.floor(ranked.length / 2)]?.id ?? ranked[0]?.id ?? "";
    if (this.watch) {
      this.draft = structuredClone(this.watch);
    } else if (this.template) {
      const base = emptyWatch(fallback);
      this.draft = {
        ...base,
        ...this.template.watch,
        name: this.localize(`template.${this.template.template_id}.name`),
        target: emptyTarget(),
        conditions: (this.template.watch.conditions ?? base.conditions).map(
          (condition) => ({ ...emptyCondition("unavailable_state"), ...condition }),
        ),
      } as Watch;
    } else {
      this.draft = emptyWatch(fallback);
    }
    this.requestPreview();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.previewTimer) window.clearTimeout(this.previewTimer);
  }

  private fire(name: string, detail: unknown = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  /** Ask the backend what the current target resolves to, debounced. */
  private requestPreview(): void {
    if (this.previewTimer) window.clearTimeout(this.previewTimer);
    this.previewTimer = window.setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent("sg-preview", {
          detail: {
            target: this.draft.target,
            callback: (result: { count: number; entities: PreviewEntity[] }) => {
              this.previewCount = result.count;
              this.preview = result.entities;
            },
          },
          bubbles: true,
          composed: true,
        }),
      );
    }, 250);
  }

  private patch(changes: Partial<Watch>): void {
    this.draft = { ...this.draft, ...changes };
  }

  private patchTarget(changes: Partial<Target>): void {
    this.draft = { ...this.draft, target: { ...this.draft.target, ...changes } };
    this.requestPreview();
  }

  private patchCondition(index: number, changes: Partial<Condition>): void {
    const conditions = this.draft.conditions.map((condition, position) =>
      position === index ? { ...condition, ...changes } : condition,
    );
    this.patch({ conditions });
  }

  private save(): void {
    if (!this.draft.name.trim()) {
      this.error = this.localize("editor.needs_name");
      return;
    }
    if (!this.draft.conditions.length) {
      this.error = this.localize("editor.no_conditions");
      return;
    }
    this.error = "";
    this.fire("sg-save-watch", { watch: this.draft });
  }

  private renderConditionBody(condition: Condition, index: number) {
    switch (condition.type) {
      case "unavailable_state":
        return html`
          <label class="field"><span>${this.localize("cond.states")}</span></label>
          <div class="chips">
            ${BAD_STATES.map(
              (value) => html`
                <button
                  type="button"
                  class="chip"
                  data-selected=${condition.states.includes(value)}
                  @click=${() =>
                    this.patchCondition(index, {
                      states: condition.states.includes(value)
                        ? condition.states.filter((item) => item !== value)
                        : [...condition.states, value],
                    })}
                >
                  ${value === "" ? this.localize("cond.state_empty") : value}
                </button>
              `,
            )}
          </div>
        `;
      case "stale":
        return html`
          <label class="field">
            <span>${this.localize("cond.time_basis")}</span>
            <select
              @change=${(event: Event) =>
                this.patchCondition(index, {
                  time_basis: (event.target as HTMLSelectElement)
                    .value as Condition["time_basis"],
                })}
            >
              ${(["last_reported", "last_updated", "last_changed"] as const).map(
                (basis) => html`
                  <option value=${basis} ?selected=${condition.time_basis === basis}>
                    ${this.localize(`cond.basis_${basis}`)}
                  </option>
                `,
              )}
            </select>
          </label>
          <label class="field">
            <span>${this.localize("cond.duration")}</span>
            <sg-duration
              .value=${condition.duration}
              .localize=${this.localize}
              @value-changed=${(event: CustomEvent) =>
                this.patchCondition(index, { duration: event.detail.value })}
            ></sg-duration>
          </label>
        `;
      case "numeric_threshold":
        return html`
          <label class="field">
            <span>${this.localize("cond.source")}</span>
            <input
              type="text"
              .value=${condition.source}
              placeholder="state"
              @change=${(event: Event) =>
                this.patchCondition(index, {
                  source: (event.target as HTMLInputElement).value || "state",
                })}
            />
          </label>
          <div class="grid">
            <label class="field">
              <span>${this.localize("cond.operator")}</span>
              <select
                @change=${(event: Event) =>
                  this.patchCondition(index, {
                    operator: (event.target as HTMLSelectElement)
                      .value as Condition["operator"],
                  })}
              >
                ${(["lt", "le", "gt", "ge", "outside", "inside"] as const).map(
                  (value) => html`
                    <option value=${value} ?selected=${condition.operator === value}>
                      ${this.localize(`cond.op_${value}`)}
                    </option>
                  `,
                )}
              </select>
            </label>
            <label class="field">
              <span>${this.localize("cond.value")}</span>
              <input
                type="number"
                step="any"
                .value=${condition.value === null ? "" : String(condition.value)}
                @change=${(event: Event) =>
                  this.patchCondition(index, {
                    value: numberOrNull((event.target as HTMLInputElement).value),
                  })}
              />
            </label>
            ${["outside", "inside"].includes(condition.operator)
              ? html`
                  <label class="field">
                    <span>${this.localize("cond.value2")}</span>
                    <input
                      type="number"
                      step="any"
                      .value=${condition.value2 === null
                        ? ""
                        : String(condition.value2)}
                      @change=${(event: Event) =>
                        this.patchCondition(index, {
                          value2: numberOrNull(
                            (event.target as HTMLInputElement).value,
                          ),
                        })}
                    />
                  </label>
                `
              : nothing}
            <label class="field">
              <span>${this.localize("cond.recovery_value")}</span>
              <input
                type="number"
                step="any"
                .value=${condition.recovery_value === null
                  ? ""
                  : String(condition.recovery_value)}
                @change=${(event: Event) =>
                  this.patchCondition(index, {
                    recovery_value: numberOrNull(
                      (event.target as HTMLInputElement).value,
                    ),
                  })}
              />
            </label>
          </div>
          <p class="hint">${this.localize("cond.recovery_hint")}</p>
        `;
      case "state_match":
        return html`
          <label class="field">
            <span>${this.localize("cond.states")}</span>
            <input
              type="text"
              .value=${condition.states.join(", ")}
              placeholder="unlocked, open"
              @change=${(event: Event) =>
                this.patchCondition(index, {
                  states: (event.target as HTMLInputElement).value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })}
            />
          </label>
          <label class="checkbox">
            <input
              type="checkbox"
              .checked=${condition.negate}
              @change=${(event: Event) =>
                this.patchCondition(index, {
                  negate: (event.target as HTMLInputElement).checked,
                })}
            />
            <span>${this.localize("cond.negate")}</span>
          </label>
        `;
      case "state_duration":
        return html`
          <label class="field">
            <span>${this.localize("cond.target_state")}</span>
            <input
              type="text"
              .value=${condition.target_state ?? ""}
              placeholder="unlocked"
              @change=${(event: Event) =>
                this.patchCondition(index, {
                  target_state: (event.target as HTMLInputElement).value || null,
                })}
            />
          </label>
          <label class="field">
            <span>${this.localize("cond.duration")}</span>
            <sg-duration
              .value=${condition.duration}
              .localize=${this.localize}
              @value-changed=${(event: CustomEvent) =>
                this.patchCondition(index, { duration: event.detail.value })}
            ></sg-duration>
          </label>
        `;
      default:
        return nothing;
    }
  }

  render() {
    const target = this.draft.target;
    return html`
      <div class="card">
        <h2>${this.draft.name || this.localize("editor.new")}</h2>

        <div class="grid">
          <label class="field">
            <span>${this.localize("editor.name")}</span>
            <input
              type="text"
              .value=${this.draft.name}
              @input=${(event: Event) =>
                this.patch({ name: (event.target as HTMLInputElement).value })}
            />
          </label>
          <label class="field">
            <span>${this.localize("editor.severity")}</span>
            <select
              @change=${(event: Event) =>
                this.patch({
                  severity_id: (event.target as HTMLSelectElement).value,
                })}
            >
              ${this.config.severities
                .slice()
                .sort((a, b) => b.priority - a.priority)
                .map(
                  (severity) => html`
                    <option
                      value=${severity.id}
                      ?selected=${this.draft.severity_id === severity.id}
                    >
                      ${severity.name}
                    </option>
                  `,
                )}
            </select>
          </label>
        </div>

        <div class="section">
          <h3>${this.localize("editor.target")}</h3>
          <label class="field"><span>${this.localize("editor.labels")}</span></label>
          <sg-chip-select
            .options=${this.meta.labels}
            .selected=${target.labels}
            .searchLabel=${this.localize("common.search")}
            @value-changed=${(event: CustomEvent) =>
              this.patchTarget({ labels: event.detail.value })}
          ></sg-chip-select>

          ${target.labels.length > 1
            ? html`
                <label class="field" style="margin-top:12px">
                  <span>${this.localize("editor.label_mode")}</span>
                  <select
                    @change=${(event: Event) =>
                      this.patchTarget({
                        label_mode: (event.target as HTMLSelectElement)
                          .value as Target["label_mode"],
                      })}
                  >
                    <option value="any" ?selected=${target.label_mode === "any"}>
                      ${this.localize("editor.label_mode_any")}
                    </option>
                    <option value="all" ?selected=${target.label_mode === "all"}>
                      ${this.localize("editor.label_mode_all")}
                    </option>
                  </select>
                </label>
              `
            : nothing}

          <label class="checkbox" style="margin-top:12px">
            <input
              type="checkbox"
              .checked=${target.include_device_entities}
              @change=${(event: Event) =>
                this.patchTarget({
                  include_device_entities: (event.target as HTMLInputElement).checked,
                })}
            />
            <span>${this.localize("editor.include_device_entities")}</span>
          </label>
          <label class="checkbox">
            <input
              type="checkbox"
              .checked=${target.include_diagnostic}
              @change=${(event: Event) =>
                this.patchTarget({
                  include_diagnostic: (event.target as HTMLInputElement).checked,
                })}
            />
            <span>${this.localize("editor.include_diagnostic")}</span>
          </label>

          <details>
            <summary>${this.localize("editor.advanced")}</summary>
            <div style="padding-top:10px">
              <label class="field"><span>${this.localize("editor.areas")}</span></label>
              <sg-chip-select
                .options=${this.meta.areas}
                .selected=${target.areas}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patchTarget({ areas: event.detail.value })}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.floors")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.floors}
                .selected=${target.floors}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patchTarget({ floors: event.detail.value })}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.domains")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.domains.map((domain) => ({
                  id: domain,
                  name: domain,
                }))}
                .selected=${target.domains}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patchTarget({ domains: event.detail.value })}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.integrations")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.integrations.map((integration) => ({
                  id: integration.id,
                  name: integration.title,
                }))}
                .selected=${target.integrations}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patchTarget({ integrations: event.detail.value })}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.entities")}</span>
                <input
                  type="text"
                  .value=${target.entities.join(", ")}
                  placeholder="sensor.example, binary_sensor.other"
                  @change=${(event: Event) =>
                    this.patchTarget({
                      entities: splitList((event.target as HTMLInputElement).value),
                    })}
                />
              </label>

              <label class="field">
                <span>${this.localize("editor.exclude_labels")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.labels}
                .selected=${target.exclude_labels}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patchTarget({ exclude_labels: event.detail.value })}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.exclude_entities")}</span>
                <input
                  type="text"
                  .value=${target.exclude_entities.join(", ")}
                  @change=${(event: Event) =>
                    this.patchTarget({
                      exclude_entities: splitList(
                        (event.target as HTMLInputElement).value,
                      ),
                    })}
                />
              </label>
            </div>
          </details>

          <div style="margin-top:14px">
            <div class="preview-head">
              <h3 style="margin:0">${this.localize("editor.preview")}</h3>
              <span class="badge"
                >${this.localize("editor.preview_count", {
                  count: this.previewCount,
                })}</span
              >
            </div>
            ${this.previewCount
              ? html`<sg-entity-list
                  .entities=${this.preview}
                  .localize=${this.localize}
                ></sg-entity-list>`
              : html`<p class="hint">${this.localize("editor.preview_none")}</p>`}
          </div>
        </div>

        <div class="section">
          <h3>${this.localize("editor.conditions")}</h3>
          <p class="hint" style="margin-bottom:12px">
            ${this.localize("editor.condition_or")}
          </p>
          ${this.draft.conditions.map(
            (condition, index) => html`
              <div class="condition">
                <div class="row" style="margin-bottom:10px">
                  <select
                    style="flex:1"
                    @change=${(event: Event) => {
                      const type = (event.target as HTMLSelectElement)
                        .value as ConditionType;
                      const conditions = [...this.draft.conditions];
                      conditions[index] = emptyCondition(type);
                      this.patch({ conditions });
                    }}
                  >
                    ${CONDITION_TYPES.map(
                      (type) => html`
                        <option value=${type} ?selected=${condition.type === type}>
                          ${this.localize(`cond.${type}`)}
                        </option>
                      `,
                    )}
                  </select>
                  <button
                    class="plain"
                    @click=${() =>
                      this.patch({
                        conditions: this.draft.conditions.filter(
                          (_, position) => position !== index,
                        ),
                      })}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </div>
                ${this.renderConditionBody(condition, index)}
              </div>
            `,
          )}
          <button
            class="secondary"
            @click=${() =>
              this.patch({
                conditions: [
                  ...this.draft.conditions,
                  emptyCondition("unavailable_state"),
                ],
              })}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
            ${this.localize("editor.add_condition")}
          </button>
        </div>

        <div class="section">
          <details>
            <summary>${this.localize("editor.advanced")}</summary>
            <div style="padding-top:12px">
              <label class="field">
                <span>${this.localize("editor.grace_period")}</span>
                <sg-duration
                  .value=${this.draft.grace_period}
                  .localize=${this.localize}
                  @value-changed=${(event: CustomEvent) =>
                    this.patch({ grace_period: event.detail.value })}
                ></sg-duration>
              </label>
              <label class="checkbox">
                <input
                  type="checkbox"
                  .checked=${this.draft.restart_grace === null}
                  @change=${(event: Event) =>
                    this.patch({
                      restart_grace: (event.target as HTMLInputElement).checked
                        ? null
                        : 600,
                    })}
                />
                <span>${this.localize("editor.restart_grace_global")}</span>
              </label>
              ${this.draft.restart_grace !== null
                ? html`
                    <label class="field">
                      <span>${this.localize("editor.restart_grace")}</span>
                      <sg-duration
                        .value=${this.draft.restart_grace}
                        .localize=${this.localize}
                        @value-changed=${(event: CustomEvent) =>
                          this.patch({ restart_grace: event.detail.value })}
                      ></sg-duration>
                    </label>
                  `
                : nothing}
              <label class="field">
                <span>${this.localize("editor.channels")}</span>
              </label>
              <sg-chip-select
                .options=${this.config.channels.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                }))}
                .selected=${this.draft.channels}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${(event: CustomEvent) =>
                  this.patch({ channels: event.detail.value })}
              ></sg-chip-select>

              <label class="field" style="margin-top:14px">
                <span>${this.localize("editor.overlap_mode")}</span>
                <select
                  @change=${(event: Event) =>
                    this.patch({
                      overlap_mode: (event.target as HTMLSelectElement)
                        .value as Watch["overlap_mode"],
                    })}
                >
                  <option value="all" ?selected=${this.draft.overlap_mode === "all"}>
                    ${this.localize("editor.overlap_all")}
                  </option>
                  <option
                    value="highest_severity"
                    ?selected=${this.draft.overlap_mode === "highest_severity"}
                  >
                    ${this.localize("editor.overlap_highest")}
                  </option>
                </select>
              </label>
              ${[
                ["notify_on_clear", "editor.notify_on_clear"],
                ["suppress_by_parent", "editor.suppress_by_parent"],
                ["group_alerts", "editor.group_alerts"],
                ["enabled", "editor.enabled"],
              ].map(
                ([key, label]) => html`
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      .checked=${this.draft[key as keyof Watch] as boolean}
                      @change=${(event: Event) =>
                        this.patch({
                          [key]: (event.target as HTMLInputElement).checked,
                        } as Partial<Watch>)}
                    />
                    <span>${this.localize(label)}</span>
                  </label>
                `,
              )}
            </div>
          </details>
        </div>

        ${this.error ? html`<p class="error">${this.error}</p>` : nothing}

        <div class="sticky">
          <button @click=${this.save}>${this.localize("editor.save")}</button>
          <button class="secondary" @click=${() => this.fire("sg-cancel-edit")}>
            ${this.localize("editor.cancel")}
          </button>
        </div>
      </div>
    `;
  }
}

/** Parse a possibly empty numeric input. */
function numberOrNull(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Split a comma separated list into trimmed, non-empty items. */
function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
