import{i as p,n as f,r as h,a as y,l as v,A as c,c as g,b as n,t as w}from"./stateguard-shared.js";var m=Object.defineProperty,x=Object.getOwnPropertyDescriptor,o=(e,i,t,s)=>{for(var a=s>1?void 0:s?x(i,t):i,d=e.length-1,l;d>=0;d--)(l=e[d])&&(a=(s?l(i,t,a):l(a))||a);return s&&a&&m(i,t,a),a};const $=1e4;let r=class extends y{constructor(){super(...arguments),this.cardConfig={type:""}}setConfig(e){this.cardConfig={...e}}getCardSize(){return 1+Math.min(this.visible().length,6)}static getStubConfig(){return{type:"custom:stateguard-card",hide_when_healthy:!1}}connectedCallback(){super.connectedCallback(),this.load(),this.timer=window.setInterval(()=>void this.load(),$)}disconnectedCallback(){super.disconnectedCallback(),this.timer&&window.clearInterval(this.timer)}get localize(){return v(this.hass?.language||"en")}async load(){if(this.hass)try{if(!this.config){const e=await this.hass.callWS({type:"stateguard/config/get"});this.config=e.config}this.status=await this.hass.callWS({type:"stateguard/status"})}catch{}}severity(e){return this.config?.severities.find(i=>i.id===e.severity_id)}visible(){if(!this.status)return[];const e=this.cardConfig.severities??[],i=this.cardConfig.watches??[];let t=this.status.problems.filter(s=>this.cardConfig.show_suppressed?s.status!=="pending":["alerted","escalated"].includes(s.status)&&s.suppression==="none");return e.length&&(t=t.filter(s=>s.severity_id!==null&&e.includes(s.severity_id))),i.length&&(t=t.filter(s=>i.includes(s.watch_id))),t.sort((s,a)=>a.severity_priority-s.severity_priority||s.since-a.since),this.cardConfig.max?t.slice(0,this.cardConfig.max):t}age(e){const i=Math.max(0,Math.floor(Date.now()/1e3-e.since));return i<60?`${i}s`:i<3600?`${Math.floor(i/60)}m`:i<86400?`${Math.floor(i/3600)}h`:`${Math.floor(i/86400)}d`}reason(e){return e.reason_key?this.localize(`reason.${e.reason_key}`,e.reason_params):e.reason}render(){if(!this.status||!this.config)return c;const e=this.visible(),i=this.localize;return!e.length&&this.cardConfig.hide_when_healthy?c:n`
      <ha-card>
        <div class="head">
          <ha-icon
            icon=${e.length?"mdi:shield-alert":"mdi:shield-check"}
            style=${`color:${e.length?g(this.severity(e[0])?.color):"var(--success-color, #43a047)"}`}
          ></ha-icon>
          <span>${this.cardConfig.title??"StateGuard"}</span>
          ${e.length?n`<span class="count">${e.length}</span>`:c}
        </div>

        ${e.length?e.map(t=>{const s=this.severity(t),a=t.suppression!=="none";return n`
                <div class=${a?"row muted":"row"}>
                  <ha-icon
                    icon=${s?.icon||"mdi:alert-circle-outline"}
                    style=${`color:${a?"var(--secondary-text-color)":g(s?.color)}`}
                  ></ha-icon>
                  <div class="body">
                    <div class="name">
                      <sg-entity-menu
                        .entityId=${t.entity_id}
                        .label=${t.friendly_name}
                        .deviceId=${t.device_id}
                        .deviceName=${t.device_name}
                        .integrationDomain=${t.integration_domain}
                        .integrationTitle=${t.integration_title}
                        .localize=${i}
                      ></sg-entity-menu>
                      <span class="id">${t.entity_id}</span>
                    </div>
                    <div class="why">
                      ${t.watch_name} · ${this.reason(t)}
                      ${a?n` · ${i(`sup.${t.suppression}`)}`:c}
                    </div>
                  </div>
                  <span class="age">${this.age(t)}</span>
                </div>
              `}):n`
              <div class="healthy">
                <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                <span>${i("overview.healthy")}</span>
              </div>
            `}
      </ha-card>
    `}};r.styles=p`
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
  `;o([f({attribute:!1})],r.prototype,"hass",2);o([h()],r.prototype,"cardConfig",2);o([h()],r.prototype,"status",2);o([h()],r.prototype,"config",2);r=o([w("stateguard-card")],r);const u=window.customCards??[];u.push({type:"stateguard-card",name:"StateGuard",description:"Current problems reported by StateGuard.",preview:!0});window.customCards=u;
