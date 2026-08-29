import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";
import type { PreviewEntity } from "../types";
import type { Localizer } from "../localize";
import "./entity-menu";

/** Scrollable preview of the entities a target currently resolves to. */
@customElement("sg-entity-list")
export class EntityList extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .scroll {
        max-height: 260px;
        overflow-y: auto;
        border: var(--sg-border);
        border-radius: 8px;
      }

      .entry {
        display: flex;
        align-items: baseline;
        gap: 10px;
        padding: 7px 10px;
        border-bottom: var(--sg-border);
        font-size: 0.875rem;
      }

      .entry:last-child {
        border-bottom: none;
      }

      .entry .id {
        color: var(--secondary-text-color);
        font-family: var(--code-font-family, monospace);
        font-size: 0.75rem;
      }

      .entry .value {
        margin-left: auto;
        color: var(--secondary-text-color);
        font-size: 0.8125rem;
        white-space: nowrap;
      }

      .bad {
        color: var(--error-color, #db4437);
      }
    `,
  ];

  @property({ attribute: false }) entities: PreviewEntity[] = [];
  @property({ attribute: false }) localize!: Localizer;
  @property({ type: Number }) limit = 200;
  @state() private expanded = false;

  render() {
    if (!this.entities.length) return nothing;
    const shown = this.expanded
      ? this.entities
      : this.entities.slice(0, this.limit);

    return html`
      <div class="scroll">
        ${shown.map(
          (entity) => html`
            <div class="entry">
              <sg-entity-menu
                .entityId=${entity.entity_id}
                .label=${entity.friendly_name}
                .deviceId=${entity.device_id ?? null}
                .deviceName=${entity.device_name ?? null}
                .integrationDomain=${entity.integration_domain ?? null}
                .integrationTitle=${entity.integration_title ?? null}
                .localize=${this.localize}
              ></sg-entity-menu>
              <span class="id">${entity.entity_id}</span>
              <span
                class=${["unavailable", "unknown"].includes(entity.state ?? "")
                  ? "value bad"
                  : "value"}
                >${entity.state ?? "—"}</span
              >
            </div>
          `,
        )}
      </div>
      ${!this.expanded && this.entities.length > this.limit
        ? html`<button
            class="plain"
            @click=${() => {
              this.expanded = true;
            }}
          >
            + ${this.entities.length - this.limit}
          </button>`
        : nothing}
    `;
  }
}
