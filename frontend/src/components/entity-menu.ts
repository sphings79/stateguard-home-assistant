import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles } from "../styles";
import type { Localizer } from "../localize";

/** Navigate within Home Assistant the way its own frontend does. */
export function navigate(path: string): void {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed"));
}

/**
 * An entity name that opens a small menu: its more-info dialog, its device,
 * or the integration it belongs to. Entries the entity has no target for are
 * left out.
 */
@customElement("sg-entity-menu")
export class EntityMenu extends LitElement {
  static styles = [
    sharedStyles,
    css`
      :host {
        position: relative;
        display: inline-block;
      }

      .trigger {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;
        text-align: left;
        border-bottom: 1px dotted var(--secondary-text-color);
      }

      .trigger:hover {
        color: var(--primary-color);
        border-bottom-color: var(--primary-color);
        filter: none;
      }

      /* Fixed rather than absolute: the surrounding card clips its overflow,
         which would cut the menu off. */
      .menu {
        position: fixed;
        z-index: 100;
        min-width: 220px;
        max-width: min(320px, calc(100vw - 16px));
        background: var(--card-background-color, #fff);
        border: var(--sg-border);
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
        overflow: hidden;
        padding: 4px 0;
      }

      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        background: none;
        border: none;
        border-radius: 0;
        padding: 9px 14px;
        font-size: 0.875rem;
        color: var(--primary-text-color);
        cursor: pointer;
        text-align: left;
      }

      .item:hover {
        background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
        filter: none;
      }

      .item ha-icon {
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
      }

      .item .sub {
        color: var(--secondary-text-color);
        font-size: 0.75rem;
        margin-left: auto;
        max-width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];

  @property() entityId = "";
  @property() label = "";
  @property() deviceId: string | null = null;
  @property() deviceName: string | null = null;
  @property() integrationDomain: string | null = null;
  @property() integrationTitle: string | null = null;
  @property({ attribute: false }) localize!: Localizer;

  @state() private open = false;
  @state() private position = { top: 0, left: 0 };

  private onOutside = (event: Event): void => {
    if (!event.composedPath().includes(this)) this.open = false;
  };

  private onReflow = (): void => {
    // Scrolling or resizing would leave the menu behind, so close it.
    if (this.open) this.open = false;
  };

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("click", this.onOutside, true);
    window.addEventListener("scroll", this.onReflow, true);
    window.addEventListener("resize", this.onReflow);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("click", this.onOutside, true);
    window.removeEventListener("scroll", this.onReflow, true);
    window.removeEventListener("resize", this.onReflow);
  }

  /** Place the menu below the name, pulled back inside the viewport. */
  private async toggle(event: Event): Promise<void> {
    event.stopPropagation();
    if (this.open) {
      this.open = false;
      return;
    }

    const trigger = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.position = { top: trigger.bottom + 4, left: trigger.left };
    this.open = true;

    await this.updateComplete;
    const menu = this.renderRoot.querySelector(".menu") as HTMLElement | null;
    if (!menu) return;

    const box = menu.getBoundingClientRect();
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    if (!width || !height) return; // No usable viewport: leave it where it is.

    const margin = 8;
    let { top, left } = this.position;
    if (left + box.width > width - margin) {
      left = Math.max(margin, width - box.width - margin);
    }
    if (top + box.height > height - margin) {
      // Not enough room underneath: open upwards instead.
      top = Math.max(margin, trigger.top - box.height - 4);
    }
    this.position = { top, left };
  }

  private showMoreInfo(): void {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId: this.entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private go(path: string): void {
    this.open = false;
    navigate(path);
  }

  render() {
    return html`
      <button class="trigger" @click=${this.toggle}>
        ${this.label || this.entityId}
      </button>
      ${this.open
        ? html`
            <div
              class="menu"
              style=${`top:${this.position.top}px;left:${this.position.left}px`}
            >
              <button class="item" @click=${this.showMoreInfo}>
                <ha-icon icon="mdi:information-outline"></ha-icon>
                ${this.localize("link.entity")}
                <span class="sub">${this.entityId}</span>
              </button>
              ${this.deviceId
                ? html`
                    <button
                      class="item"
                      @click=${() =>
                        this.go(`/config/devices/device/${this.deviceId}`)}
                    >
                      <ha-icon icon="mdi:devices"></ha-icon>
                      ${this.localize("link.device")}
                      <span class="sub">${this.deviceName ?? ""}</span>
                    </button>
                  `
                : nothing}
              ${this.integrationDomain
                ? html`
                    <button
                      class="item"
                      @click=${() =>
                        this.go(
                          `/config/integrations/integration/${this.integrationDomain}`,
                        )}
                    >
                      <ha-icon icon="mdi:puzzle-outline"></ha-icon>
                      ${this.localize("link.integration")}
                      <span class="sub">${this.integrationTitle ?? ""}</span>
                    </button>
                  `
                : nothing}
            </div>
          `
        : nothing}
    `;
  }
}
