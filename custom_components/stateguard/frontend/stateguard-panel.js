import{s as b,i as z,n as c,r as d,a as f,c as D,A as r,b as l,t as y,C as J,l as H}from"./stateguard-shared.js";class K{constructor(e){this.hass=e}update(e){this.hass=e}getConfig(){return this.hass.callWS({type:"stateguard/config/get"})}getCardData(){return this.hass.callWS({type:"stateguard/card"})}getStatus(){return this.hass.callWS({type:"stateguard/status"})}saveWatch(e){return this.hass.callWS({type:"stateguard/watch/save",watch:e})}deleteWatch(e){return this.hass.callWS({type:"stateguard/watch/delete",watch_id:e})}saveSeverity(e){return this.hass.callWS({type:"stateguard/severity/save",severity:e})}deleteSeverity(e){return this.hass.callWS({type:"stateguard/severity/delete",severity_id:e})}saveSettings(e){return this.hass.callWS({type:"stateguard/settings/save",settings:e})}watchEntities(e){return this.hass.callWS({type:"stateguard/watch/entities",watch_id:e})}preview(e){return this.hass.callWS({type:"stateguard/preview",target:e})}saveChannel(e){return this.hass.callWS({type:"stateguard/channel/save",channel:e})}deleteChannel(e){return this.hass.callWS({type:"stateguard/channel/delete",channel_id:e})}testChannel(e){return this.hass.callWS({type:"stateguard/channel/test",channel:e})}history(e){return this.hass.callWS({type:"stateguard/history",...e})}runCheck(){return this.hass.callService("stateguard","run_check",{})}setMonitoring(e){return this.hass.callWS({type:"stateguard/monitoring/set",enabled:e})}snooze(e,i,s){const a={duration:s};return e&&(a.watch_id=e),i&&(a.entity_id=i),this.hass.callService("stateguard","snooze",a)}acknowledge(e,i){return this.hass.callService("stateguard","acknowledge",{watch_id:e,entity_id:i})}}var Y=Object.defineProperty,Z=Object.getOwnPropertyDescriptor,q=(t,e,i,s)=>{for(var a=s>1?void 0:s?Z(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&Y(e,i,a),a};let S=class extends f{constructor(){super(...arguments),this.readOnly=!1,this.now=Date.now()/1e3}connectedCallback(){super.connectedCallback(),this.ticker=window.setInterval(()=>{this.now=Date.now()/1e3},1e3)}disconnectedCallback(){super.disconnectedCallback(),this.ticker&&window.clearInterval(this.ticker)}countdown(t){const e=Math.max(0,Math.ceil(t)),i=e%60,s=Math.floor(e/60)%60,a=Math.floor(e/3600),n=o=>String(o).padStart(2,"0");return a?`${a}:${n(s)}:${n(i)}`:`${s}:${n(i)}`}fire(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}since(t){const e=Math.max(0,Math.floor(Date.now()/1e3-t.since));return e<60?`${e}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h`:`${Math.floor(e/86400)}d`}reasonText(t){return t.reason_key?this.localize(`reason.${t.reason_key}`,t.reason_params):t.reason}severityColor(t){const e=this.config.severities.find(i=>i.id===t.severity_id);return D(e?.color)}severityIcon(t){return this.config.severities.find(i=>i.id===t.severity_id)?.icon||"mdi:alert-circle-outline"}renderProblem(t,e){const i=t.suppression!=="none";return l`
      <div class="problem">
        <ha-icon
          icon=${this.severityIcon(t)}
          style=${`color:${e?"var(--secondary-text-color)":this.severityColor(t)}`}
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
              .localize=${this.localize}
            ></sg-entity-menu>
            <span class="entity-id">${t.entity_id}</span>
          </div>
          <div class="why">
            ${t.watch_name} · ${this.reasonText(t)} ·
            ${this.since(t)}
            ${i?l` · <span class="badge"
                    >${this.localize(`sup.${t.suppression}`)}</span
                  >`:r}
          </div>
        </div>
        ${!e&&!this.readOnly?l`
              <div class="actions">
                <button
                  class="plain"
                  title="8h"
                  @click=${()=>this.fire("sg-snooze",{watchId:t.watch_id,entityId:t.entity_id,duration:"8h"})}
                >
                  <ha-icon icon="mdi:sleep"></ha-icon>
                </button>
                <button
                  class="plain"
                  @click=${()=>this.fire("sg-acknowledge",{watchId:t.watch_id,entityId:t.entity_id})}
                >
                  <ha-icon icon="mdi:check-circle-outline"></ha-icon>
                </button>
              </div>
            `:r}
      </div>
    `}render(){const t=this.status.problems.filter(h=>["alerted","escalated"].includes(h.status)&&h.suppression==="none"),e=this.status.problems.filter(h=>h.suppression!=="none"),i=this.status.problems.filter(h=>h.status==="pending"&&h.suppression==="none"),s=!this.status.monitoring_enabled,a=this.status.watched_entity_count,n=new Map;for(const h of t){const P=h.severity_id??"";n.set(P,(n.get(P)??0)+1)}let o="mdi:shield-check",u="var(--success-color, #4caf50)",w=this.localize("overview.healthy"),B=this.localize("overview.healthy_sub",{watched:a});if(s)o="mdi:shield-off-outline",u="var(--secondary-text-color)",w=this.localize("overview.paused"),B=this.localize("overview.paused_sub");else if(t.length){const h=[...t].sort((P,V)=>V.severity_priority-P.severity_priority)[0];o=this.severityIcon(h),u=this.severityColor(h),w=this.localize(t.length===1?"overview.problems":"overview.problems_plural",{count:t.length}),B=this.localize("overview.watching",{watched:a,watches:this.config.watches.length})}return l`
      <div class="card">
        <div class="hero">
          <ha-icon icon=${o} style=${`color:${u}`}></ha-icon>
          <div>
            <div class="headline">${w}</div>
            <div class="sub">${B}</div>
            ${n.size?l`
                  <div class="counts">
                    ${this.config.severities.filter(h=>n.has(h.id)).sort((h,P)=>P.priority-h.priority).map(h=>l`
                          <span class="count">
                            <ha-icon
                              icon=${h.icon}
                              style=${`color:${D(h.color)};--mdc-icon-size:16px`}
                            ></ha-icon>
                            <b>${n.get(h.id)}</b> ${h.name}
                          </span>
                        `)}
                  </div>
                `:r}
          </div>
        </div>
        <div
          class="row wrap"
          style="padding:0 var(--sg-gap) var(--sg-gap)"
          ?hidden=${this.readOnly}
        >
          <button class="secondary" @click=${()=>this.fire("sg-run-check")}>
            <ha-icon icon="mdi:refresh"></ha-icon>
            ${this.localize("overview.run_check")}
          </button>
          <button
            class="secondary"
            @click=${()=>this.fire("sg-toggle-monitoring",{enabled:s})}
          >
            <ha-icon icon=${s?"mdi:play":"mdi:pause"}></ha-icon>
            ${this.localize(s?"overview.resume":"overview.pause")}
          </button>
        </div>
      </div>

      ${this.status.restart_grace_until&&this.status.restart_grace_until>this.now?l`
            <div class="card flush">
              <div class="notice">
                <ha-icon icon="mdi:timer-sand"></ha-icon>
                <div>
                  <div class="title">${this.localize("overview.grace")}</div>
                  <div class="sub">
                    ${this.localize("overview.grace_sub")}
                    <span class="countdown"
                      >${this.countdown(this.status.restart_grace_until-this.now)}</span
                    >
                  </div>
                </div>
              </div>
            </div>
          `:r}
      ${this.status.internet_down?l`
            <div class="card flush">
              <div class="notice">
                <ha-icon icon="mdi:wifi-off"></ha-icon>
                <div>
                  <div class="title">
                    ${this.localize("overview.internet_down")}
                  </div>
                  <div class="sub">
                    ${this.localize("overview.internet_sub",{entity:this.config.settings.internet_entity??""})}
                  </div>
                </div>
              </div>
            </div>
          `:r}

      ${this.readOnly?l`<p class="hint" style="margin:0 0 var(--sg-gap)">
            ${this.localize("overview.read_only")}
          </p>`:r}

      ${!this.readOnly&&!this.config.watches.length?l`
            <div class="card">
              <div class="empty">
                <ha-icon icon="mdi:shield-plus-outline"></ha-icon>
                <h3>${this.localize("overview.no_watches")}</h3>
                <p class="hint">${this.localize("overview.no_watches_sub")}</p>
                <br />
                <button @click=${()=>this.fire("sg-navigate",{view:"watches"})}>
                  ${this.localize("watches.from_template")}
                </button>
              </div>
            </div>
          `:r}

      ${t.length?l`
            <div class="card flush">
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${this.localize("overview.current")}
              </h2>
              ${t.map(h=>this.renderProblem(h,!1))}
            </div>
          `:r}
      ${i.length?l`
            <div class="card flush muted">
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${this.localize("overview.pending")}
              </h2>
              ${i.map(h=>this.renderProblem(h,!0))}
            </div>
          `:r}
      ${e.length?l`
            <div class="card flush muted">
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${this.localize("overview.suppressed")}
              </h2>
              ${e.map(h=>this.renderProblem(h,!0))}
            </div>
          `:r}
    `}};S.styles=[b,z`
      .hero {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 28px var(--sg-gap);
      }

      .hero ha-icon {
        --mdc-icon-size: 56px;
        flex-shrink: 0;
      }

      .hero .headline {
        font-size: 1.75rem;
        font-weight: 500;
        line-height: 1.2;
      }

      .hero .sub {
        color: var(--secondary-text-color);
        margin-top: 6px;
        font-size: 0.9375rem;
      }

      .counts {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }

      .count {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 999px;
        border: var(--sg-border);
        font-size: 0.875rem;
      }

      .count b {
        font-weight: 600;
      }

      .problem {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px var(--sg-gap);
        border-bottom: var(--sg-border);
      }

      .problem:last-child {
        border-bottom: none;
      }

      .problem ha-icon {
        --mdc-icon-size: 22px;
        flex-shrink: 0;
      }

      .problem .body {
        min-width: 0;
        flex: 1;
      }

      .problem .name {
        font-size: 0.9375rem;
        font-weight: 500;
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }

      .problem .entity-id {
        font-family: var(--code-font-family, monospace);
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .notice {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px var(--sg-gap);
      }

      .notice ha-icon {
        --mdc-icon-size: 28px;
        color: var(--warning-color, #ffa600);
        flex-shrink: 0;
      }

      .notice .title {
        font-weight: 500;
        font-size: 0.9375rem;
      }

      .notice .sub {
        color: var(--secondary-text-color);
        font-size: 0.8125rem;
        margin-top: 2px;
      }

      .countdown {
        font-variant-numeric: tabular-nums;
        font-weight: 600;
      }

      .problem .why {
        font-size: 0.8125rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .problem .actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }

      .muted .problem .name {
        color: var(--secondary-text-color);
      }
    `];q([c({attribute:!1})],S.prototype,"config",2);q([c({attribute:!1})],S.prototype,"status",2);q([c({attribute:!1})],S.prototype,"localize",2);q([c({type:Boolean})],S.prototype,"readOnly",2);q([d()],S.prototype,"now",2);S=q([y("sg-overview")],S);var X=Object.defineProperty,ee=Object.getOwnPropertyDescriptor,k=(t,e,i,s)=>{for(var a=s>1?void 0:s?ee(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&X(e,i,a),a};let $=class extends f{constructor(){super(...arguments),this.showTemplates=!1,this.expanded=null,this.entities=null,this.loading=!1}fire(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}toggleEntities(t){if(this.expanded===t.id){this.expanded=null,this.entities=null;return}this.expanded=t.id,this.entities=null,this.loading=!0,this.dispatchEvent(new CustomEvent("sg-watch-entities",{detail:{watchId:t.id,callback:e=>{this.loading=!1,this.expanded===t.id&&(this.entities=e?.entities??[])}},bubbles:!0,composed:!0}))}reasonText(t){const e=t.problem;return e?e.reason_key?this.localize(`reason.${e.reason_key}`,e.reason_params):e.reason:""}renderEntities(){const t=this.localize;return this.loading?l`<div class="note">${t("watches.loading")}</div>`:this.entities?.length?this.entities.map(e=>{const i=e.problem,s=i!==null&&i.status!=="ok";return l`
        <div class=${s?"entity bad":"entity"}>
          <sg-entity-menu
            .entityId=${e.entity_id}
            .label=${e.friendly_name}
            .deviceId=${e.device_id}
            .deviceName=${e.device_name}
            .integrationDomain=${e.integration_domain}
            .integrationTitle=${e.integration_title}
            .localize=${t}
          ></sg-entity-menu>
          <span class="id">${e.entity_id}</span>
          <span class="value">${e.state??"—"}</span>
          ${s?l`<span class="why">
                ${this.reasonText(e)}
                ${i.suppression!=="none"?l` · ${t(`sup.${i.suppression}`)}`:r}
              </span>`:r}
        </div>
      `}):l`<div class="note">${t("watches.entities_none")}</div>`}problemsFor(t){return this.status.problems.filter(e=>e.watch_id===t.id&&["alerted","escalated"].includes(e.status)&&e.suppression==="none").length}render(){return l`
      <div class="card">
        <div class="row wrap">
          <button @click=${()=>this.fire("sg-edit-watch",{watch:null})}>
            <ha-icon icon="mdi:plus"></ha-icon>
            ${this.localize("watches.add")}
          </button>
          <button
            class="secondary"
            @click=${()=>{this.showTemplates=!this.showTemplates}}
          >
            <ha-icon icon="mdi:file-document-multiple-outline"></ha-icon>
            ${this.localize("watches.from_template")}
          </button>
        </div>
      </div>

      ${this.showTemplates?l`
            <div class="card flush">
              ${this.meta.templates.map(t=>l`
                  <div
                    class="template"
                    @click=${()=>{this.showTemplates=!1,this.fire("sg-edit-watch",{template:t})}}
                  >
                    <ha-icon icon=${t.icon}></ha-icon>
                    <div>
                      <div class="title">
                        ${this.localize(`template.${t.template_id}.name`)}
                      </div>
                      <div class="subtitle">
                        ${this.localize(`template.${t.template_id}.description`)}
                      </div>
                    </div>
                  </div>
                `)}
            </div>
          `:r}

      <div class="card flush">
        ${this.config.watches.length?this.config.watches.map(t=>{const e=this.config.severities.find(n=>n.id===t.severity_id),i=this.problemsFor(t),s=this.status.resolved[t.id]??0,a=this.expanded===t.id;return l`
                <div class="list-item">
                  <ha-icon
                    class="watch-icon"
                    icon=${e?.icon||"mdi:shield-outline"}
                    style=${`color:${i?D(e?.color):"var(--secondary-text-color)"}`}
                  ></ha-icon>
                  <div
                    class="opener"
                    role="button"
                    tabindex="0"
                    title=${this.localize(a?"watches.hide_entities":"watches.show_entities")}
                    @click=${()=>this.toggleEntities(t)}
                    @keydown=${n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),this.toggleEntities(t))}}
                  >
                    <div style="flex:1;min-width:0">
                    <div class="title">
                      ${t.name}
                      ${t.enabled?r:l`<span class="badge"
                            >${this.localize("watches.paused")}</span
                          >`}
                      ${i?l`<span
                            class="badge"
                            style=${`background:${D(e?.color)};color:#fff`}
                            >${i}</span
                          >`:r}
                    </div>
                    <div class="subtitle">
                      ${e?.name??"—"} ·
                      ${this.localize(s===1?"watches.covers_one":"watches.covers",{count:s})}
                    </div>
                    </div>
                    <ha-icon
                      class="chevron"
                      icon=${a?"mdi:chevron-up":"mdi:chevron-down"}
                    ></ha-icon>
                  </div>
                  <button
                    class="plain"
                    @click=${()=>this.fire("sg-toggle-watch",{watch:t,enabled:!t.enabled})}
                  >
                    <ha-icon
                      icon=${t.enabled?"mdi:pause":"mdi:play"}
                    ></ha-icon>
                  </button>
                  <button
                    class="plain"
                    @click=${()=>this.fire("sg-edit-watch",{watch:t})}
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="plain"
                    @click=${()=>this.fire("sg-delete-watch",{watch:t})}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
                ${a?l`<div class="entities">${this.renderEntities()}</div>`:r}
              `}):l`<div class="empty">
              <ha-icon icon="mdi:shield-outline"></ha-icon>
              <div>${this.localize("watches.empty")}</div>
            </div>`}
      </div>
    `}};$.styles=[b,z`
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
    `];k([c({attribute:!1})],$.prototype,"config",2);k([c({attribute:!1})],$.prototype,"meta",2);k([c({attribute:!1})],$.prototype,"status",2);k([c({attribute:!1})],$.prototype,"localize",2);k([d()],$.prototype,"showTemplates",2);k([d()],$.prototype,"expanded",2);k([d()],$.prototype,"entities",2);k([d()],$.prototype,"loading",2);$=k([y("sg-watches")],$);var te=Object.defineProperty,ie=Object.getOwnPropertyDescriptor,N=(t,e,i,s)=>{for(var a=s>1?void 0:s?ie(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&te(e,i,a),a};let O=class extends f{constructor(){super(...arguments),this.entities=[],this.limit=200,this.expanded=!1}render(){if(!this.entities.length)return r;const t=this.expanded?this.entities:this.entities.slice(0,this.limit);return l`
      <div class="scroll">
        ${t.map(e=>l`
            <div class="entry">
              <sg-entity-menu
                .entityId=${e.entity_id}
                .label=${e.friendly_name}
                .deviceId=${e.device_id??null}
                .deviceName=${e.device_name??null}
                .integrationDomain=${e.integration_domain??null}
                .integrationTitle=${e.integration_title??null}
                .localize=${this.localize}
              ></sg-entity-menu>
              <span class="id">${e.entity_id}</span>
              <span
                class=${["unavailable","unknown"].includes(e.state??"")?"value bad":"value"}
                >${e.state??"—"}</span
              >
            </div>
          `)}
      </div>
      ${!this.expanded&&this.entities.length>this.limit?l`<button
            class="plain"
            @click=${()=>{this.expanded=!0}}
          >
            + ${this.entities.length-this.limit}
          </button>`:r}
    `}};O.styles=[b,z`
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
    `];N([c({attribute:!1})],O.prototype,"entities",2);N([c({attribute:!1})],O.prototype,"localize",2);N([c({type:Number})],O.prototype,"limit",2);N([d()],O.prototype,"expanded",2);O=N([y("sg-entity-list")],O);var se=Object.defineProperty,ae=Object.getOwnPropertyDescriptor,L=(t,e,i,s)=>{for(var a=s>1?void 0:s?ae(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&se(e,i,a),a};const F=[["unit.seconds",1],["unit.minutes",60],["unit.hours",3600],["unit.days",86400]];let I=class extends f{constructor(){super(...arguments),this.value=0,this.minUnit=1}get factor(){let t=this.minUnit;for(const[,e]of F)e<this.minUnit||this.value!==0&&this.value%e===0&&(t=e);return t}emit(t){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:Math.max(0,t)}}))}render(){const t=this.factor;return l`
      <div class="duration">
        <input
          type="number"
          min="0"
          .value=${String(this.value/t)}
          @change=${e=>this.emit(Math.round(Number(e.target.value)*t))}
        />
        <select
          @change=${e=>{const i=Number(e.target.value);this.emit(Math.round(this.value/t*i))}}
        >
          ${F.filter(([,e])=>e>=this.minUnit).map(([e,i])=>l`
              <option value=${i} ?selected=${i===t}>
                ${this.localize(e)}
              </option>
            `)}
        </select>
      </div>
    `}};I.styles=[b,z`
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
    `];L([c({type:Number})],I.prototype,"value",2);L([c({attribute:!1})],I.prototype,"localize",2);L([c({type:Number})],I.prototype,"minUnit",2);I=L([y("sg-duration")],I);var le=Object.defineProperty,ne=Object.getOwnPropertyDescriptor,_=(t,e,i,s)=>{for(var a=s>1?void 0:s?ne(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&le(e,i,a),a};const oe=["unavailable_state","stale","numeric_threshold","state_match","state_duration","entity_missing"],re=["unavailable","unknown","","none"],R=()=>({labels:[],label_mode:"any",areas:[],floors:[],domains:[],integrations:[],entities:[],include_device_entities:!0,include_diagnostic:!1,exclude_labels:[],exclude_entities:[]}),M=t=>({type:t,states:t==="unavailable_state"?["unavailable","unknown"]:[],negate:!1,time_basis:"last_reported",duration:t==="stale"?86400:600,target_state:null,source:"state",operator:"le",value:t==="numeric_threshold"?25:null,value2:null,recovery_value:null}),G=t=>({id:"",name:"",enabled:!0,severity_id:t,order:0,target:R(),conditions:[M("unavailable_state")],grace_period:300,restart_grace:null,overlap_mode:"all",notify_on_clear:!0,suppress_by_parent:!0,group_alerts:!0,channels:[]});let v=class extends f{constructor(){super(...arguments),this.watch=null,this.template=null,this.preview=[],this.previewCount=0,this.error=""}connectedCallback(){super.connectedCallback();const t=[...this.config.severities].sort((i,s)=>i.priority-s.priority),e=t[Math.floor(t.length/2)]?.id??t[0]?.id??"";if(this.watch)this.draft=structuredClone(this.watch);else if(this.template){const i=G(e);this.draft={...i,...this.template.watch,name:this.localize(`template.${this.template.template_id}.name`),target:R(),conditions:(this.template.watch.conditions??i.conditions).map(s=>({...M("unavailable_state"),...s}))}}else this.draft=G(e);this.requestPreview()}disconnectedCallback(){super.disconnectedCallback(),this.previewTimer&&window.clearTimeout(this.previewTimer)}fire(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}requestPreview(){this.previewTimer&&window.clearTimeout(this.previewTimer),this.previewTimer=window.setTimeout(()=>{this.dispatchEvent(new CustomEvent("sg-preview",{detail:{target:this.draft.target,callback:t=>{this.previewCount=t.count,this.preview=t.entities}},bubbles:!0,composed:!0}))},250)}patch(t){this.draft={...this.draft,...t}}patchTarget(t){this.draft={...this.draft,target:{...this.draft.target,...t}},this.requestPreview()}patchCondition(t,e){const i=this.draft.conditions.map((s,a)=>a===t?{...s,...e}:s);this.patch({conditions:i})}save(){if(!this.draft.name.trim()){this.error=this.localize("editor.needs_name");return}if(!this.draft.conditions.length){this.error=this.localize("editor.no_conditions");return}this.error="",this.fire("sg-save-watch",{watch:this.draft})}renderConditionBody(t,e){switch(t.type){case"unavailable_state":return l`
          <label class="field"><span>${this.localize("cond.states")}</span></label>
          <div class="chips">
            ${re.map(i=>l`
                <button
                  type="button"
                  class="chip"
                  data-selected=${t.states.includes(i)}
                  @click=${()=>this.patchCondition(e,{states:t.states.includes(i)?t.states.filter(s=>s!==i):[...t.states,i]})}
                >
                  ${i===""?this.localize("cond.state_empty"):i}
                </button>
              `)}
          </div>
        `;case"stale":return l`
          <label class="field">
            <span>${this.localize("cond.time_basis")}</span>
            <select
              @change=${i=>this.patchCondition(e,{time_basis:i.target.value})}
            >
              ${["last_reported","last_updated","last_changed"].map(i=>l`
                  <option value=${i} ?selected=${t.time_basis===i}>
                    ${this.localize(`cond.basis_${i}`)}
                  </option>
                `)}
            </select>
          </label>
          <label class="field">
            <span>${this.localize("cond.duration")}</span>
            <sg-duration
              .value=${t.duration}
              .localize=${this.localize}
              @value-changed=${i=>this.patchCondition(e,{duration:i.detail.value})}
            ></sg-duration>
          </label>
        `;case"numeric_threshold":return l`
          <label class="field">
            <span>${this.localize("cond.source")}</span>
            <input
              type="text"
              .value=${t.source}
              placeholder="state"
              @change=${i=>this.patchCondition(e,{source:i.target.value||"state"})}
            />
          </label>
          <div class="grid">
            <label class="field">
              <span>${this.localize("cond.operator")}</span>
              <select
                @change=${i=>this.patchCondition(e,{operator:i.target.value})}
              >
                ${["lt","le","gt","ge","outside","inside"].map(i=>l`
                    <option value=${i} ?selected=${t.operator===i}>
                      ${this.localize(`cond.op_${i}`)}
                    </option>
                  `)}
              </select>
            </label>
            <label class="field">
              <span>${this.localize("cond.value")}</span>
              <input
                type="number"
                step="any"
                .value=${t.value===null?"":String(t.value)}
                @change=${i=>this.patchCondition(e,{value:U(i.target.value)})}
              />
            </label>
            ${["outside","inside"].includes(t.operator)?l`
                  <label class="field">
                    <span>${this.localize("cond.value2")}</span>
                    <input
                      type="number"
                      step="any"
                      .value=${t.value2===null?"":String(t.value2)}
                      @change=${i=>this.patchCondition(e,{value2:U(i.target.value)})}
                    />
                  </label>
                `:r}
            <label class="field">
              <span>${this.localize("cond.recovery_value")}</span>
              <input
                type="number"
                step="any"
                .value=${t.recovery_value===null?"":String(t.recovery_value)}
                @change=${i=>this.patchCondition(e,{recovery_value:U(i.target.value)})}
              />
            </label>
          </div>
          <p class="hint">${this.localize("cond.recovery_hint")}</p>
        `;case"state_match":return l`
          <label class="field">
            <span>${this.localize("cond.states")}</span>
            <input
              type="text"
              .value=${t.states.join(", ")}
              placeholder="unlocked, open"
              @change=${i=>this.patchCondition(e,{states:i.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}
            />
          </label>
          <label class="checkbox">
            <input
              type="checkbox"
              .checked=${t.negate}
              @change=${i=>this.patchCondition(e,{negate:i.target.checked})}
            />
            <span>${this.localize("cond.negate")}</span>
          </label>
        `;case"state_duration":return l`
          <label class="field">
            <span>${this.localize("cond.target_state")}</span>
            <input
              type="text"
              .value=${t.target_state??""}
              placeholder="unlocked"
              @change=${i=>this.patchCondition(e,{target_state:i.target.value||null})}
            />
          </label>
          <label class="field">
            <span>${this.localize("cond.duration")}</span>
            <sg-duration
              .value=${t.duration}
              .localize=${this.localize}
              @value-changed=${i=>this.patchCondition(e,{duration:i.detail.value})}
            ></sg-duration>
          </label>
        `;default:return r}}render(){const t=this.draft.target;return l`
      <div class="card">
        <h2>${this.draft.name||this.localize("editor.new")}</h2>

        <div class="grid">
          <label class="field">
            <span>${this.localize("editor.name")}</span>
            <input
              type="text"
              .value=${this.draft.name}
              @input=${e=>this.patch({name:e.target.value})}
            />
          </label>
          <label class="field">
            <span>${this.localize("editor.severity")}</span>
            <select
              @change=${e=>this.patch({severity_id:e.target.value})}
            >
              ${this.config.severities.slice().sort((e,i)=>i.priority-e.priority).map(e=>l`
                    <option
                      value=${e.id}
                      ?selected=${this.draft.severity_id===e.id}
                    >
                      ${e.name}
                    </option>
                  `)}
            </select>
          </label>
        </div>

        <div class="section">
          <h3>${this.localize("editor.target")}</h3>
          <label class="field"><span>${this.localize("editor.labels")}</span></label>
          <sg-chip-select
            .options=${this.meta.labels}
            .selected=${t.labels}
            .searchLabel=${this.localize("common.search")}
            @value-changed=${e=>this.patchTarget({labels:e.detail.value})}
          ></sg-chip-select>

          ${t.labels.length>1?l`
                <label class="field" style="margin-top:12px">
                  <span>${this.localize("editor.label_mode")}</span>
                  <select
                    @change=${e=>this.patchTarget({label_mode:e.target.value})}
                  >
                    <option value="any" ?selected=${t.label_mode==="any"}>
                      ${this.localize("editor.label_mode_any")}
                    </option>
                    <option value="all" ?selected=${t.label_mode==="all"}>
                      ${this.localize("editor.label_mode_all")}
                    </option>
                  </select>
                </label>
              `:r}

          <label class="checkbox" style="margin-top:12px">
            <input
              type="checkbox"
              .checked=${t.include_device_entities}
              @change=${e=>this.patchTarget({include_device_entities:e.target.checked})}
            />
            <span>${this.localize("editor.include_device_entities")}</span>
          </label>
          <label class="checkbox">
            <input
              type="checkbox"
              .checked=${t.include_diagnostic}
              @change=${e=>this.patchTarget({include_diagnostic:e.target.checked})}
            />
            <span>${this.localize("editor.include_diagnostic")}</span>
          </label>

          <details>
            <summary>${this.localize("editor.advanced")}</summary>
            <div style="padding-top:10px">
              <label class="field"><span>${this.localize("editor.areas")}</span></label>
              <sg-chip-select
                .options=${this.meta.areas}
                .selected=${t.areas}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patchTarget({areas:e.detail.value})}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.floors")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.floors}
                .selected=${t.floors}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patchTarget({floors:e.detail.value})}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.domains")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.domains.map(e=>({id:e,name:e}))}
                .selected=${t.domains}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patchTarget({domains:e.detail.value})}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.integrations")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.integrations.map(e=>({id:e.id,name:e.title}))}
                .selected=${t.integrations}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patchTarget({integrations:e.detail.value})}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.entities")}</span>
                <input
                  type="text"
                  .value=${t.entities.join(", ")}
                  placeholder="sensor.example, binary_sensor.other"
                  @change=${e=>this.patchTarget({entities:Q(e.target.value)})}
                />
              </label>

              <label class="field">
                <span>${this.localize("editor.exclude_labels")}</span>
              </label>
              <sg-chip-select
                .options=${this.meta.labels}
                .selected=${t.exclude_labels}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patchTarget({exclude_labels:e.detail.value})}
              ></sg-chip-select>

              <label class="field" style="margin-top:12px">
                <span>${this.localize("editor.exclude_entities")}</span>
                <input
                  type="text"
                  .value=${t.exclude_entities.join(", ")}
                  @change=${e=>this.patchTarget({exclude_entities:Q(e.target.value)})}
                />
              </label>
            </div>
          </details>

          <div style="margin-top:14px">
            <div class="preview-head">
              <h3 style="margin:0">${this.localize("editor.preview")}</h3>
              <span class="badge"
                >${this.localize("editor.preview_count",{count:this.previewCount})}</span
              >
            </div>
            ${this.previewCount?l`<sg-entity-list
                  .entities=${this.preview}
                  .localize=${this.localize}
                ></sg-entity-list>`:l`<p class="hint">${this.localize("editor.preview_none")}</p>`}
          </div>
        </div>

        <div class="section">
          <h3>${this.localize("editor.conditions")}</h3>
          <p class="hint" style="margin-bottom:12px">
            ${this.localize("editor.condition_or")}
          </p>
          ${this.draft.conditions.map((e,i)=>l`
              <div class="condition">
                <div class="row" style="margin-bottom:10px">
                  <select
                    style="flex:1"
                    @change=${s=>{const a=s.target.value,n=[...this.draft.conditions];n[i]=M(a),this.patch({conditions:n})}}
                  >
                    ${oe.map(s=>l`
                        <option value=${s} ?selected=${e.type===s}>
                          ${this.localize(`cond.${s}`)}
                        </option>
                      `)}
                  </select>
                  <button
                    class="plain"
                    @click=${()=>this.patch({conditions:this.draft.conditions.filter((s,a)=>a!==i)})}
                  >
                    <ha-icon icon="mdi:close"></ha-icon>
                  </button>
                </div>
                ${this.renderConditionBody(e,i)}
              </div>
            `)}
          <button
            class="secondary"
            @click=${()=>this.patch({conditions:[...this.draft.conditions,M("unavailable_state")]})}
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
                  @value-changed=${e=>this.patch({grace_period:e.detail.value})}
                ></sg-duration>
              </label>
              <label class="checkbox">
                <input
                  type="checkbox"
                  .checked=${this.draft.restart_grace===null}
                  @change=${e=>this.patch({restart_grace:e.target.checked?null:600})}
                />
                <span>${this.localize("editor.restart_grace_global")}</span>
              </label>
              ${this.draft.restart_grace!==null?l`
                    <label class="field">
                      <span>${this.localize("editor.restart_grace")}</span>
                      <sg-duration
                        .value=${this.draft.restart_grace}
                        .localize=${this.localize}
                        @value-changed=${e=>this.patch({restart_grace:e.detail.value})}
                      ></sg-duration>
                    </label>
                  `:r}
              <label class="field">
                <span>${this.localize("editor.channels")}</span>
              </label>
              <sg-chip-select
                .options=${this.config.channels.map(e=>({id:e.id,name:e.name}))}
                .selected=${this.draft.channels}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patch({channels:e.detail.value})}
              ></sg-chip-select>

              <label class="field" style="margin-top:14px">
                <span>${this.localize("editor.overlap_mode")}</span>
                <select
                  @change=${e=>this.patch({overlap_mode:e.target.value})}
                >
                  <option value="all" ?selected=${this.draft.overlap_mode==="all"}>
                    ${this.localize("editor.overlap_all")}
                  </option>
                  <option
                    value="highest_severity"
                    ?selected=${this.draft.overlap_mode==="highest_severity"}
                  >
                    ${this.localize("editor.overlap_highest")}
                  </option>
                </select>
              </label>
              ${[["notify_on_clear","editor.notify_on_clear"],["suppress_by_parent","editor.suppress_by_parent"],["group_alerts","editor.group_alerts"],["enabled","editor.enabled"]].map(([e,i])=>l`
                  <label class="checkbox">
                    <input
                      type="checkbox"
                      .checked=${this.draft[e]}
                      @change=${s=>this.patch({[e]:s.target.checked})}
                    />
                    <span>${this.localize(i)}</span>
                  </label>
                `)}
            </div>
          </details>
        </div>

        ${this.error?l`<p class="error">${this.error}</p>`:r}

        <div class="sticky">
          <button @click=${this.save}>${this.localize("editor.save")}</button>
          <button class="secondary" @click=${()=>this.fire("sg-cancel-edit")}>
            ${this.localize("editor.cancel")}
          </button>
        </div>
      </div>
    `}};v.styles=[b,z`
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
    `];_([c({attribute:!1})],v.prototype,"config",2);_([c({attribute:!1})],v.prototype,"meta",2);_([c({attribute:!1})],v.prototype,"localize",2);_([c({attribute:!1})],v.prototype,"watch",2);_([c({attribute:!1})],v.prototype,"template",2);_([d()],v.prototype,"draft",2);_([d()],v.prototype,"preview",2);_([d()],v.prototype,"previewCount",2);_([d()],v.prototype,"error",2);v=_([y("sg-watch-editor")],v);function U(t){const e=t.trim();if(!e)return null;const i=Number(e);return Number.isFinite(i)?i:null}function Q(t){return t.split(",").map(e=>e.trim()).filter(Boolean)}var ce=Object.defineProperty,de=Object.getOwnPropertyDescriptor,T=(t,e,i,s)=>{for(var a=s>1?void 0:s?de(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&ce(e,i,a),a};const he=["ha_service","smtp","telegram","pushover","ntfy"],pe="__unchanged__",ue={ha_service:"mdi:home-assistant",smtp:"mdi:email-outline",telegram:"mdi:send",pushover:"mdi:cellphone-message",ntfy:"mdi:bell-ring-outline"},ge=()=>({id:"",name:"",kind:"ha_service",enabled:!0,config:{},title_template:"",template:""});let x=class extends f{constructor(){super(...arguments),this.editing=null,this.testState=null,this.testing=!1}fire(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}patch(t){this.editing&&(this.editing={...this.editing,...t}),this.testState=null}patchConfig(t,e){this.editing&&this.patch({config:{...this.editing.config,[t]:e}})}usedBy(t){return this.config.severities.filter(e=>e.channels.includes(t.id)||e.escalation_channels.includes(t.id)).length}renderField(t,e){const i=this.localize(`field.${t.key}`),s=e.config[t.key],a=s==null?"":String(s);if(t.type==="select")return l`
        <label class="field">
          <span>${i}</span>
          <select
            @change=${u=>this.patchConfig(t.key,u.target.value)}
          >
            ${(t.options??[]).map(u=>l`
                <option
                  value=${u}
                  ?selected=${a===u||!a&&String(t.default??"")===u}
                >
                  ${u}
                </option>
              `)}
          </select>
        </label>
      `;if(t.type==="object")return l`
        <label class="field">
          <span>${i}</span>
          <textarea
            .value=${s?JSON.stringify(s,null,2):""}
            placeholder=${'{ "data": { "push": { "sound": "default" } } }'}
            @change=${u=>{const w=u.target.value.trim();if(!w){this.patchConfig(t.key,void 0);return}try{this.patchConfig(t.key,JSON.parse(w))}catch{this.testState={ok:!1,text:"JSON?"}}}}
          ></textarea>
        </label>
      `;const n=t.type==="secret",o=n&&a===pe;return l`
      <label class="field">
        <span>${i}${t.required?" *":""}</span>
        <input
          type=${n?"password":t.type==="number"?"number":"text"}
          .value=${o?"":a}
          placeholder=${o?this.localize("ch.secret_kept"):t.example??String(t.default??"")}
          @change=${u=>{const w=u.target.value;n&&!w&&o||this.patchConfig(t.key,w)}}
        />
      </label>
    `}async test(){this.editing&&(this.testing=!0,this.testState=null,this.dispatchEvent(new CustomEvent("sg-test-channel",{detail:{channel:this.editing,callback:t=>{if(this.testing=!1,t.ok){this.testState={ok:!0,text:this.localize("ch.test_ok")};return}const e=t.error??"";this.testState={ok:!1,text:e.startsWith("missing:")?this.localize("ch.test_missing",{field:this.localize(`field.${e.slice(8)}`)}):this.localize("ch.test_failed",{error:e})}}},bubbles:!0,composed:!0})))}renderEditor(t){const e=this.meta.channel_fields[t.kind]??[];return l`
      <div class="card">
        <h2>${t.name||this.localize("ch.add")}</h2>

        <div class="grid">
          <label class="field">
            <span>${this.localize("ch.name")}</span>
            <input
              type="text"
              .value=${t.name}
              @input=${i=>this.patch({name:i.target.value})}
            />
          </label>
          <label class="field">
            <span>${this.localize("ch.kind")}</span>
            <select
              @change=${i=>this.patch({kind:i.target.value,config:{}})}
            >
              ${he.map(i=>l`
                  <option value=${i} ?selected=${t.kind===i}>
                    ${this.localize(`kind.${i}`)}
                  </option>
                `)}
            </select>
          </label>
        </div>
        <p class="kind-hint">${this.localize(`kind.${t.kind}_hint`)}</p>

        ${e.map(i=>this.renderField(i,t))}

        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${t.enabled}
            @change=${i=>this.patch({enabled:i.target.checked})}
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
                .value=${t.title_template}
                placeholder="{{ severity }}: {{ watch }}"
                @change=${i=>this.patch({title_template:i.target.value})}
              />
            </label>
            <label class="field">
              <span>${this.localize("ch.template")}</span>
              <textarea
                .value=${t.template}
                @change=${i=>this.patch({template:i.target.value})}
              ></textarea>
            </label>
            <p class="hint">${this.localize("ch.template_hint")}</p>
          </div>
        </details>

        <div class="row" style="margin-top:12px">
          <button
            @click=${()=>{this.fire("sg-save-channel",{channel:this.editing}),this.editing=null}}
          >
            ${this.localize("editor.save")}
          </button>
          <button class="secondary" ?disabled=${this.testing} @click=${this.test}>
            <ha-icon icon="mdi:send-check-outline"></ha-icon>
            ${this.localize("ch.test")}
          </button>
          <button
            class="secondary"
            @click=${()=>{this.editing=null,this.testState=null}}
          >
            ${this.localize("editor.cancel")}
          </button>
        </div>
        ${this.testState?l`<p class=${this.testState.ok?"result ok":"result bad"}>
              ${this.testState.text}
            </p>`:r}
      </div>
    `}render(){return this.editing?this.renderEditor(this.editing):l`
      <div class="card">
        <button
          @click=${()=>{this.editing=ge()}}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${this.localize("ch.add")}
        </button>
      </div>

      <div class="card flush">
        ${this.config.channels.length?this.config.channels.map(t=>{const e=this.usedBy(t);return l`
                <div class="list-item">
                  <ha-icon
                    icon=${ue[t.kind]}
                    style=${`--mdc-icon-size:24px;color:${t.enabled?"var(--primary-color)":"var(--secondary-text-color)"}`}
                  ></ha-icon>
                  <div style="flex:1;min-width:0">
                    <div class="title">
                      ${t.name}
                      ${t.enabled?r:l`<span class="badge"
                            >${this.localize("watches.paused")}</span
                          >`}
                    </div>
                    <div class="subtitle">
                      ${this.localize(`kind.${t.kind}`)} ·
                      ${e?this.localize("ch.used_by",{count:e}):this.localize("ch.unused")}
                    </div>
                  </div>
                  <button
                    class="plain"
                    @click=${()=>{this.editing=structuredClone(t),this.testState=null}}
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </button>
                  <button
                    class="plain"
                    @click=${()=>this.fire("sg-delete-channel",{channel:t})}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
              `}):l`<div class="empty">
              <ha-icon icon="mdi:bell-outline"></ha-icon>
              <div>${this.localize("ch.empty")}</div>
            </div>`}
      </div>
    `}};x.styles=[b,z`
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
    `];T([c({attribute:!1})],x.prototype,"config",2);T([c({attribute:!1})],x.prototype,"meta",2);T([c({attribute:!1})],x.prototype,"localize",2);T([d()],x.prototype,"editing",2);T([d()],x.prototype,"testState",2);T([d()],x.prototype,"testing",2);x=T([y("sg-channels")],x);var ve=Object.defineProperty,$e=Object.getOwnPropertyDescriptor,C=(t,e,i,s)=>{for(var a=s>1?void 0:s?$e(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&ve(e,i,a),a};const me=50,be=[1,7,30,90,365];let m=class extends f{constructor(){super(...arguments),this.incidents=[],this.total=0,this.watchId="",this.severityId="",this.days=30,this.openOnly=!1}request(t=0){this.dispatchEvent(new CustomEvent("sg-load-history",{detail:{limit:me,offset:t,watch_id:this.watchId||null,severity_id:this.severityId||null,days:this.days,open_only:this.openOnly,append:t>0},bubbles:!0,composed:!0}))}firstUpdated(){this.request()}duration(t){const e=Math.max(0,Math.round(t));return e<60?`${e}s`:e<3600?`${Math.floor(e/60)}m`:e<86400?`${Math.floor(e/3600)}h ${Math.floor(e%3600/60)}m`:`${Math.floor(e/86400)}d ${Math.floor(e%86400/3600)}h`}when(t){return new Date(t*1e3).toLocaleString()}render(){const t=this.localize;return l`
      <div class="card">
        <div class="filters">
          <label class="field" style="margin:0">
            <span>${t("nav.watches")}</span>
            <select
              @change=${e=>{this.watchId=e.target.value,this.request()}}
            >
              <option value="">${t("hist.all_watches")}</option>
              ${this.config.watches.map(e=>l`
                  <option value=${e.id} ?selected=${this.watchId===e.id}>
                    ${e.name}
                  </option>
                `)}
            </select>
          </label>
          <label class="field" style="margin:0">
            <span>${t("nav.severities")}</span>
            <select
              @change=${e=>{this.severityId=e.target.value,this.request()}}
            >
              <option value="">${t("hist.all_severities")}</option>
              ${this.config.severities.map(e=>l`
                  <option
                    value=${e.id}
                    ?selected=${this.severityId===e.id}
                  >
                    ${e.name}
                  </option>
                `)}
            </select>
          </label>
          <label class="field" style="margin:0">
            <span>${t("hist.range")}</span>
            <select
              @change=${e=>{this.days=Number(e.target.value),this.request()}}
            >
              ${be.map(e=>l`
                  <option value=${e} ?selected=${this.days===e}>
                    ${t("hist.days",{count:e})}
                  </option>
                `)}
            </select>
          </label>
        </div>
        <label class="checkbox" style="margin-top:12px;margin-bottom:0">
          <input
            type="checkbox"
            .checked=${this.openOnly}
            @change=${e=>{this.openOnly=e.target.checked,this.request()}}
          />
          <span>${t("hist.open_only")}</span>
        </label>
      </div>

      <div class="card flush">
        ${this.incidents.length?l`
              <h2 style="padding:var(--sg-gap) var(--sg-gap) 4px">
                ${t("hist.total",{count:this.total})}
              </h2>
              ${this.incidents.map(e=>{const i=this.config.severities.find(a=>a.id===e.severity_id),s=e.resolved_at!==null;return l`
                  <div class="incident">
                    <ha-icon
                      icon=${i?.icon||"mdi:alert-circle-outline"}
                      style=${`color:${s?"var(--secondary-text-color)":D(i?.color)}`}
                    ></ha-icon>
                    <div class="body">
                      <div class="name">
                        <sg-entity-menu
                          .entityId=${e.entity_id}
                          .label=${e.friendly_name??e.entity_id}
                          .localize=${t}
                        ></sg-entity-menu>
                        <span class="id">${e.entity_id}</span>
                      </div>
                      <div class="meta">
                        ${e.watch_name} · ${e.reason_text}
                        ${e.escalated_at?l` · <span class="badge">${t("hist.escalated")}</span>`:r}
                      </div>
                    </div>
                    <div class="when">
                      ${this.when(e.started_at)}<br />
                      ${s?t("hist.resolved_after",{duration:this.duration((e.resolved_at??0)-e.started_at)}):l`<span class="open">${t("hist.ongoing")}</span>`}
                    </div>
                  </div>
                `})}
              ${this.incidents.length<this.total?l`
                    <div style="padding:12px var(--sg-gap)">
                      <button
                        class="secondary"
                        @click=${()=>this.request(this.incidents.length)}
                      >
                        ${t("hist.more")}
                      </button>
                    </div>
                  `:r}
            `:l`<div class="empty">
              <ha-icon icon="mdi:history"></ha-icon>
              <div>${t("hist.empty")}</div>
            </div>`}
      </div>
    `}};m.styles=[b,z`
      .filters {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
        align-items: end;
      }

      .incident {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px var(--sg-gap);
        border-bottom: var(--sg-border);
      }

      .incident:last-child {
        border-bottom: none;
      }

      .incident ha-icon {
        --mdc-icon-size: 20px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .incident .body {
        flex: 1;
        min-width: 0;
      }

      .incident .name {
        font-size: 0.9375rem;
        font-weight: 500;
        display: flex;
        align-items: baseline;
        gap: 8px;
        flex-wrap: wrap;
      }

      .incident .id {
        font-family: var(--code-font-family, monospace);
        font-size: 0.7rem;
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .incident .meta {
        font-size: 0.8125rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }

      .incident .when {
        text-align: right;
        font-size: 0.8125rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }

      .open {
        color: var(--warning-color, #ffa600);
      }
    `];C([c({attribute:!1})],m.prototype,"config",2);C([c({attribute:!1})],m.prototype,"localize",2);C([c({attribute:!1})],m.prototype,"incidents",2);C([c({type:Number})],m.prototype,"total",2);C([d()],m.prototype,"watchId",2);C([d()],m.prototype,"severityId",2);C([d()],m.prototype,"days",2);C([d()],m.prototype,"openOnly",2);m=C([y("sg-history")],m);var fe=Object.defineProperty,ye=Object.getOwnPropertyDescriptor,A=(t,e,i,s)=>{for(var a=s>1?void 0:s?ye(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&fe(e,i,a),a};const _e=()=>({id:"",name:"",priority:50,color:"amber",icon:"mdi:alert-outline",channels:[],ignore_quiet_hours:!1,persistent_notification:!0,bundle_window:60,repeat_interval:0,escalation_after:0,escalation_channels:[]});let W=class extends f{constructor(){super(...arguments),this.editing=null}fire(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}patch(t){this.editing&&(this.editing={...this.editing,...t})}usedBy(t){return this.config.watches.filter(e=>e.severity_id===t.id).length}renderEditor(t){return l`
      <div class="card">
        <h2>${t.name||this.localize("sev.add")}</h2>
        <div class="grid">
          <label class="field">
            <span>${this.localize("sev.name")}</span>
            <input
              type="text"
              .value=${t.name}
              @input=${e=>this.patch({name:e.target.value})}
            />
          </label>
          <label class="field">
            <span>${this.localize("sev.priority")}</span>
            <input
              type="number"
              min="0"
              max="100"
              .value=${String(t.priority)}
              @change=${e=>this.patch({priority:Number(e.target.value)})}
            />
          </label>
          <label class="field">
            <span>${this.localize("sev.color")}</span>
            <select
              @change=${e=>this.patch({color:e.target.value})}
            >
              ${Object.keys(J).map(e=>l`
                  <option value=${e} ?selected=${t.color===e}>
                    ${this.localize(`color.${e}`)}
                  </option>
                `)}
            </select>
          </label>
          <label class="field">
            <span>${this.localize("sev.icon")}</span>
            <input
              type="text"
              .value=${t.icon}
              placeholder="mdi:alert"
              @input=${e=>this.patch({icon:e.target.value})}
            />
          </label>
        </div>

        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${t.persistent_notification}
            @change=${e=>this.patch({persistent_notification:e.target.checked})}
          />
          <span>${this.localize("sev.persistent_notification")}</span>
        </label>
        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${t.ignore_quiet_hours}
            @change=${e=>this.patch({ignore_quiet_hours:e.target.checked})}
          />
          <span>${this.localize("sev.ignore_quiet_hours")}</span>
        </label>

        <div class="grid">
          <label class="field">
            <span>${this.localize("sev.bundle_window")}</span>
            <sg-duration
              .value=${t.bundle_window}
              .localize=${this.localize}
              @value-changed=${e=>this.patch({bundle_window:e.detail.value})}
            ></sg-duration>
            <p class="hint">${this.localize("sev.bundle_hint")}</p>
          </label>
          <label class="field">
            <span>${this.localize("sev.repeat_interval")}</span>
            <sg-duration
              .value=${t.repeat_interval}
              .localize=${this.localize}
              @value-changed=${e=>this.patch({repeat_interval:e.detail.value})}
            ></sg-duration>
            <p class="hint">${this.localize("sev.repeat_hint")}</p>
          </label>
          <label class="field">
            <span>${this.localize("sev.escalation_after")}</span>
            <sg-duration
              .value=${t.escalation_after}
              .localize=${this.localize}
              @value-changed=${e=>this.patch({escalation_after:e.detail.value})}
            ></sg-duration>
            <p class="hint">${this.localize("sev.escalation_hint")}</p>
          </label>
        </div>

        <label class="field" style="margin-top:8px">
          <span>${this.localize("sev.channels")}</span>
        </label>
        <sg-chip-select
          .options=${this.config.channels.map(e=>({id:e.id,name:e.name}))}
          .selected=${t.channels}
          .searchLabel=${this.localize("common.search")}
          @value-changed=${e=>this.patch({channels:e.detail.value})}
        ></sg-chip-select>

        ${t.escalation_after>0?l`
              <label class="field" style="margin-top:14px">
                <span>${this.localize("sev.escalation_channels")}</span>
              </label>
              <sg-chip-select
                .options=${this.config.channels.map(e=>({id:e.id,name:e.name}))}
                .selected=${t.escalation_channels}
                .searchLabel=${this.localize("common.search")}
                @value-changed=${e=>this.patch({escalation_channels:e.detail.value})}
              ></sg-chip-select>
            `:r}

        <div class="row" style="margin-top:16px">
          <button
            @click=${()=>{this.fire("sg-save-severity",{severity:this.editing}),this.editing=null}}
          >
            ${this.localize("editor.save")}
          </button>
          <button
            class="secondary"
            @click=${()=>{this.editing=null}}
          >
            ${this.localize("editor.cancel")}
          </button>
        </div>
      </div>
    `}render(){return this.editing?this.renderEditor(this.editing):l`
      <div class="card">
        <button
          @click=${()=>{this.editing=_e()}}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          ${this.localize("sev.add")}
        </button>
        <p class="hint">${this.localize("sev.priority_hint")}</p>
      </div>

      <div class="card flush">
        ${this.config.severities.slice().sort((t,e)=>e.priority-t.priority).map(t=>{const e=this.usedBy(t);return l`
              <div class="list-item">
                <ha-icon
                  icon=${t.icon}
                  style=${`color:${D(t.color)};--mdc-icon-size:24px`}
                ></ha-icon>
                <div style="flex:1;min-width:0">
                  <div class="title">
                    ${t.name}
                    <span class="badge">${t.priority}</span>
                  </div>
                  <div class="subtitle">
                    ${this.localize(e===1?"sev.in_use_one":"sev.in_use",{count:e})}
                    ${t.ignore_quiet_hours?l` · ${this.localize("sev.ignore_quiet_hours")}`:r}
                  </div>
                </div>
                <button
                  class="plain"
                  @click=${()=>{this.editing=structuredClone(t)}}
                >
                  <ha-icon icon="mdi:pencil"></ha-icon>
                </button>
                <button
                  class="plain"
                  ?disabled=${e>0}
                  @click=${()=>this.fire("sg-delete-severity",{severity:t})}
                >
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </div>
            `})}
      </div>
    `}};W.styles=b;A([c({attribute:!1})],W.prototype,"config",2);A([c({attribute:!1})],W.prototype,"localize",2);A([d()],W.prototype,"editing",2);W=A([y("sg-severities")],W);var we=Object.defineProperty,xe=Object.getOwnPropertyDescriptor,j=(t,e,i,s)=>{for(var a=s>1?void 0:s?xe(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&we(e,i,a),a};let E=class extends f{constructor(){super(...arguments),this.saved=!1}get current(){return this.draft??this.settings}patch(t){this.draft={...this.current,...t},this.saved=!1}patchQuiet(t){this.patch({quiet_hours:{...this.current.quiet_hours,...t}})}patchWindow(t,e){const i=this.current.quiet_hours.windows.map((s,a)=>a===t?{...s,...e}:s);this.patchQuiet({windows:i})}wraps(t){return t.end<=t.start}renderWindow(t,e){const i=this.localize;return l`
      <div class="window">
        <div class="grid">
          <label class="field" style="margin:0">
            <span>${i("settings.quiet_from")}</span>
            <input
              type="time"
              .value=${t.start}
              @change=${s=>this.patchWindow(e,{start:s.target.value})}
            />
          </label>
          <label class="field" style="margin:0">
            <span>${i("settings.quiet_to")}</span>
            <input
              type="time"
              .value=${t.end}
              @change=${s=>this.patchWindow(e,{end:s.target.value})}
            />
          </label>
        </div>
        ${this.wraps(t)?l`<p class="hint">↪ ${i("settings.window_wraps")}</p>`:r}

        <label class="field" style="margin-top:12px">
          <span>${i("settings.weekdays")}</span>
        </label>
        <div class="chips">
          ${[0,1,2,3,4,5,6].map(s=>l`
              <button
                type="button"
                class="chip"
                data-selected=${t.weekdays.includes(s)}
                @click=${()=>this.patchWindow(e,{weekdays:t.weekdays.includes(s)?t.weekdays.filter(a=>a!==s):[...t.weekdays,s].sort((a,n)=>a-n)})}
              >
                ${i(`day.${s}`)}
              </button>
            `)}
        </div>
        ${t.weekdays.length?r:l`<p class="error">${i("settings.window_no_days")}</p>`}

        <button
          class="plain"
          style="margin-top:8px"
          @click=${()=>this.patchQuiet({windows:this.current.quiet_hours.windows.filter((s,a)=>a!==e)})}
        >
          <ha-icon icon="mdi:close"></ha-icon>
          ${i("settings.remove_window")}
        </button>
      </div>
    `}render(){const t=this.current,e=t.quiet_hours;return l`
      <div class="card">
        <h2>${this.localize("nav.settings")}</h2>

        <label class="field">
          <span>${this.localize("settings.restart_grace")}</span>
          <sg-duration
            .value=${t.restart_grace_period}
            .localize=${this.localize}
            @value-changed=${i=>this.patch({restart_grace_period:i.detail.value})}
          ></sg-duration>
          <p class="hint">${this.localize("settings.restart_hint")}</p>
        </label>

        <label class="field">
          <span>${this.localize("settings.internet_entity")}</span>
          <input
            type="text"
            .value=${t.internet_entity??""}
            placeholder="binary_sensor.internet"
            @change=${i=>this.patch({internet_entity:i.target.value.trim()||null})}
          />
          <p class="hint">${this.localize("settings.internet_hint")}</p>
        </label>

        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${t.report_failed_integrations}
            @change=${i=>this.patch({report_failed_integrations:i.target.checked})}
          />
          <span>${this.localize("settings.failed_integrations")}</span>
        </label>
        ${t.report_failed_integrations?l`
              <label class="field">
                <select
                  @change=${i=>this.patch({failed_integrations_scope:i.target.value})}
                >
                  <option
                    value="watched"
                    ?selected=${t.failed_integrations_scope==="watched"}
                  >
                    ${this.localize("settings.scope_watched")}
                  </option>
                  <option
                    value="all"
                    ?selected=${t.failed_integrations_scope==="all"}
                  >
                    ${this.localize("settings.scope_all")}
                  </option>
                </select>
              </label>
            `:r}
      </div>

      <div class="card">
        <h3>${this.localize("settings.quiet_hours")}</h3>
        <label class="checkbox">
          <input
            type="checkbox"
            .checked=${e.enabled}
            @change=${i=>this.patchQuiet({enabled:i.target.checked})}
          />
          <span>${this.localize("settings.quiet_enabled")}</span>
        </label>
        ${e.enabled?l`
              ${e.windows.length?e.windows.map((i,s)=>this.renderWindow(i,s)):l`<p class="hint">
                    ${this.localize("settings.no_windows")}
                  </p>`}
              <button
                class="secondary"
                @click=${()=>this.patchQuiet({windows:[...e.windows,{start:"22:00",end:"07:00",weekdays:[0,1,2,3,4]}]})}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this.localize("settings.add_window")}
              </button>
              <p class="hint">${this.localize("settings.quiet_hint")}</p>
            `:r}
      </div>

      <div class="card">
        <label class="field">
          <span>${this.localize("settings.history_retention")}</span>
          <div class="suffixed">
            <input
              type="number"
              min="1"
              .value=${String(t.history_retention_days)}
              @change=${i=>this.patch({history_retention_days:Number(i.target.value)})}
            />
            <span class="suffix">${this.localize("unit.days")}</span>
          </div>
        </label>
        <label class="field">
          <span>${this.localize("settings.panel_access")}</span>
          <select
            @change=${i=>this.patch({panel_access:i.target.value})}
          >
            <option value="admin" ?selected=${t.panel_access!=="all"}>
              ${this.localize("settings.panel_admin")}
            </option>
            <option value="all" ?selected=${t.panel_access==="all"}>
              ${this.localize("settings.panel_all")}
            </option>
          </select>
          <p class="hint">${this.localize("settings.panel_hint")}</p>
        </label>

        <label class="field">
          <span>${this.localize("settings.language")}</span>
          <select
            @change=${i=>this.patch({ui_language:i.target.value})}
          >
            <option value="auto" ?selected=${t.ui_language==="auto"}>
              ${this.localize("settings.language_auto")}
            </option>
            <option value="en" ?selected=${t.ui_language==="en"}>
              English
            </option>
            <option value="de" ?selected=${t.ui_language==="de"}>
              Deutsch
            </option>
          </select>
        </label>

        <div class="row">
          <button
            @click=${()=>{this.dispatchEvent(new CustomEvent("sg-save-settings",{detail:{settings:t},bubbles:!0,composed:!0})),this.saved=!0}}
          >
            ${this.localize("settings.save")}
          </button>
          ${this.saved?l`<span class="badge">${this.localize("settings.saved")}</span>`:r}
        </div>
      </div>
    `}};E.styles=[b,z`
      .window {
        border: var(--sg-border);
        border-radius: 10px;
        padding: 12px;
        margin-bottom: 12px;
      }
    `];j([c({attribute:!1})],E.prototype,"settings",2);j([c({attribute:!1})],E.prototype,"localize",2);j([d()],E.prototype,"draft",2);j([d()],E.prototype,"saved",2);E=j([y("sg-settings")],E);var ze=Object.defineProperty,ke=Object.getOwnPropertyDescriptor,g=(t,e,i,s)=>{for(var a=s>1?void 0:s?ke(e,i):e,n=t.length-1,o;n>=0;n--)(o=t[n])&&(a=(s?o(e,i,a):o(a))||a);return s&&a&&ze(e,i,a),a};const Ce=5e3;let p=class extends f{constructor(){super(...arguments),this.narrow=!1,this.view="overview",this.editingWatch=null,this.editingTemplate=null,this.editorOpen=!1,this.error="",this.incidents=[],this.historyTotal=0}get isAdmin(){return this.hass?.user?.is_admin!==!1}connectedCallback(){super.connectedCallback(),this.timer=window.setInterval(()=>this.refreshStatus(),Ce)}disconnectedCallback(){super.disconnectedCallback(),this.timer&&window.clearInterval(this.timer)}willUpdate(t){t.has("hass")&&this.hass&&(this.api?this.api.update(this.hass):(this.api=new K(this.hass),this.load()))}get localize(){const t=this.config?.settings.ui_language??"auto";return H(t==="auto"?this.hass?.language||"en":t)}async load(){if(this.api){if(!this.isAdmin){try{this.cardData=await this.api.getCardData(),this.error=""}catch(t){this.error=this.describeError(t)}return}try{const{config:t,meta:e}=await this.api.getConfig();this.config=t,this.meta=e,this.status=await this.api.getStatus(),this.error=""}catch(t){this.error=this.describeError(t)}}}async refreshStatus(){if(this.api)try{if(!this.isAdmin){this.cardData=await this.api.getCardData();return}this.config&&(this.status=await this.api.getStatus())}catch{}}async run(t){try{await t(),await this.load()}catch(e){this.error=this.describeError(e)}}describeError(t){const e=t;return e?.code==="in_use"?this.localize("error.in_use",{names:e.message??""}):e?.code&&["not_loaded","not_found"].includes(e.code)?this.localize(`error.${e.code}`):this.localize("common.error",{message:String(e?.message??t)})}closeEditor(){this.editorOpen=!1,this.editingWatch=null,this.editingTemplate=null}renderView(){if(!this.isAdmin)return this.cardData?l`
        <sg-overview
          .config=${{severities:this.cardData.severities,watches:[],channels:[],settings:{internet_entity:null}}}
          .status=${{problems:this.cardData.problems,watched_entity_count:this.cardData.watched_entity_count,resolved:{},monitoring_enabled:this.cardData.monitoring_enabled,restart_grace_until:this.cardData.restart_grace_until,internet_down:this.cardData.internet_down}}
          .localize=${this.localize}
          .readOnly=${!0}
        ></sg-overview>
      `:l`<div class="loading">…</div>`;if(!this.config||!this.meta||!this.status)return l`<div class="loading">…</div>`;if(this.editorOpen)return l`
        <sg-watch-editor
          .config=${this.config}
          .meta=${this.meta}
          .localize=${this.localize}
          .watch=${this.editingWatch}
          .template=${this.editingTemplate}
        ></sg-watch-editor>
      `;switch(this.view){case"watches":return l`
          <sg-watches
            .config=${this.config}
            .meta=${this.meta}
            .status=${this.status}
            .localize=${this.localize}
          ></sg-watches>
        `;case"channels":return l`
          <sg-channels
            .config=${this.config}
            .meta=${this.meta}
            .localize=${this.localize}
          ></sg-channels>
        `;case"severities":return l`
          <sg-severities
            .config=${this.config}
            .localize=${this.localize}
          ></sg-severities>
        `;case"history":return l`
          <sg-history
            .config=${this.config}
            .localize=${this.localize}
            .incidents=${this.incidents}
            .total=${this.historyTotal}
          ></sg-history>
        `;case"settings":return l`
          <sg-settings
            .settings=${this.config.settings}
            .localize=${this.localize}
          ></sg-settings>
        `;default:return l`
          <sg-overview
            .config=${this.config}
            .status=${this.status}
            .localize=${this.localize}
          ></sg-overview>
        `}}render(){const t=this.localize,e=this.isAdmin?[["overview","nav.overview"],["watches","nav.watches"],["channels","nav.channels"],["severities","nav.severities"],["history","nav.history"],["settings","nav.settings"]]:[];return l`
      <div
        @sg-navigate=${i=>{this.view=i.detail.view}}
        @sg-run-check=${()=>this.run(()=>this.api.runCheck())}
        @sg-toggle-monitoring=${i=>this.run(()=>this.api.setMonitoring(i.detail.enabled))}
        @sg-snooze=${i=>this.run(()=>this.api.snooze(i.detail.watchId,i.detail.entityId,i.detail.duration))}
        @sg-acknowledge=${i=>this.run(()=>this.api.acknowledge(i.detail.watchId,i.detail.entityId))}
        @sg-edit-watch=${i=>{this.editingWatch=i.detail.watch??null,this.editingTemplate=i.detail.template??null,this.editorOpen=!0}}
        @sg-cancel-edit=${()=>this.closeEditor()}
        @sg-save-watch=${i=>{this.closeEditor(),this.run(()=>this.api.saveWatch(i.detail.watch))}}
        @sg-delete-watch=${i=>{const s=i.detail.watch;confirm(t("watches.confirm_delete",{name:s.name}))&&this.run(()=>this.api.deleteWatch(s.id))}}
        @sg-toggle-watch=${i=>this.run(()=>this.api.saveWatch({...i.detail.watch,enabled:i.detail.enabled}))}
        @sg-save-channel=${i=>this.run(()=>this.api.saveChannel(i.detail.channel))}
        @sg-delete-channel=${i=>{const s=i.detail.channel;confirm(t("ch.confirm_delete",{name:s.name}))&&this.run(()=>this.api.deleteChannel(s.id))}}
        @sg-test-channel=${i=>{const{channel:s,callback:a}=i.detail;this.api?.testChannel(s).then(a).catch(n=>a({ok:!1,error:String(n?.message??n)}))}}
        @sg-load-history=${i=>{const{append:s,...a}=i.detail;this.api?.history(a).then(n=>{this.incidents=s?[...this.incidents,...n.incidents]:n.incidents,this.historyTotal=n.total}).catch(n=>{this.error=this.describeError(n)})}}
        @sg-watch-entities=${i=>{const{watchId:s,callback:a}=i.detail;this.api?.watchEntities(s).then(a).catch(()=>a(null))}}
        @sg-save-severity=${i=>this.run(()=>this.api.saveSeverity(i.detail.severity))}
        @sg-delete-severity=${i=>{const s=i.detail.severity;confirm(t("sev.confirm_delete",{name:s.name}))&&this.run(()=>this.api.deleteSeverity(s.id))}}
        @sg-save-settings=${i=>this.run(()=>this.api.saveSettings(i.detail.settings))}
        @sg-preview=${i=>{const{target:s,callback:a}=i.detail;this.api?.preview(s).then(a).catch(()=>a({count:0,entities:[]}))}}
      >
        <div class="toolbar">
          ${this.narrow?l`
                <button
                  class="menu"
                  @click=${()=>this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))}
                >
                  <ha-icon icon="mdi:menu"></ha-icon>
                </button>
              `:r}
          <span>StateGuard</span>
        </div>
        <div class="tabs" ?hidden=${!e.length}>
          ${e.map(([i,s])=>l`
              <button
                class="tab"
                data-active=${!this.editorOpen&&this.view===i}
                @click=${()=>{this.closeEditor(),this.view=i}}
              >
                ${t(s)}
              </button>
            `)}
        </div>
        <div class="content">
          ${this.error?l`<p class="error">${this.error}</p>`:r}
          ${this.renderView()}
        </div>
      </div>
    `}};p.styles=[b,z`
      :host {
        background: var(--primary-background-color);
        min-height: 100vh;
        display: block;
      }

      .toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        height: 56px;
        padding: 0 16px;
        background: var(--app-header-background-color, var(--primary-color));
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        font-size: 1.25rem;
        font-weight: 400;
        box-sizing: border-box;
      }

      .tabs {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        background: var(--app-header-background-color, var(--primary-color));
        padding: 0 8px;
      }

      .tab {
        background: transparent;
        border: none;
        border-bottom: 3px solid transparent;
        border-radius: 0;
        padding: 12px 16px;
        color: var(--app-header-text-color, var(--text-primary-color, #fff));
        opacity: 0.75;
        font-size: 0.875rem;
        font-weight: 500;
        white-space: nowrap;
        cursor: pointer;
      }

      .tab[data-active="true"] {
        opacity: 1;
        border-bottom-color: currentColor;
      }

      .content {
        padding: 16px;
        max-width: 900px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      .menu {
        background: transparent;
        border: none;
        padding: 6px;
        color: inherit;
        cursor: pointer;
      }

      .loading {
        padding: 48px;
        text-align: center;
        color: var(--secondary-text-color);
      }
    `];g([c({attribute:!1})],p.prototype,"hass",2);g([c({type:Boolean})],p.prototype,"narrow",2);g([d()],p.prototype,"config",2);g([d()],p.prototype,"meta",2);g([d()],p.prototype,"status",2);g([d()],p.prototype,"view",2);g([d()],p.prototype,"editingWatch",2);g([d()],p.prototype,"editingTemplate",2);g([d()],p.prototype,"editorOpen",2);g([d()],p.prototype,"error",2);g([d()],p.prototype,"incidents",2);g([d()],p.prototype,"historyTotal",2);g([d()],p.prototype,"cardData",2);p=g([y("stateguard-panel")],p);
