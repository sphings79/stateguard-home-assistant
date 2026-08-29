/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const H=globalThis,L=H.ShadowRoot&&(H.ShadyCSS===void 0||H.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,W=Symbol(),V=new WeakMap;let re=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==W)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(L&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=V.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&V.set(t,e))}return e}toString(){return this.cssText}};const he=r=>new re(typeof r=="string"?r:r+"",void 0,W),se=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((i,n,s)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+r[s+1],r[0]);return new re(t,r,W)},ue=(r,e)=>{if(L)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),n=H.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=t.cssText,r.appendChild(i)}},K=L?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return he(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:pe,defineProperty:ge,getOwnPropertyDescriptor:me,getOwnPropertyNames:ve,getOwnPropertySymbols:fe,getPrototypeOf:_e}=Object,D=globalThis,F=D.trustedTypes,be=F?F.emptyScript:"",we=D.reactiveElementPolyfillSupport,E=(r,e)=>r,O={toAttribute(r,e){switch(e){case Boolean:r=r?be:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},G=(r,e)=>!pe(r,e),J={attribute:!0,type:String,converter:O,reflect:!1,useDefault:!1,hasChanged:G};Symbol.metadata??=Symbol("metadata"),D.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=J){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);n!==void 0&&ge(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:s}=me(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:n,set(o){const l=n?.call(this);s?.call(this,o),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??J}static _$Ei(){if(this.hasOwnProperty(E("elementProperties")))return;const e=_e(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(E("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(E("properties"))){const t=this.properties,i=[...ve(t),...fe(t)];for(const n of i)this.createProperty(n,t[n])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,n]of t)this.elementProperties.set(i,n)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const n=this._$Eu(t,i);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const n of i)t.unshift(K(n))}else e!==void 0&&t.push(K(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ue(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(n!==void 0&&i.reflect===!0){const s=(i.converter?.toAttribute!==void 0?i.converter:O).toAttribute(t,i.type);this._$Em=e,s==null?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(n!==void 0&&this._$Em!==n){const s=i.getPropertyOptions(n),o=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:O;this._$Em=n;const l=o.fromAttribute(t,s.type);this[n]=l??this._$Ej?.get(n)??l,this._$Em=null}}requestUpdate(e,t,i,n=!1,s){if(e!==void 0){const o=this.constructor;if(n===!1&&(s=this[e]),i??=o.getPropertyOptions(e),!((i.hasChanged??G)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:s},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),s!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),n===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[n,s]of this._$Ep)this[n]=s;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[n,s]of i){const{wrapped:o}=s,l=this[n];o!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,s,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[E("elementProperties")]=new Map,$[E("finalized")]=new Map,we?.({ReactiveElement:$}),(D.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const q=globalThis,Y=r=>r,R=q.trustedTypes,Q=R?R.createPolicy("lit-html",{createHTML:r=>r}):void 0,oe="$lit$",f=`lit$${Math.random().toFixed(9).slice(2)}$`,ae="?"+f,ye=`<${ae}>`,y=document,z=()=>y.createComment(""),P=r=>r===null||typeof r!="object"&&typeof r!="function",Z=Array.isArray,$e=r=>Z(r)||typeof r?.[Symbol.iterator]=="function",I=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,X=/-->/g,ee=/>/g,b=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),te=/'/g,ie=/"/g,le=/^(?:script|style|textarea|title)$/i,Ae=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),M=Ae(1),A=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),ne=new WeakMap,w=y.createTreeWalker(y,129);function ce(r,e){if(!Z(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Q!==void 0?Q.createHTML(e):e}const xe=(r,e)=>{const t=r.length-1,i=[];let n,s=e===2?"<svg>":e===3?"<math>":"",o=k;for(let l=0;l<t;l++){const a=r[l];let h,u,c=-1,m=0;for(;m<a.length&&(o.lastIndex=m,u=o.exec(a),u!==null);)m=o.lastIndex,o===k?u[1]==="!--"?o=X:u[1]!==void 0?o=ee:u[2]!==void 0?(le.test(u[2])&&(n=RegExp("</"+u[2],"g")),o=b):u[3]!==void 0&&(o=b):o===b?u[0]===">"?(o=n??k,c=-1):u[1]===void 0?c=-2:(c=o.lastIndex-u[2].length,h=u[1],o=u[3]===void 0?b:u[3]==='"'?ie:te):o===ie||o===te?o=b:o===X||o===ee?o=k:(o=b,n=void 0);const v=o===b&&r[l+1].startsWith("/>")?" ":"";s+=o===k?a+ye:c>=0?(i.push(h),a.slice(0,c)+oe+a.slice(c)+f+v):a+f+(c===-2?l:v)}return[ce(r,s+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class C{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let s=0,o=0;const l=e.length-1,a=this.parts,[h,u]=xe(e,t);if(this.el=C.createElement(h,i),w.currentNode=this.el.content,t===2||t===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(n=w.nextNode())!==null&&a.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(const c of n.getAttributeNames())if(c.endsWith(oe)){const m=u[o++],v=n.getAttribute(c).split(f),T=/([.?@])?(.*)/.exec(m);a.push({type:1,index:s,name:T[2],strings:v,ctor:T[1]==="."?Ee:T[1]==="?"?Se:T[1]==="@"?ze:U}),n.removeAttribute(c)}else c.startsWith(f)&&(a.push({type:6,index:s}),n.removeAttribute(c));if(le.test(n.tagName)){const c=n.textContent.split(f),m=c.length-1;if(m>0){n.textContent=R?R.emptyScript:"";for(let v=0;v<m;v++)n.append(c[v],z()),w.nextNode(),a.push({type:2,index:++s});n.append(c[m],z())}}}else if(n.nodeType===8)if(n.data===ae)a.push({type:2,index:s});else{let c=-1;for(;(c=n.data.indexOf(f,c+1))!==-1;)a.push({type:7,index:s}),c+=f.length-1}s++}}static createElement(e,t){const i=y.createElement("template");return i.innerHTML=e,i}}function x(r,e,t=r,i){if(e===A)return e;let n=i!==void 0?t._$Co?.[i]:t._$Cl;const s=P(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),s===void 0?n=void 0:(n=new s(r),n._$AT(r,t,i)),i!==void 0?(t._$Co??=[])[i]=n:t._$Cl=n),n!==void 0&&(e=x(r,n._$AS(r,e.values),n,i)),e}class ke{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??y).importNode(t,!0);w.currentNode=n;let s=w.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new N(s,s.nextSibling,this,e):a.type===1?h=new a.ctor(s,a.name,a.strings,this,e):a.type===6&&(h=new Pe(s,this,e)),this._$AV.push(h),a=i[++l]}o!==a?.index&&(s=w.nextNode(),o++)}return w.currentNode=y,n}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class N{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=x(this,e,t),P(e)?e===d||e==null||e===""?(this._$AH!==d&&this._$AR(),this._$AH=d):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$e(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==d&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(y.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=C.createElement(ce(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const s=new ke(n,this),o=s.u(this.options);s.p(t),this.T(o),this._$AH=s}}_$AC(e){let t=ne.get(e.strings);return t===void 0&&ne.set(e.strings,t=new C(e)),t}k(e){Z(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const s of e)n===t.length?t.push(i=new N(this.O(z()),this.O(z()),this,this.options)):i=t[n],i._$AI(s),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=Y(e).nextSibling;Y(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class U{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,s){this.type=1,this._$AH=d,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=s,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(e,t=this,i,n){const s=this.strings;let o=!1;if(s===void 0)e=x(this,e,t,0),o=!P(e)||e!==this._$AH&&e!==A,o&&(this._$AH=e);else{const l=e;let a,h;for(e=s[0],a=0;a<s.length-1;a++)h=x(this,l[i+a],t,a),h===A&&(h=this._$AH[a]),o||=!P(h)||h!==this._$AH[a],h===d?e=d:e!==d&&(e+=(h??"")+s[a+1]),this._$AH[a]=h}o&&!n&&this.j(e)}j(e){e===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ee extends U{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===d?void 0:e}}class Se extends U{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==d)}}class ze extends U{constructor(e,t,i,n,s){super(e,t,i,n,s),this.type=5}_$AI(e,t=this){if((e=x(this,e,t,0)??d)===A)return;const i=this._$AH,n=e===d&&i!==d||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==d&&(i===d||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Pe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){x(this,e)}}const Ce=q.litHtmlPolyfillSupport;Ce?.(C,N),(q.litHtmlVersions??=[]).push("3.3.3");const Ne=(r,e,t)=>{const i=t?.renderBefore??e;let n=i._$litPart$;if(n===void 0){const s=t?.renderBefore??null;i._$litPart$=n=new N(e.insertBefore(z(),s),s,void 0,t??{})}return n._$AI(r),n};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=globalThis;class S extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ne(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}}S._$litElement$=!0,S.finalized=!0,j.litElementHydrateSupport?.({LitElement:S});const Te=j.litElementPolyfillSupport;Te?.({LitElement:S});(j.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Me=r=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(r,e)}):customElements.define(r,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const He={attribute:!0,type:String,converter:O,reflect:!1,hasChanged:G},Oe=(r=He,e,t)=>{const{kind:i,metadata:n}=t;let s=globalThis.litPropertyMetadata.get(n);if(s===void 0&&globalThis.litPropertyMetadata.set(n,s=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),s.set(t.name,r),i==="accessor"){const{name:o}=t;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,a,r,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,r,l),l}}}if(i==="setter"){const{name:o}=t;return function(l){const a=this[o];e.call(this,l),this.requestUpdate(o,a,r,!0,l)}}throw Error("Unsupported decorator location: "+i)};function _(r){return(e,t)=>typeof t=="object"?Oe(r,e,t):((i,n,s)=>{const o=n.hasOwnProperty(s);return n.constructor.createProperty(s,i),o?Object.getOwnPropertyDescriptor(n,s):void 0})(r,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function de(r){return _({...r,state:!0,attribute:!1})}const B={"nav.overview":"Overview","nav.watches":"Watches","nav.severities":"Severities","nav.channels":"Channels","ch.add":"Add channel","ch.empty":"No channels yet. Without one, problems only appear in Home Assistant itself.","ch.kind":"Type","ch.name":"Name","ch.enabled":"Active","ch.test":"Send test","ch.test_ok":"Test message sent.","ch.test_failed":"Failed: {error}","ch.test_missing":"Please fill in “{field}” first.","ch.templates":"Message text","ch.title_template":"Subject / title","ch.template":"Body","ch.template_hint":"Jinja2, like in Home Assistant. Available: watch, severity, count, problems (name, entity_id, state, reason, device, integration, url). Leave empty for the built-in text.","ch.confirm_delete":"Delete channel “{name}”?","ch.secret_kept":"Stored — type to replace","ch.used_by":"used by {count} severities","ch.unused":"not assigned to any severity","kind.ha_service":"Home Assistant service","kind.ha_service_hint":"Uses a notification that Home Assistant already has: a mobile app, a configured Telegram bot, the SMTP integration, a script.","kind.smtp":"E-mail (SMTP)","kind.smtp_hint":"Sends mail directly through your own mail server, independent of Home Assistant.","kind.telegram":"Telegram","kind.telegram_hint":"Posts into a chat through your own bot token.","kind.pushover":"Pushover","kind.pushover_hint":"Push notification through the Pushover service.","kind.ntfy":"ntfy","kind.ntfy_hint":"Publishes to an ntfy topic, on ntfy.sh or your own server.","field.service":"Service","field.target":"Target","field.data":"Additional data (JSON)","field.host":"Server","field.port":"Port","field.encryption":"Encryption","field.username":"User name","field.password":"Password","field.sender":"Sender address","field.recipients":"Recipients","field.token":"Token","field.chat_id":"Chat ID","field.user_key":"User key","field.device":"Device","field.priority":"Priority","field.sound":"Sound","field.server":"Server","field.topic":"Topic","field.tags":"Tags","sev.channels":"Channels","sev.escalation_channels":"Additional channels when escalating","editor.channels":"Extra channels (on top of the severity)","nav.settings":"Settings","nav.history":"History","hist.empty":"No incidents recorded yet.","hist.all_watches":"All watches","hist.all_severities":"All severities","hist.range":"Period","hist.days":"{count} days","hist.open_only":"Only unresolved","hist.ongoing":"ongoing","hist.resolved_after":"resolved after {duration}","hist.escalated":"escalated","hist.total":"{count} incidents","hist.more":"Load more","overview.healthy":"Everything is fine","overview.healthy_sub":"No active problems across {watched} monitored entities.","overview.problems":"{count} active problem","overview.problems_plural":"{count} active problems","overview.watching":"{watched} entities in {watches} watches","overview.paused":"Monitoring is paused","overview.paused_sub":"No alerts are raised while the monitoring switch is off.","overview.resume":"Resume monitoring","overview.pause":"Pause monitoring","overview.run_check":"Check now","overview.no_watches":"No watches yet","overview.no_watches_sub":"Start from a template — it takes about a minute.","overview.grace":"Grace period after restart","overview.grace_sub":"Right after a restart many entities are briefly unavailable, so nothing is reported yet. Remaining:","overview.internet_down":"No internet connection","overview.internet_sub":"While {entity} reports down, nothing is reported.","overview.current":"Current problems","overview.suppressed":"Held back","overview.pending":"Waiting for grace period","watches.add":"Add watch","watches.from_template":"From template","watches.empty":"No watches configured yet.","watches.covers_one":"covers 1 entity","watches.covers":"covers {count} entities","reason.unavailable_state":"state is “{state}”","reason.stale":"no report for {age} (limit {limit})","reason.numeric_below":"{value} (below {limit})","reason.numeric_above":"{value} (above {limit})","reason.numeric_below_attribute":"{attribute}: {value} (below {limit})","reason.numeric_above_attribute":"{attribute}: {value} (above {limit})","reason.numeric_outside":"{value} (outside {lower}–{upper})","reason.numeric_inside":"{value} (inside {lower}–{upper})","reason.numeric_outside_attribute":"{attribute}: {value} (outside {lower}–{upper})","reason.numeric_inside_attribute":"{attribute}: {value} (inside {lower}–{upper})","reason.state_match":"state “{state}” is one of {list}","reason.state_match_not":"state “{state}” is none of {list}","reason.state_duration":"has been “{state}” for {age} (limit {limit})","reason.entity_missing":"entity no longer exists","template.availability.name":"Availability","template.availability.description":"Alerts when a labelled entity becomes unavailable or unknown.","template.battery_low.name":"Battery low","template.battery_low.description":"Alerts below 25 %, clearing again above 40 %. Works with percentage battery sensors of any name, including Homematic's operating voltage level.","template.no_data.name":"No data","template.no_data.description":"Alerts when an entity has not reported for 24 hours. Measured against the last report, so devices that keep sending the same value do not trigger it.","template.security_devices.name":"Security devices","template.security_devices.description":"The same availability check at security severity: alerts immediately and ignores quiet hours.","template.missing_entities.name":"Missing entities","template.missing_entities.description":"Alerts when a watched entity disappears from Home Assistant.","editor.restart_grace_global":"Use the global grace period after a restart","watches.paused":"paused","watches.edit":"Edit","watches.delete":"Delete","watches.confirm_delete":"Delete watch “{name}”?","editor.new":"New watch","editor.name":"Name","editor.severity":"Severity","editor.enabled":"Enabled","editor.target":"What to watch","editor.labels":"Labels","editor.label_mode":"Label matching","editor.label_mode_any":"Any of them","editor.label_mode_all":"All of them","editor.areas":"Areas","editor.floors":"Floors","editor.domains":"Domains","editor.integrations":"Integrations","editor.entities":"Individual entities","editor.exclude_labels":"Exclude labels","editor.exclude_entities":"Exclude entities","editor.include_device_entities":"Include entities of labelled devices","editor.include_diagnostic":"Include diagnostic and configuration entities","editor.conditions":"What counts as a problem","editor.add_condition":"Add condition","editor.condition_or":"Each condition triggers on its own.","editor.advanced":"Advanced","editor.grace_period":"Wait before alerting","editor.restart_grace":"Grace period after restart (empty = global)","editor.overlap_mode":"If several watches cover an entity","editor.overlap_all":"All of them alert","editor.overlap_highest":"Only the highest severity","editor.notify_on_clear":"Notify when resolved","editor.suppress_by_parent":"Suppress when the parent device is down","editor.group_alerts":"Bundle into one message","editor.preview":"Currently covered","editor.preview_none":"This selection covers no entities.","editor.preview_count":"{count} entities","editor.save":"Save","editor.cancel":"Cancel","editor.no_conditions":"Add at least one condition.","editor.needs_name":"Give the watch a name.","cond.unavailable_state":"Unavailable or unknown","cond.stale":"No data for too long","cond.numeric_threshold":"Numeric threshold","cond.state_match":"State is (not)","cond.state_duration":"Stuck in a state","cond.entity_missing":"Entity disappeared","cond.states":"States that count as a problem","cond.time_basis":"Measure against","cond.basis_last_reported":"Last report (recommended)","cond.basis_last_updated":"Last update","cond.basis_last_changed":"Last change","cond.duration":"After","cond.source":"Read from","cond.source_state":"State","cond.source_attribute":"Attribute…","cond.operator":"Comparison","cond.op_lt":"below","cond.op_le":"at or below","cond.op_gt":"above","cond.op_ge":"at or above","cond.op_outside":"outside a range","cond.op_inside":"inside a range","cond.state_empty":"(empty)","cond.value":"Limit","cond.value2":"Upper limit","cond.recovery_value":"Clears again at","cond.recovery_hint":"Leave empty to clear at the same limit.","cond.target_state":"State","cond.negate":"Invert (alert when it is NOT one of these)","cond.remove":"Remove","sev.add":"Add severity","sev.name":"Name","sev.priority":"Priority","sev.priority_hint":"Higher wins when watches overlap.","sev.color":"Colour","color.primary":"Primary","color.accent":"Accent","color.red":"Red","color.pink":"Pink","color.purple":"Purple","color.deep-purple":"Deep purple","color.indigo":"Indigo","color.blue":"Blue","color.light-blue":"Light blue","color.cyan":"Cyan","color.teal":"Teal","color.green":"Green","color.light-green":"Light green","color.lime":"Lime","color.yellow":"Yellow","color.amber":"Amber","color.orange":"Orange","color.deep-orange":"Deep orange","color.brown":"Brown","color.grey":"Grey","color.blue-grey":"Blue grey","color.black":"Black","color.white":"White","sev.icon":"Icon","sev.ignore_quiet_hours":"Ignore quiet hours","sev.persistent_notification":"Create a notification in Home Assistant","sev.bundle_window":"Bundle for","sev.bundle_hint":"0 = send immediately.","sev.repeat_interval":"Repeat every","sev.repeat_hint":"0 = do not repeat.","sev.escalation_after":"Escalate after","sev.escalation_hint":"0 = never escalate. Counted from the first alert.","sev.in_use_one":"used by 1 watch","sev.in_use":"used by {count} watches","sev.confirm_delete":"Delete severity “{name}”?","settings.monitoring":"Monitoring active","settings.restart_grace":"Grace period after a Home Assistant restart","settings.restart_hint":"Right after a restart many entities are briefly unavailable.","settings.internet_entity":"Connectivity entity","settings.internet_hint":"While this entity is off, nothing is reported. Leave empty to disable.","settings.failed_integrations":"Report failed integrations","settings.scope_watched":"Only integrations with watched entities","settings.scope_all":"All integrations","settings.quiet_hours":"Quiet hours","settings.quiet_enabled":"Hold back alerts at night","settings.quiet_from":"From","settings.quiet_to":"To","settings.quiet_hint":"Held back alerts are sent afterwards if the problem still stands.","settings.add_window":"Add another period","settings.remove_window":"Remove","settings.window_wraps":"runs into the next day","settings.no_windows":"No periods yet — nothing is held back.","settings.window_no_days":"Pick at least one day, or this period does nothing.","settings.weekdays":"Days","settings.history_retention":"Keep history for","settings.panel_access":"Who sees StateGuard in the sidebar","settings.panel_admin":"Administrators only","settings.panel_all":"Everyone (read-only for non-administrators)","settings.panel_hint":"Changing anything always stays with administrators. The Lovelace card works for everyone regardless of this setting.","overview.read_only":"You are seeing the status only. Changes are made by an administrator.","settings.language":"Panel language","settings.language_auto":"Follow Home Assistant","settings.save":"Save settings","settings.saved":"Saved","unit.seconds":"seconds","unit.minutes":"minutes","unit.hours":"hours","unit.days":"days","link.entity":"Show entity","link.device":"Go to device","link.integration":"Go to integration","common.none":"None","common.search":"Search…","common.close":"Close","common.error":"Something went wrong: {message}","error.not_loaded":"StateGuard is not set up.","error.not_found":"This entry no longer exists.","error.in_use":"Still used by: {names}","day.0":"Mon","day.1":"Tue","day.2":"Wed","day.3":"Thu","day.4":"Fri","day.5":"Sat","day.6":"Sun","sup.monitoring_off":"monitoring off","sup.watch_disabled":"watch paused","sup.snoozed":"snoozed","sup.acknowledged":"acknowledged","sup.restart_grace":"restart grace period","sup.internet_down":"no internet","sup.integration_down":"integration down","sup.parent_down":"parent device down","sup.quiet_hours":"quiet hours"},Re={"nav.overview":"Übersicht","nav.watches":"Überwachungen","nav.severities":"Schweregrade","nav.channels":"Kanäle","ch.add":"Kanal anlegen","ch.empty":"Noch keine Kanäle. Ohne Kanal erscheinen Probleme nur in Home Assistant selbst.","ch.kind":"Art","ch.name":"Name","ch.enabled":"Aktiv","ch.test":"Test senden","ch.test_ok":"Testnachricht verschickt.","ch.test_failed":"Fehlgeschlagen: {error}","ch.test_missing":"Bitte zuerst „{field}“ ausfüllen.","ch.templates":"Nachrichtentext","ch.title_template":"Betreff / Titel","ch.template":"Inhalt","ch.template_hint":"Jinja2, wie in Home Assistant. Verfügbar: watch, severity, count, problems (name, entity_id, state, reason, device, integration, url). Leer lassen für den eingebauten Text.","ch.confirm_delete":"Kanal „{name}“ löschen?","ch.secret_kept":"Gespeichert — zum Ersetzen neu eingeben","ch.used_by":"von {count} Schweregraden genutzt","ch.unused":"keinem Schweregrad zugeordnet","kind.ha_service":"Home-Assistant-Dienst","kind.ha_service_hint":"Nutzt eine Benachrichtigung, die Home Assistant schon hat: eine Handy-App, einen eingerichteten Telegram-Bot, die SMTP-Integration, ein Skript.","kind.smtp":"E-Mail (SMTP)","kind.smtp_hint":"Verschickt Mail direkt über deinen eigenen Mailserver, unabhängig von Home Assistant.","kind.telegram":"Telegram","kind.telegram_hint":"Schreibt über einen eigenen Bot-Token in einen Chat.","kind.pushover":"Pushover","kind.pushover_hint":"Push-Nachricht über den Dienst Pushover.","kind.ntfy":"ntfy","kind.ntfy_hint":"Veröffentlicht in einem ntfy-Topic, auf ntfy.sh oder deinem eigenen Server.","field.service":"Dienst","field.target":"Ziel","field.data":"Zusätzliche Daten (JSON)","field.host":"Server","field.port":"Port","field.encryption":"Verschlüsselung","field.username":"Benutzername","field.password":"Passwort","field.sender":"Absenderadresse","field.recipients":"Empfänger","field.token":"Token","field.chat_id":"Chat-ID","field.user_key":"Benutzerschlüssel","field.device":"Gerät","field.priority":"Priorität","field.sound":"Ton","field.server":"Server","field.topic":"Topic","field.tags":"Tags","sev.channels":"Kanäle","sev.escalation_channels":"Zusätzliche Kanäle bei Eskalation","editor.channels":"Zusätzliche Kanäle (zusätzlich zum Schweregrad)","nav.settings":"Einstellungen","nav.history":"Historie","hist.empty":"Noch keine Vorfälle aufgezeichnet.","hist.all_watches":"Alle Überwachungen","hist.all_severities":"Alle Schweregrade","hist.range":"Zeitraum","hist.days":"{count} Tage","hist.open_only":"Nur ungelöste","hist.ongoing":"läuft noch","hist.resolved_after":"behoben nach {duration}","hist.escalated":"eskaliert","hist.total":"{count} Vorfälle","hist.more":"Mehr laden","overview.healthy":"Alles in Ordnung","overview.healthy_sub":"Keine aktiven Probleme bei {watched} überwachten Entitäten.","overview.problems":"{count} aktives Problem","overview.problems_plural":"{count} aktive Probleme","overview.watching":"{watched} Entitäten in {watches} Überwachungen","overview.paused":"Überwachung pausiert","overview.paused_sub":"Solange der Schalter aus ist, wird nichts gemeldet.","overview.resume":"Überwachung fortsetzen","overview.pause":"Überwachung pausieren","overview.run_check":"Jetzt prüfen","overview.no_watches":"Noch keine Überwachungen","overview.no_watches_sub":"Fang mit einer Vorlage an — dauert etwa eine Minute.","overview.grace":"Karenzzeit nach Neustart","overview.grace_sub":"Direkt nach einem Neustart sind viele Entitäten kurz nicht verfügbar, deshalb wird noch nichts gemeldet. Verbleibend:","overview.internet_down":"Keine Internetverbindung","overview.internet_sub":"Solange {entity} aus ist, wird nichts gemeldet.","overview.current":"Aktuelle Probleme","overview.suppressed":"Zurückgehalten","overview.pending":"Wartet auf Karenzzeit","watches.add":"Überwachung anlegen","watches.from_template":"Aus Vorlage","watches.empty":"Noch keine Überwachungen eingerichtet.","watches.covers_one":"erfasst 1 Entität","watches.covers":"erfasst {count} Entitäten","reason.unavailable_state":"Zustand ist „{state}“","reason.stale":"seit {age} keine Meldung (Grenze {limit})","reason.numeric_below":"{value} (unter {limit})","reason.numeric_above":"{value} (über {limit})","reason.numeric_below_attribute":"{attribute}: {value} (unter {limit})","reason.numeric_above_attribute":"{attribute}: {value} (über {limit})","reason.numeric_outside":"{value} (außerhalb {lower}–{upper})","reason.numeric_inside":"{value} (innerhalb {lower}–{upper})","reason.numeric_outside_attribute":"{attribute}: {value} (außerhalb {lower}–{upper})","reason.numeric_inside_attribute":"{attribute}: {value} (innerhalb {lower}–{upper})","reason.state_match":"Zustand „{state}“ ist einer von {list}","reason.state_match_not":"Zustand „{state}“ ist keiner von {list}","reason.state_duration":"seit {age} „{state}“ (Grenze {limit})","reason.entity_missing":"Entität existiert nicht mehr","template.availability.name":"Verfügbarkeit","template.availability.description":"Meldet, wenn eine gelabelte Entität nicht mehr verfügbar oder unbekannt ist.","template.battery_low.name":"Batterie schwach","template.battery_low.description":"Meldet ab 25 % und entwarnt wieder über 40 %. Funktioniert mit prozentualen Batteriesensoren jeder Benennung, auch mit dem Betriebsspannungspegel von Homematic.","template.no_data.name":"Keine Daten","template.no_data.description":"Meldet, wenn eine Entität 24 Stunden lang nichts gemeldet hat. Gemessen an der letzten Meldung, damit Geräte mit gleichbleibendem Wert nicht auslösen.","template.security_devices.name":"Sicherheitsgeräte","template.security_devices.description":"Dieselbe Verfügbarkeitsprüfung mit Schweregrad Sicherheit: meldet sofort und ignoriert Ruhezeiten.","template.missing_entities.name":"Verschwundene Entitäten","template.missing_entities.description":"Meldet, wenn eine überwachte Entität aus Home Assistant verschwindet.","editor.restart_grace_global":"Globale Karenzzeit nach Neustart verwenden","watches.paused":"pausiert","watches.edit":"Bearbeiten","watches.delete":"Löschen","watches.confirm_delete":"Überwachung „{name}“ löschen?","editor.new":"Neue Überwachung","editor.name":"Name","editor.severity":"Schweregrad","editor.enabled":"Aktiv","editor.target":"Was überwacht wird","editor.labels":"Labels","editor.label_mode":"Label-Verknüpfung","editor.label_mode_any":"Eines davon","editor.label_mode_all":"Alle davon","editor.areas":"Bereiche","editor.floors":"Etagen","editor.domains":"Domains","editor.integrations":"Integrationen","editor.entities":"Einzelne Entitäten","editor.exclude_labels":"Labels ausschließen","editor.exclude_entities":"Entitäten ausschließen","editor.include_device_entities":"Entitäten gelabelter Geräte einbeziehen","editor.include_diagnostic":"Diagnose- und Konfigurationsentitäten einbeziehen","editor.conditions":"Was als Problem gilt","editor.add_condition":"Bedingung hinzufügen","editor.condition_or":"Jede Bedingung löst für sich aus.","editor.advanced":"Erweitert","editor.grace_period":"Warten vor der Meldung","editor.restart_grace":"Karenzzeit nach Neustart (leer = global)","editor.overlap_mode":"Wenn mehrere Überwachungen dieselbe Entität erfassen","editor.overlap_all":"Alle melden","editor.overlap_highest":"Nur der höchste Schweregrad","editor.notify_on_clear":"Entwarnung senden","editor.suppress_by_parent":"Unterdrücken, wenn das Elterngerät ausgefallen ist","editor.group_alerts":"Zu einer Nachricht bündeln","editor.preview":"Aktuell erfasst","editor.preview_none":"Diese Auswahl erfasst keine Entitäten.","editor.preview_count":"{count} Entitäten","editor.save":"Speichern","editor.cancel":"Abbrechen","editor.no_conditions":"Mindestens eine Bedingung hinzufügen.","editor.needs_name":"Bitte einen Namen vergeben.","cond.unavailable_state":"Nicht verfügbar oder unbekannt","cond.stale":"Zu lange keine Daten","cond.numeric_threshold":"Zahlenwert-Schwelle","cond.state_match":"Zustand ist (nicht)","cond.state_duration":"Hängt in einem Zustand","cond.entity_missing":"Entität verschwunden","cond.states":"Zustände, die als Problem gelten","cond.time_basis":"Gemessen an","cond.basis_last_reported":"Letzter Meldung (empfohlen)","cond.basis_last_updated":"Letzter Aktualisierung","cond.basis_last_changed":"Letzter Wertänderung","cond.duration":"Nach","cond.source":"Gelesen aus","cond.source_state":"Zustand","cond.source_attribute":"Attribut…","cond.operator":"Vergleich","cond.op_lt":"unter","cond.op_le":"kleiner oder gleich","cond.op_gt":"über","cond.op_ge":"größer oder gleich","cond.op_outside":"außerhalb eines Bereichs","cond.op_inside":"innerhalb eines Bereichs","cond.state_empty":"(leer)","cond.value":"Grenzwert","cond.value2":"Obergrenze","cond.recovery_value":"Entwarnung ab","cond.recovery_hint":"Leer lassen, um beim selben Grenzwert zu entwarnen.","cond.target_state":"Zustand","cond.negate":"Umkehren (melden, wenn NICHT einer davon)","cond.remove":"Entfernen","sev.add":"Schweregrad anlegen","sev.name":"Name","sev.priority":"Priorität","sev.priority_hint":"Der höhere gewinnt bei Überschneidungen.","sev.color":"Farbe","color.primary":"Primär","color.accent":"Akzent","color.red":"Rot","color.pink":"Pink","color.purple":"Violett","color.deep-purple":"Dunkelviolett","color.indigo":"Indigo","color.blue":"Blau","color.light-blue":"Hellblau","color.cyan":"Türkis","color.teal":"Petrol","color.green":"Grün","color.light-green":"Hellgrün","color.lime":"Limette","color.yellow":"Gelb","color.amber":"Bernstein","color.orange":"Orange","color.deep-orange":"Dunkelorange","color.brown":"Braun","color.grey":"Grau","color.blue-grey":"Blaugrau","color.black":"Schwarz","color.white":"Weiß","sev.icon":"Symbol","sev.ignore_quiet_hours":"Ruhezeiten ignorieren","sev.persistent_notification":"Benachrichtigung in Home Assistant anlegen","sev.bundle_window":"Bündeln für","sev.bundle_hint":"0 = sofort senden.","sev.repeat_interval":"Wiederholen alle","sev.repeat_hint":"0 = nicht wiederholen.","sev.escalation_after":"Eskalieren nach","sev.escalation_hint":"0 = keine Eskalation. Gerechnet ab der Erstmeldung.","sev.in_use_one":"von 1 Überwachung genutzt","sev.in_use":"von {count} Überwachungen genutzt","sev.confirm_delete":"Schweregrad „{name}“ löschen?","settings.monitoring":"Überwachung aktiv","settings.restart_grace":"Karenzzeit nach einem Neustart von Home Assistant","settings.restart_hint":"Direkt nach einem Neustart sind viele Entitäten kurz nicht verfügbar.","settings.internet_entity":"Entität für die Internetverbindung","settings.internet_hint":"Solange diese Entität aus ist, wird nichts gemeldet. Leer lassen zum Abschalten.","settings.failed_integrations":"Ausgefallene Integrationen melden","settings.scope_watched":"Nur Integrationen mit überwachten Entitäten","settings.scope_all":"Alle Integrationen","settings.quiet_hours":"Ruhezeiten","settings.quiet_enabled":"Meldungen nachts zurückhalten","settings.quiet_from":"Von","settings.quiet_to":"Bis","settings.quiet_hint":"Zurückgehaltene Meldungen kommen danach, wenn das Problem noch besteht.","settings.add_window":"Weiteren Zeitraum hinzufügen","settings.remove_window":"Entfernen","settings.window_wraps":"geht in den nächsten Tag","settings.no_windows":"Noch keine Zeiträume — es wird nichts zurückgehalten.","settings.window_no_days":"Mindestens einen Tag wählen, sonst greift der Zeitraum nie.","settings.weekdays":"Tage","settings.history_retention":"Historie aufbewahren","settings.panel_access":"Wer StateGuard in der Seitenleiste sieht","settings.panel_admin":"Nur Administratoren","settings.panel_all":"Alle (für Nicht-Administratoren nur lesend)","settings.panel_hint":"Ändern dürfen immer nur Administratoren. Die Lovelace-Karte funktioniert unabhängig von dieser Einstellung für alle.","overview.read_only":"Du siehst nur den Status. Änderungen nimmt ein Administrator vor.","settings.language":"Sprache des Panels","settings.language_auto":"Wie Home Assistant","settings.save":"Einstellungen speichern","settings.saved":"Gespeichert","unit.seconds":"Sekunden","unit.minutes":"Minuten","unit.hours":"Stunden","unit.days":"Tage","link.entity":"Entität anzeigen","link.device":"Zum Gerät","link.integration":"Zur Integration","common.none":"Keine","common.search":"Suchen…","common.close":"Schließen","common.error":"Da ist etwas schiefgegangen: {message}","error.not_loaded":"StateGuard ist nicht eingerichtet.","error.not_found":"Dieser Eintrag existiert nicht mehr.","error.in_use":"Wird noch verwendet von: {names}","day.0":"Mo","day.1":"Di","day.2":"Mi","day.3":"Do","day.4":"Fr","day.5":"Sa","day.6":"So","sup.monitoring_off":"Überwachung aus","sup.watch_disabled":"Überwachung pausiert","sup.snoozed":"schlummert","sup.acknowledged":"quittiert","sup.restart_grace":"Karenzzeit nach Neustart","sup.internet_down":"kein Internet","sup.integration_down":"Integration ausgefallen","sup.parent_down":"Elterngerät ausgefallen","sup.quiet_hours":"Ruhezeit"},De={en:B,de:Re};function Ze(r){const e=(r||"en").split("-")[0],t=De[e]??B;return(i,n)=>{let s=t[i]??B[i]??i;if(n)for(const[o,l]of Object.entries(n))s=s.replace(new RegExp(`\\{${o}\\}`,"g"),String(l));return s}}const Ue=se`
  :host {
    --sg-gap: 16px;
    --sg-radius: var(--ha-card-border-radius, 12px);
    --sg-border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.25));
    display: block;
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, inherit);
  }

  .card {
    background: var(--card-background-color, #fff);
    border-radius: var(--sg-radius);
    box-shadow: var(--ha-card-box-shadow, 0 1px 3px rgba(0, 0, 0, 0.12));
    padding: var(--sg-gap);
    margin-bottom: var(--sg-gap);
  }

  .card.flush {
    padding: 0;
    overflow: hidden;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0 0 12px;
  }

  h3 {
    font-size: 1rem;
    font-weight: 500;
    margin: 0 0 8px;
  }

  p.hint {
    color: var(--secondary-text-color);
    font-size: 0.875rem;
    margin: 4px 0 0;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .row.wrap {
    flex-wrap: wrap;
  }

  .spacer {
    flex: 1;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--sg-gap);
  }

  label.field {
    display: block;
    margin-bottom: 14px;
  }

  label.field > span {
    display: block;
    font-size: 0.8125rem;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }

  input[type="text"],
  input[type="number"],
  input[type="time"],
  select {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 10px;
    border: var(--sg-border);
    border-radius: 8px;
    background: var(--secondary-background-color, transparent);
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.9375rem;
  }

  input:focus,
  select:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: -1px;
  }

  .checkbox {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 12px;
    cursor: pointer;
  }

  .checkbox input {
    margin: 2px 0 0;
    accent-color: var(--primary-color);
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .checkbox span {
    font-size: 0.9375rem;
    line-height: 1.35;
  }

  button {
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    border: none;
    border-radius: 8px;
    padding: 9px 16px;
    cursor: pointer;
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  button.secondary {
    background: transparent;
    color: var(--primary-color);
    border: var(--sg-border);
  }

  button.danger {
    background: transparent;
    color: var(--error-color, #db4437);
    border: var(--sg-border);
  }

  button.plain {
    background: transparent;
    color: var(--secondary-text-color);
    padding: 6px 8px;
  }

  button:hover {
    filter: brightness(1.08);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 999px;
    border: var(--sg-border);
    font-size: 0.8125rem;
    cursor: pointer;
    background: transparent;
    color: var(--primary-text-color);
    user-select: none;
  }

  .chip[data-selected="true"] {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  .chip ha-icon {
    --mdc-icon-size: 16px;
  }

  .list-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px var(--sg-gap);
    border-bottom: var(--sg-border);
  }

  .list-item:last-child {
    border-bottom: none;
  }

  .list-item .title {
    font-size: 0.9375rem;
    font-weight: 500;
  }

  .list-item .subtitle {
    font-size: 0.8125rem;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--secondary-text-color);
  }

  .empty ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.4;
    margin-bottom: 12px;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
    color: var(--secondary-text-color);
  }

  .suffixed {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .suffixed input {
    flex: 1;
    min-width: 0;
  }

  .suffix {
    color: var(--secondary-text-color);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .error {
    color: var(--error-color, #db4437);
    font-size: 0.875rem;
    margin: 8px 0 0;
  }
`,Ie={primary:"var(--primary-color, #03a9f4)",accent:"var(--accent-color, #ff9800)",red:"#f44336",pink:"#e91e63",purple:"#926bc7","deep-purple":"#6e41ab",indigo:"#3f51b5",blue:"#2196f3","light-blue":"#03a9f4",cyan:"#00bcd4",teal:"#009688",green:"#4caf50","light-green":"#8bc34a",lime:"#cddc39",yellow:"#ffeb3b",amber:"#ffc107",orange:"#ff9800","deep-orange":"#ff6f22",brown:"#795548",grey:"#9e9e9e","blue-grey":"#607d8b",black:"#000000",white:"#ffffff"};function je(r){return r?Ie[r]??"var(--secondary-text-color)":"var(--secondary-text-color)"}var Be=Object.defineProperty,Le=Object.getOwnPropertyDescriptor,g=(r,e,t,i)=>{for(var n=i>1?void 0:i?Le(e,t):e,s=r.length-1,o;s>=0;s--)(o=r[s])&&(n=(i?o(e,t,n):o(n))||n);return i&&n&&Be(e,t,n),n};function We(r){history.pushState(null,"",r),window.dispatchEvent(new CustomEvent("location-changed"))}let p=class extends S{constructor(){super(...arguments),this.entityId="",this.label="",this.deviceId=null,this.deviceName=null,this.integrationDomain=null,this.integrationTitle=null,this.open=!1,this.position={top:0,left:0},this.onOutside=r=>{r.composedPath().includes(this)||(this.open=!1)},this.onReflow=()=>{this.open&&(this.open=!1)}}connectedCallback(){super.connectedCallback(),window.addEventListener("click",this.onOutside,!0),window.addEventListener("scroll",this.onReflow,!0),window.addEventListener("resize",this.onReflow)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("click",this.onOutside,!0),window.removeEventListener("scroll",this.onReflow,!0),window.removeEventListener("resize",this.onReflow)}async toggle(r){if(r.stopPropagation(),this.open){this.open=!1;return}const e=r.currentTarget.getBoundingClientRect();this.position={top:e.bottom+4,left:e.left},this.open=!0,await this.updateComplete;const t=this.renderRoot.querySelector(".menu");if(!t)return;const i=t.getBoundingClientRect(),n=window.innerWidth||document.documentElement.clientWidth,s=window.innerHeight||document.documentElement.clientHeight;if(!n||!s)return;const o=8;let{top:l,left:a}=this.position;a+i.width>n-o&&(a=Math.max(o,n-i.width-o)),l+i.height>s-o&&(l=Math.max(o,e.top-i.height-4)),this.position={top:l,left:a}}showMoreInfo(){this.open=!1,this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this.entityId},bubbles:!0,composed:!0}))}go(r){this.open=!1,We(r)}render(){return M`
      <button class="trigger" @click=${this.toggle}>
        ${this.label||this.entityId}
      </button>
      ${this.open?M`
            <div
              class="menu"
              style=${`top:${this.position.top}px;left:${this.position.left}px`}
            >
              <button class="item" @click=${this.showMoreInfo}>
                <ha-icon icon="mdi:information-outline"></ha-icon>
                ${this.localize("link.entity")}
                <span class="sub">${this.entityId}</span>
              </button>
              ${this.deviceId?M`
                    <button
                      class="item"
                      @click=${()=>this.go(`/config/devices/device/${this.deviceId}`)}
                    >
                      <ha-icon icon="mdi:devices"></ha-icon>
                      ${this.localize("link.device")}
                      <span class="sub">${this.deviceName??""}</span>
                    </button>
                  `:d}
              ${this.integrationDomain?M`
                    <button
                      class="item"
                      @click=${()=>this.go(`/config/integrations/integration/${this.integrationDomain}`)}
                    >
                      <ha-icon icon="mdi:puzzle-outline"></ha-icon>
                      ${this.localize("link.integration")}
                      <span class="sub">${this.integrationTitle??""}</span>
                    </button>
                  `:d}
            </div>
          `:d}
    `}};p.styles=[Ue,se`
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
    `];g([_()],p.prototype,"entityId",2);g([_()],p.prototype,"label",2);g([_()],p.prototype,"deviceId",2);g([_()],p.prototype,"deviceName",2);g([_()],p.prototype,"integrationDomain",2);g([_()],p.prototype,"integrationTitle",2);g([_({attribute:!1})],p.prototype,"localize",2);g([de()],p.prototype,"open",2);g([de()],p.prototype,"position",2);p=g([Me("sg-entity-menu")],p);export{d as A,Ie as C,S as a,M as b,je as c,se as i,Ze as l,_ as n,de as r,Ue as s,Me as t};
