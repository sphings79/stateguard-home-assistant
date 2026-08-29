import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";
import type { Localizer } from "../localize";
import type { Channel, ChannelField, ChannelKind, Config, Meta } from "../types";

const KINDS: ChannelKind[] = ["ha_service", "smtp", "telegram", "pushover", "ntfy"];
const SECRET_PLACEHOLDER = "__unchanged__";

const KIND_ICONS: Record<ChannelKind, string> = {
  ha_service: "mdi:home-assistant",
  smtp: "mdi:email-outline",
  telegram: "mdi:send",
  pushover: "mdi:cellphone-message",
  ntfy: "mdi:bell-ring-outline",
};

const newChannel = (): Channel => ({
  id: "",
  name: "",
  kind: "ha_service",
  enabled: true,
  config: {},
  title_template: "",
  template: "",
});

/** Manage notification channels and try them out before relying on them. */
@customElement("sg-channels")
export class Channels extends LitElement {
  static styles = [
    sharedStyles,
    css`
      textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 9px 10px;
        border: var(--sg-border);
        border-radius: 8px;
        background: var(--secondary-background-color, transparent);
        color: var(--primary-text-color);
        font-family: var(--code-font-family, monospace);
        font-size: 0.8125rem;
        min-height: 90px;
        resize: vertical;
      }

      .kind-hint {
        color: var(--secondary-text-color);
        font-size: 0.8125rem;
        margin: -8px 0 14px;
      }

      .result {
        margin-top: 10px;
        font-size: 0.875rem;
      }

      .result.ok {
        color: var(--success-color, #43a047);
      }

      .result.bad {
        color: var(--error-color, #db4437);
      }
    `,
  ];

  @property({ attribute: false }) config!: Config;
  @property({ attribute: false }) meta!: Meta;
  @property({ attribute: false }) localize!: Localizer;

  @state() private editing: Channel | null = null;
  @state() private testState: { ok: boolean; text: string } | null = null;
  @state() private testing = false;

  private fire(name: string, detail: unknown = {}): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private patch(changes: Partial<Channel>): void {
    if (this.editing) this.editing = { ...this.editing, ...changes };
    this.testState = null;
  }

  private patchConfig(key: string, value: unknown): void {
    if (!this.editing) return;
    this.patch({ config: { ...this.editing.config, [key]: value } });
  }

  private usedBy(channel: Channel): number {
    return this.config.severities.filter(
      (severity) =>
        severity.channels.includes(channel.id) ||
        severity.escalation_channels.includes(channel.id),
    ).length;
  }

  private renderField(field: ChannelField, channel: Channel) {
    const label = this.localize(`field.${field.key}`);
    const raw = channel.config[field.key];
    const value = raw === undefined || raw === null ? "" : String(raw);

    if (field.type === "select") {
      return html`
        <label class="field">
          <span>${label}</span>
          <select
            @change=${(event: Event) =>
              this.patchConfig(field.key, (event.target as HTMLSelectElement).value)}
          >
            ${(field.options ?? []).map(
              (option) => html`
                <option
                  value=${option}
                  ?selected=${value === option ||
                  (!value && String(field.default ?? "") === option)}
                >
                  ${option}
                </option>
              `,
            )}
          </select>
        </label>
      `;
    }

    if (field.type === "object") {
      return html`
        <label class="field">
          <span>${label}</span>
          <textarea
            .value=${raw ? JSON.stringify(raw, null, 2) : ""}
            placeholder=${'{ "data": { "push": { "sound": "default" } } }'}
            @change=${(event: Event) => {
              const text = (event.target as HTMLTextAreaElement).value.trim();
              if (!text) {
                this.patchConfig(field.key, undefined);
                return;
              }
              try {
                this.patchConfig(field.key, JSON.parse(text));
              } catch {
                this.testState = { ok: false, text: "JSON?" };
              }
            }}
          ></textarea>
        </label>
      `;
    }

    const isSecret = field.type === "secret";
    const stored = isSecret && value === SECRET_PLACEHOLDER;
    return html`
      <label class="field">
        <span>${label}${field.required ? " *" : ""}</span>
        <input
          type=${isSecret ? "password" : field.type === "number" ? "number" : "text"}
          .value=${stored ? "" : value}
          placeholder=${stored
            ? this.localize("ch.secret_kept")
            : (field.example ?? String(field.default ?? ""))}
          @change=${(event: Event) => {
            const next = (event.target as HTMLInputElement).value;
            // An untouched secret field keeps the stored value.
            if (isSecret && !next && stored) return;
            this.patchConfig(field.key, next);
          }}
        />
      </label>
    `;
  }

