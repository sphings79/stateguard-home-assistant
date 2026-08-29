import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { sharedStyles } from "../styles";
import type { Localizer } from "../localize";

const UNITS: [string, number][] = [
  ["unit.seconds", 1],
  ["unit.minutes", 60],
  ["unit.hours", 3600],
  ["unit.days", 86400],
];

/**
 * A duration entered as a number plus a unit. The value is always seconds;
 * the unit is picked so the stored value reads naturally (7200 shows as
 * "2 hours", not "7200 seconds").
 */
@customElement("sg-duration")
export class DurationInput extends LitElement {
  static styles = [
    sharedStyles,
    css`
      .duration {
        display: flex;
        gap: 8px;
      }

      .duration input {
        flex: 1;
        min-width: 0;
      }

      .duration select {
        width: auto;
        flex-shrink: 0;
      }
    `,
  ];

  @property({ type: Number }) value = 0;
  @property({ attribute: false }) localize!: Localizer;
  /** Smallest unit offered; hides seconds where they make no sense. */
  @property({ type: Number }) minUnit = 1;

  private get factor(): number {
    let factor = this.minUnit;
    for (const [, size] of UNITS) {
      if (size < this.minUnit) continue;
      if (this.value !== 0 && this.value % size === 0) factor = size;
    }
    return factor;
  }

  private emit(seconds: number): void {
    this.dispatchEvent(
      new CustomEvent("value-changed", { detail: { value: Math.max(0, seconds) } }),
    );
  }

  render() {
    const factor = this.factor;
    return html`
      <div class="duration">
        <input
          type="number"
          min="0"
          .value=${String(this.value / factor)}
          @change=${(event: Event) =>
            this.emit(
              Math.round(Number((event.target as HTMLInputElement).value) * factor),
            )}
        />
        <select
          @change=${(event: Event) => {
            const next = Number((event.target as HTMLSelectElement).value);
            this.emit(Math.round((this.value / factor) * next));
          }}
        >
          ${UNITS.filter(([, size]) => size >= this.minUnit).map(
            ([key, size]) => html`
              <option value=${size} ?selected=${size === factor}>
                ${this.localize(key)}
              </option>
            `,
          )}
        </select>
      </div>
    `;
  }
}
