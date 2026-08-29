import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, colorOf } from "../styles";

export interface ChipOption {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

/**
 * Multi-select rendered as toggleable chips, with a search box once the list
 * grows. Used for labels, areas, floors, domains and integrations.
 */
@customElement("sg-chip-select")
export class ChipSelect extends LitElement {
  static styles = sharedStyles;

  @property({ attribute: false }) options: ChipOption[] = [];
  @property({ attribute: false }) selected: string[] = [];
  @property() searchLabel = "Search…";
  @property({ type: Number }) searchThreshold = 12;

  @state() private filter = "";

  private toggle(id: string): void {
    const next = this.selected.includes(id)
      ? this.selected.filter((item) => item !== id)
      : [...this.selected, id];
    this.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: next } }),
    );
  }

  render() {
    const needle = this.filter.trim().toLowerCase();
    const visible = needle
      ? this.options.filter(
          (option) =>
            option.name.toLowerCase().includes(needle) ||
            option.id.toLowerCase().includes(needle) ||
            this.selected.includes(option.id),
        )
      : this.options;

    return html`
      ${this.options.length >= this.searchThreshold
        ? html`
            <input
              type="text"
              .value=${this.filter}
              placeholder=${this.searchLabel}
              style="margin-bottom:8px"
              @input=${(event: Event) => {
                this.filter = (event.target as HTMLInputElement).value;
              }}
            />
          `
        : nothing}
      <div class="chips">
        ${visible.map(
          (option) => html`
            <button
              type="button"
              class="chip"
              data-selected=${this.selected.includes(option.id)}
              @click=${() => this.toggle(option.id)}
            >
              ${option.icon
                ? html`<ha-icon
                    icon=${option.icon}
                    style=${`color:${
                      this.selected.includes(option.id)
                        ? "inherit"
                        : colorOf(option.color)
                    }`}
                  ></ha-icon>`
                : nothing}
              ${option.name}
            </button>
          `,
        )}
      </div>
    `;
  }
}