  private async test(): Promise<void> {
    if (!this.editing) return;
    this.testing = true;
    this.testState = null;
    this.dispatchEvent(
      new CustomEvent("sg-test-channel", {
        detail: {
          channel: this.editing,
          callback: (result: { ok: boolean; error: string | null }) => {
            this.testing = false;
            if (result.ok) {
              this.testState = { ok: true, text: this.localize("ch.test_ok") };
              return;
            }
            const error = result.error ?? "";
            this.testState = {
              ok: false,
              text: error.startsWith("missing:")
                ? this.localize("ch.test_missing", {
                    field: this.localize(`field.${error.slice(8)}`),
                  })
                : this.localize("ch.test_failed", { error }),
            };
          },
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderEditor(channel: Channel) {
    const fields = this.meta.channel_fields[channel.kind] ?? [];
    return html`
      <div class="card">
        <h2>${channel.name || this.localize("ch.add")}</h2>

        <div class="grid">
          <label class="field">
            <span>${this.localize("ch.name")}</span>
            <input
              type="text"
              .value=${channel.name}
              @input=${(event: Event) =>
                this.patch({ name: (event.target as HTMLInputElement).value })}
            />
          </label>
          <label class="field">
            <span>${this.localize("ch.kind")}</span>
            <select
              @change=${(event: Event) =>
                this.patch({
                  kind: (event.target as HTMLSelectElement).value as ChannelKind,
                  config: {},
                })}
            >
              ${KINDS.map(
                (kind) => html`
                  <option value=${kind} ?selected=${channel.kind === kind}>
                    ${this.localize(`kind.${kind}`)}
                  </option>
                `,
              )}
            </select>
          </label>
        </div>
        <p class="kind-hint">${this.localize(`kind.${channel.kind}_hint`)}</p>

        ${fields.map((field) => this.renderField(field, channel))}

        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${channel.enabled}
            @change=${(event: Event) =>
              this.patch({ enabled: (event.target as HTMLInputElement).checked })}
          />
          <span>${this.localize("ch.enabled")}</span>
        </label>

        <details>
          <summary>${this.localize("ch.templates")}</summary>
          <div style="padding-top:10px">
            <label class="field">
              <span>${this.localize("ch.title_template")}</span>
              <input
                type="text"
                .value=${channel.title_template}
                placeholder="{{ severity }}: {{ watch }}"
                @change=${(event: Event) =>
                  this.patch({
                    title_template: (event.target as HTMLInputElement).value,
                  })}
              />
            </label>
            <label class="field">
              <span>${this.localize("ch.template")}</span>
              <textarea
                .value=${channel.template}
                @change=${(event: Event) =>
                  this.patch({
                    template: (event.target as HTMLTextAreaElement).value,
                  })}
              ></textarea>
            </label>
            <p class="hint">${this.localize("ch.template_hint")}</p>
          </div>
        </details>

        <div class="row" style="margin-top:12px">
          <button
            @click=${() => {
              this.fire("sg-save-channel", { channel: this.editing });
              this.editing = null;
            }}
          >
            ${this.localize("editor.save")}
          </button>
          <button class="secondary" ?disabled=${this.testing} @click=${this.test}>
            <ha-icon icon="mdi:send-check-outline"></ha-icon>
            ${this.localize("ch.test")}
          </button>
          <button
            class="secondary"
            @click=${() => {
              this.editing = null;
              this.testState = null;
            }}
          >
            ${this.localize("editor.cancel")}
          </button>
        </div>
        ${this.testState
          ? html`<p class=${this.testState.ok ? "result ok" : "result bad"}>
              ${this.testState.text}
            </p>`
          : nothing}
      </div>
    `;
  }

  render() {
    if (this.editing) return this.renderEditor(this.editing);

    return html`
      <div class="card">
        <button
          @click=${() => {
            this.editing = newChannel();
          }}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${this.localize("ch.add")}
        </button>
      </div>

      <div class="card flush">
        ${this.config.channels.length
          ? this.config.channels.map((channel) => {
              const used = this.usedBy(channel);
              return html`
                <div class="list-item">
                  <ha-icon
                    icon=${KIND_ICONS[channel.kind]}
                    style=${`--mdc-icon-size:24px;color:${
                      channel.enabled
                        ? "var(--primary-color)"
                        : "var(--secondary-text-color)"
                    }`}
                  ></ha-icon>
                  <div style="flex:1;min-width:0">
                    <div class="title">
                      ${channel.name}
                      ${!channel.enabled
                        ? html`<span class="badge"
                            >${this.localize("watches.paused")}</span
                          >`
                        : nothing}
                    </div>
                    <div class="subtitle">
                      ${this.localize(`kind.${channel.kind}`)} ·
                      ${used
                        ? this.localize("ch.used_by", { count: used })
                        : this.localize("ch.unused")}
                    </div>
                  </div>
                  <button
                    class="plain"
                    @click=${() => {
                      this.editing = structuredClone(channel);
                      this.testState = null;
                    }}
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="plain"
                    @click=${() => this.fire("sg-delete-channel", { channel })}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
              `;
            })
          : html`<div class="empty">
              <ha-icon icon="mdi:bell-outline"></ha-icon>
              <div>${this.localize("ch.empty")}</div>
            </div>`}
      </div>
    `;
  }
}
