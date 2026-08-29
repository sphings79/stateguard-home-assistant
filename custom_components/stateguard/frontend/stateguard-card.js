import{s as b,i as f,n as y,r as d,a as v,f as m,l as $,b as w,A as h,c as r,d as u,t as x}from"./stateguard-shared.js";var C=Object.defineProperty,z=Object.getOwnPropertyDescriptor,p=(e,s,a,t)=>{for(var i=t>1?void 0:t?z(s,a):s,n=e.length-1,o;n>=0;n--)(o=e[n])&&(i=(t?o(s,a,i):o(i))||i);return t&&i&&C(s,a,i),i};let c=class extends v{constructor(){super(...arguments),this.config={type:"custom:stateguard-card"},this.translator=m}setConfig(e){this.config={...e}}willUpdate(e){e.has("hass")&&this.hass&&!this.data&&this.load()}get localize(){return this.translator}async load(){this.translator=$(await w(this.hass?.language||"en"));try{this.data=await this.hass.callWS({type:"stateguard/card"})}catch{}}patch(e){const s={...this.config,...e};for(const[a,t]of Object.entries(s))(t===void 0||t===""||t===!1||Array.isArray(t)&&t.length===0)&&a!=="type"&&delete s[a];this.config=s,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}render(){const e=this.localize,s=(this.data?.severities??[]).slice().sort((t,i)=>(i.priority??0)-(t.priority??0)),a=this.data?.watches??[];return r`
      <label class="field">
        <span>${e("card.title")}</span>
        <input
          type="text"
          .value=${this.config.title??""}
          placeholder="StateGuard"
          @input=${t=>this.patch({title:t.target.value})}
        />
        <p class="hint">${e("card.title_hint")}</p>
      </label>

      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${this.config.hide_when_healthy??!1}
          @change=${t=>this.patch({hide_when_healthy:t.target.checked})}
        />
        <span>${e("card.hide_when_healthy")}</span>
      </label>

      <label class="checkbox">
        <input
          type="checkbox"
          .checked=${this.config.show_suppressed??!1}
          @change=${t=>this.patch({show_suppressed:t.target.checked})}
        />
        <span>${e("card.show_suppressed")}</span>
      </label>
      <p class="hint" style="margin:-8px 0 14px 28px">
        ${e("card.show_suppressed_hint")}
      </p>

      <label class="field">
        <span>${e("card.max")}</span>
        <input
          type="number"
          min="1"
          .value=${this.config.max===void 0?"":String(this.config.max)}
          @change=${t=>{const i=t.target.value.trim();this.patch({max:i?Math.max(1,Number(i)):void 0})}}
        />
        <p class="hint">${e("card.max_hint")}</p>
      </label>

      <label class="field"><span>${e("card.severities")}</span></label>
      <sg-chip-select
        .options=${s.map(t=>({id:t.id,name:t.name,icon:t.icon,color:t.color}))}
        .selected=${this.config.severities??[]}
        .searchLabel=${e("common.search")}
        @value-changed=${t=>this.patch({severities:t.detail.value})}
      ></sg-chip-select>

      <label class="field" style="margin-top:16px">
        <span>${e("card.watches")}</span>
      </label>
      ${a.length?r`
            <sg-chip-select
              .options=${a}
              .selected=${this.config.watches??[]}
              .searchLabel=${e("common.search")}
              @value-changed=${t=>this.patch({watches:t.detail.value})}
            ></sg-chip-select>
          `:r`<p class="hint">${e("card.no_watches")}</p>`}

      <p class="hint" style="margin-top:12px">${e("card.filter_hint")}</p>
      ${s.length?h:r`<p class="hint" style="color:${u("amber")}">
            ${e("error.not_loaded")}
          </p>`}
    `}};c.styles=[b,f`
      :host {
        display: block;
        padding: 8px 0;
      }
    `];p([y({attribute:!1})],c.prototype,"hass",2);p([d()],c.prototype,"config",2);p([d()],c.prototype,"data",2);p([d()],c.prototype,"translator",2);c=p([x("stateguard-card-editor")],c);var S=Object.defineProperty,k=Object.getOwnPropertyDescriptor,g=(e,s,a,t)=>{for(var i=t>1?void 0:t?k(s,a):s,n=e.length-1,o;n>=0;n--)(o=e[n])&&(i=(t?o(s,a,i):o(i))||i);return t&&i&&S(s,a,i),i};const O=1e4;let l=class extends v{constructor(){super(...arguments),this.cardConfig={type:""},this.translator=m,this.loadedLanguage=""}setConfig(e){this.cardConfig={...e}}getCardSize(){return 1+Math.min(this.visible().length,6)}static getStubConfig(){return{type:"custom:stateguard-card"}}static getConfigElement(){return document.createElement("stateguard-card-editor")}connectedCallback(){super.connectedCallback(),this.load(),this.timer=window.setInterval(()=>void this.load(),O)}willUpdate(e){e.has("hass")&&this.hass&&!this.data&&this.load()}disconnectedCallback(){super.disconnectedCallback(),this.timer&&window.clearInterval(this.timer)}get localize(){return this.translator}async load(){if(!this.hass)return;const e=this.hass.language||"en";e!==this.loadedLanguage&&(this.loadedLanguage=e,this.translator=$(await w(e)));try{this.data=await this.hass.callWS({type:"stateguard/card"})}catch{}}severity(e){return this.data?.severities.find(s=>s.id===e.severity_id)}visible(){if(!this.data)return[];const e=this.cardConfig.severities??[],s=this.cardConfig.watches??[];let a=this.data.problems.filter(t=>this.cardConfig.show_suppressed?t.status!=="pending":["alerted","escalated"].includes(t.status)&&t.suppression==="none");return e.length&&(a=a.filter(t=>t.severity_id!==null&&e.includes(t.severity_id))),s.length&&(a=a.filter(t=>s.includes(t.watch_id))),a.sort((t,i)=>i.severity_priority-t.severity_priority||t.since-i.since),this.cardConfig.max?a.slice(0,this.cardConfig.max):a}age(e){const s=Math.max(0,Math.floor(Date.now()/1e3-e.since));return s<60?`${s}s`:s<3600?`${Math.floor(s/60)}m`:s<86400?`${Math.floor(s/3600)}h`:`${Math.floor(s/86400)}d`}reason(e){return e.reason_key?this.localize(`reason.${e.reason_key}`,e.reason_params):e.reason}render(){if(!this.data)return h;const e=this.visible(),s=this.localize;return!e.length&&this.cardConfig.hide_when_healthy?h:r`
      <ha-card>
        <div class="head">
          <ha-icon
            icon=${e.length?"mdi:shield-alert":"mdi:shield-check"}
            style=${`color:${e.length?u(this.severity(e[0])?.color):"var(--success-color, #43a047)"}`}
          ></ha-icon>
          <span>${this.cardConfig.title??"StateGuard"}</span>
          ${e.length?r`<span class="count">${e.length}</span>`:h}
        </div>

        ${e.length?e.map(a=>{const t=this.severity(a),i=a.suppression!=="none";return r`
                <div class=${i?"row muted":"row"}>
                  <ha-icon
                    icon=${t?.icon||"mdi:alert-circle-outline"}
                    style=${`color:${i?"var(--secondary-text-color)":u(t?.color)}`}
                  ></ha-icon>
                  <div class="body">
                    <div class="name">
                      <sg-entity-menu
                        .entityId=${a.entity_id}
                        .label=${a.friendly_name}
                        .deviceId=${a.device_id}
                        .deviceName=${a.device_name}
                        .integrationDomain=${a.integration_domain}
                        .integrationTitle=${a.integration_title}
                        .localize=${s}
                      ></sg-entity-menu>
                      <span class="id">${a.entity_id}</span>
                    </div>
                    <div class="why">
                      ${a.watch_name} · ${this.reason(a)}
                      ${i?r` · ${s(`sup.${a.suppression}`)}`:h}
                    </div>
                  </div>
                  <span class="age">${this.age(a)}</span>
                </div>
              `}):r`
              <div class="healthy">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                <span>${s("overview.healthy")}</span>
              </div>
            `}
      </ha-card>
    `}};l.styles=f`
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
  `;g([y({attribute:!1})],l.prototype,"hass",2);g([d()],l.prototype,"cardConfig",2);g([d()],l.prototype,"data",2);g([d()],l.prototype,"translator",2);l=g([x("stateguard-card")],l);const _=window.customCards??[];_.push({type:"stateguard-card",name:"StateGuard",description:"Current problems reported by StateGuard.",preview:!0});window.customCards=_;
