/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const D=globalThis,V=D.ShadowRoot&&(D.ShadyCSS===void 0||D.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),Q=new WeakMap;let de=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(V&&e===void 0){const i=t!==void 0&&t.length===1;i&&(e=Q.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&Q.set(t,e))}return e}toString(){return this.cssText}};const ye=s=>new de(typeof s=="string"?s:s+"",void 0,G),he=(s,...e)=>{const t=s.length===1?s[0]:e.reduce((i,o,r)=>i+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+s[r+1],s[0]);return new de(t,s,G)},be=(s,e)=>{if(V)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const i=document.createElement("style"),o=D.litNonce;o!==void 0&&i.setAttribute("nonce",o),i.textContent=t.cssText,s.appendChild(i)}},X=V?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return ye(t)})(s):s;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:we,defineProperty:$e,getOwnPropertyDescriptor:Ae,getOwnPropertyNames:xe,getOwnPropertySymbols:Ee,getPrototypeOf:Se}=Object,B=globalThis,ee=B.trustedTypes,ke=ee?ee.emptyScript:"",Pe=B.reactiveElementPolyfillSupport,R=(s,e)=>s,I={toAttribute(s,e){switch(e){case Boolean:s=s?ke:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},F=(s,e)=>!we(s,e),te={attribute:!0,type:String,converter:I,reflect:!1,useDefault:!1,hasChanged:F};Symbol.metadata??=Symbol("metadata"),B.litPropertyMetadata??=new WeakMap;let S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=te){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(e,i,t);o!==void 0&&$e(this.prototype,e,o)}}static getPropertyDescriptor(e,t,i){const{get:o,set:r}=Ae(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:o,set(n){const l=o?.call(this);r?.call(this,n),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??te}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;const e=Se(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){const t=this.properties,i=[...xe(t),...Ee(t)];for(const o of i)this.createProperty(o,t[o])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[i,o]of t)this.elementProperties.set(i,o)}this._$Eh=new Map;for(const[t,i]of this.elementProperties){const o=this._$Eu(t,i);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const o of i)t.unshift(X(o))}else e!==void 0&&t.push(X(e));return t}static _$Eu(e,t){const i=t.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return be(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,i);if(o!==void 0&&i.reflect===!0){const r=(i.converter?.toAttribute!==void 0?i.converter:I).toAttribute(t,i.type);this._$Em=e,r==null?this.removeAttribute(o):this.setAttribute(o,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,o=i._$Eh.get(e);if(o!==void 0&&this._$Em!==o){const r=i.getPropertyOptions(o),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:I;this._$Em=o;const l=n.fromAttribute(t,r.type);this[o]=l??this._$Ej?.get(o)??l,this._$Em=null}}requestUpdate(e,t,i,o=!1,r){if(e!==void 0){const n=this.constructor;if(o===!1&&(r=this[e]),i??=n.getPropertyOptions(e),!((i.hasChanged??F)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:o,wrapped:r},n){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),r!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[o,r]of this._$Ep)this[o]=r;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[o,r]of i){const{wrapped:n}=r,l=this[o];n!==!0||this._$AL.has(o)||l===void 0||this.C(o,void 0,r,l)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(t)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[R("elementProperties")]=new Map,S[R("finalized")]=new Map,Pe?.({ReactiveElement:S}),(B.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const J=globalThis,ie=s=>s,j=J.trustedTypes,se=j?j.createPolicy("lit-html",{createHTML:s=>s}):void 0,pe="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,ue="?"+y,Ce=`<${ue}>`,x=document,L=()=>x.createComment(""),N=s=>s===null||typeof s!="object"&&typeof s!="function",K=Array.isArray,Oe=s=>K(s)||typeof s?.[Symbol.iterator]=="function",q=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,oe=/-->/g,re=/>/g,$=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ne=/'/g,ae=/"/g,me=/^(?:script|style|textarea|title)$/i,Te=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),b=Te(1),P=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),le=new WeakMap,A=x.createTreeWalker(x,129);function ge(s,e){if(!K(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return se!==void 0?se.createHTML(e):e}const Re=(s,e)=>{const t=s.length-1,i=[];let o,r=e===2?"<svg>":e===3?"<math>":"",n=T;for(let l=0;l<t;l++){const a=s[l];let d,h,c=-1,u=0;for(;u<a.length&&(n.lastIndex=u,h=n.exec(a),h!==null);)u=n.lastIndex,n===T?h[1]==="!--"?n=oe:h[1]!==void 0?n=re:h[2]!==void 0?(me.test(h[2])&&(o=RegExp("</"+h[2],"g")),n=$):h[3]!==void 0&&(n=$):n===$?h[0]===">"?(n=o??T,c=-1):h[1]===void 0?c=-2:(c=n.lastIndex-h[2].length,d=h[1],n=h[3]===void 0?$:h[3]==='"'?ae:ne):n===ae||n===ne?n=$:n===oe||n===re?n=T:(n=$,o=void 0);const f=n===$&&s[l+1].startsWith("/>")?" ":"";r+=n===T?a+Ce:c>=0?(i.push(d),a.slice(0,c)+pe+a.slice(c)+y+f):a+y+(c===-2?l:f)}return[ge(s,r+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class H{constructor({strings:e,_$litType$:t},i){let o;this.parts=[];let r=0,n=0;const l=e.length-1,a=this.parts,[d,h]=Re(e,t);if(this.el=H.createElement(d,i),A.currentNode=this.el.content,t===2||t===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(o=A.nextNode())!==null&&a.length<l;){if(o.nodeType===1){if(o.hasAttributes())for(const c of o.getAttributeNames())if(c.endsWith(pe)){const u=h[n++],f=o.getAttribute(c).split(y),E=/([.?@])?(.*)/.exec(u);a.push({type:1,index:r,name:E[2],strings:f,ctor:E[1]==="."?Ne:E[1]==="?"?He:E[1]==="@"?Ue:W}),o.removeAttribute(c)}else c.startsWith(y)&&(a.push({type:6,index:r}),o.removeAttribute(c));if(me.test(o.tagName)){const c=o.textContent.split(y),u=c.length-1;if(u>0){o.textContent=j?j.emptyScript:"";for(let f=0;f<u;f++)o.append(c[f],L()),A.nextNode(),a.push({type:2,index:++r});o.append(c[u],L())}}}else if(o.nodeType===8)if(o.data===ue)a.push({type:2,index:r});else{let c=-1;for(;(c=o.data.indexOf(y,c+1))!==-1;)a.push({type:7,index:r}),c+=y.length-1}r++}}static createElement(e,t){const i=x.createElement("template");return i.innerHTML=e,i}}function C(s,e,t=s,i){if(e===P)return e;let o=i!==void 0?t._$Co?.[i]:t._$Cl;const r=N(e)?void 0:e._$litDirective$;return o?.constructor!==r&&(o?._$AO?.(!1),r===void 0?o=void 0:(o=new r(s),o._$AT(s,t,i)),i!==void 0?(t._$Co??=[])[i]=o:t._$Cl=o),o!==void 0&&(e=C(s,o._$AS(s,e.values),o,i)),e}class Le{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,o=(e?.creationScope??x).importNode(t,!0);A.currentNode=o;let r=A.nextNode(),n=0,l=0,a=i[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new M(r,r.nextSibling,this,e):a.type===1?d=new a.ctor(r,a.name,a.strings,this,e):a.type===6&&(d=new Me(r,this,e)),this._$AV.push(d),a=i[++l]}n!==a?.index&&(r=A.nextNode(),n++)}return A.currentNode=x,o}p(e){let t=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,o){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=C(this,e,t),N(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==P&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Oe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,o=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=H.createElement(ge(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(t);else{const r=new Le(o,this),n=r.u(this.options);r.p(t),this.T(n),this._$AH=r}}_$AC(e){let t=le.get(e.strings);return t===void 0&&le.set(e.strings,t=new H(e)),t}k(e){K(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,o=0;for(const r of e)o===t.length?t.push(i=new M(this.O(L()),this.O(L()),this,this.options)):i=t[o],i._$AI(r),o++;o<t.length&&(this._$AR(i&&i._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const i=ie(e).nextSibling;ie(e).remove(),e=i}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class W{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,o,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=p}_$AI(e,t=this,i,o){const r=this.strings;let n=!1;if(r===void 0)e=C(this,e,t,0),n=!N(e)||e!==this._$AH&&e!==P,n&&(this._$AH=e);else{const l=e;let a,d;for(e=r[0],a=0;a<r.length-1;a++)d=C(this,l[i+a],t,a),d===P&&(d=this._$AH[a]),n||=!N(d)||d!==this._$AH[a],d===p?e=p:e!==p&&(e+=(d??"")+r[a+1]),this._$AH[a]=d}n&&!o&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ne extends W{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class He extends W{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class Ue extends W{constructor(e,t,i,o,r){super(e,t,i,o,r),this.type=5}_$AI(e,t=this){if((e=C(this,e,t,0)??p)===P)return;const i=this._$AH,o=e===p&&i!==p||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==p&&(i===p||o);o&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Me{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){C(this,e)}}const ze=J.litHtmlPolyfillSupport;ze?.(H,M),(J.litHtmlVersions??=[]).push("3.3.3");const De=(s,e,t)=>{const i=t?.renderBefore??e;let o=i._$litPart$;if(o===void 0){const r=t?.renderBefore??null;i._$litPart$=o=new M(e.insertBefore(L(),r),r,void 0,t??{})}return o._$AI(s),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Z=globalThis;class k extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=De(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return P}}k._$litElement$=!0,k.finalized=!0,Z.litElementHydrateSupport?.({LitElement:k});const Ie=Z.litElementPolyfillSupport;Ie?.({LitElement:k});(Z.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const fe=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const je={attribute:!0,type:String,converter:I,reflect:!1,hasChanged:F},Be=(s=je,e,t)=>{const{kind:i,metadata:o}=t;let r=globalThis.litPropertyMetadata.get(o);if(r===void 0&&globalThis.litPropertyMetadata.set(o,r=new Map),i==="setter"&&((s=Object.create(s)).wrapped=!0),r.set(t.name,s),i==="accessor"){const{name:n}=t;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(n,a,s,!0,l)},init(l){return l!==void 0&&this.C(n,void 0,s,l),l}}}if(i==="setter"){const{name:n}=t;return function(l){const a=this[n];e.call(this,l),this.requestUpdate(n,a,s,!0,l)}}throw Error("Unsupported decorator location: "+i)};function g(s){return(e,t)=>typeof t=="object"?Be(s,e,t):((i,o,r)=>{const n=o.hasOwnProperty(r);return o.constructor.createProperty(r,i),n?Object.getOwnPropertyDescriptor(o,r):void 0})(s,e,t)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Y(s){return g({...s,state:!0,attribute:!1})}const We="modulepreload",qe=function(s){return"/"+s},ce={},v=function(e,t,i){let o=Promise.resolve();if(t&&t.length>0){let n=function(d){return Promise.all(d.map(h=>Promise.resolve(h).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),a=l?.nonce||l?.getAttribute("nonce");o=n(t.map(d=>{if(d=qe(d),d in ce)return;ce[d]=!0;const h=d.endsWith(".css"),c=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${c}`))return;const u=document.createElement("link");if(u.rel=h?"stylesheet":We,h||(u.as="script"),u.crossOrigin="",u.href=d,a&&u.setAttribute("nonce",a),document.head.appendChild(u),h)return new Promise((f,E)=>{u.addEventListener("load",f),u.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${d}`)))})}))}function r(n){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=n,window.dispatchEvent(l),!l.defaultPrevented)throw n}return o.then(n=>{for(const l of n||[])l.status==="rejected"&&r(l.reason);return e().catch(r)})},U={"nav.overview":"Overview","card.title":"Heading","card.title_hint":"Leave empty for “StateGuard”.","card.hide_when_healthy":"Hide the card when nothing is wrong","card.show_suppressed":"Also show held-back problems","card.show_suppressed_hint":"Snoozed, acknowledged, or waiting out a grace period.","card.max":"Most rows to show","card.max_hint":"Empty means no limit.","card.severities":"Only these severities","card.watches":"Only these watches","card.filter_hint":"Nothing selected means everything is shown.","card.no_watches":"No watches configured yet.","nav.watches":"Watches","nav.severities":"Severities","nav.channels":"Channels","ch.add":"Add channel","ch.empty":"No channels yet. Without one, problems only appear in Home Assistant itself.","ch.kind":"Type","ch.name":"Name","ch.enabled":"Active","ch.test":"Send test","ch.test_ok":"Test message sent.","ch.test_failed":"Failed: {error}","ch.test_missing":"Please fill in “{field}” first.","ch.templates":"Message text","ch.title_template":"Subject / title","ch.template":"Body","ch.template_hint":"Jinja2, like in Home Assistant. Available: watch, severity, count, problems (name, entity_id, state, reason, device, integration, url). Leave empty for the built-in text.","ch.confirm_delete":"Delete channel “{name}”?","ch.secret_kept":"Stored — type to replace","ch.used_by":"used by {count} severities","ch.unused":"not assigned to any severity","kind.ha_service":"Home Assistant service","kind.ha_service_hint":"Uses a notification that Home Assistant already has: a mobile app, a configured Telegram bot, the SMTP integration, a script.","kind.smtp":"E-mail (SMTP)","kind.smtp_hint":"Sends mail directly through your own mail server, independent of Home Assistant.","kind.telegram":"Telegram","kind.telegram_hint":"Posts into a chat through your own bot token.","kind.pushover":"Pushover","kind.pushover_hint":"Push notification through the Pushover service.","kind.ntfy":"ntfy","kind.ntfy_hint":"Publishes to an ntfy topic, on ntfy.sh or your own server.","field.service":"Service","field.target":"Target","field.data":"Additional data (JSON)","field.host":"Server","field.port":"Port","field.encryption":"Encryption","field.username":"User name","field.password":"Password","field.sender":"Sender address","field.recipients":"Recipients","field.token":"Token","field.chat_id":"Chat ID","field.user_key":"User key","field.device":"Device","field.priority":"Priority","field.sound":"Sound","field.server":"Server","field.topic":"Topic","field.tags":"Tags","sev.channels":"Channels","sev.escalation_channels":"Additional channels when escalating","editor.channels":"Extra channels (on top of the severity)","nav.settings":"Settings","nav.history":"History","hist.empty":"No incidents recorded yet.","hist.all_watches":"All watches","hist.all_severities":"All severities","hist.range":"Period","hist.days":"{count} days","hist.open_only":"Only unresolved","hist.ongoing":"ongoing","hist.resolved_after":"resolved after {duration}","hist.escalated":"escalated","hist.total":"{count} incidents","hist.more":"Load more","overview.healthy":"Everything is fine","overview.healthy_sub":"No active problems across {watched} monitored entities.","overview.problems":"{count} active problem","overview.problems_plural":"{count} active problems","overview.watching":"{watched} entities in {watches} watches","overview.paused":"Monitoring is paused","overview.paused_sub":"No alerts are raised while the monitoring switch is off.","overview.resume":"Resume monitoring","overview.pause":"Pause monitoring","overview.run_check":"Check now","overview.no_watches":"No watches yet","overview.no_watches_sub":"Start from a template — it takes about a minute.","overview.grace":"Grace period after restart","overview.grace_sub":"Right after a restart many entities are briefly unavailable, so nothing is reported yet. Remaining:","overview.internet_down":"No internet connection","overview.internet_sub":"While {entity} reports down, nothing is reported.","overview.current":"Current problems","overview.suppressed":"Held back","overview.pending":"Waiting for grace period","watches.add":"Add watch","watches.from_template":"From template","watches.empty":"No watches configured yet.","watches.covers_one":"covers 1 entity","watches.covers":"covers {count} entities","reason.unavailable_state":"state is “{state}”","reason.stale":"no report for {age} (limit {limit})","reason.numeric_below":"{value} (below {limit})","reason.numeric_above":"{value} (above {limit})","reason.numeric_below_attribute":"{attribute}: {value} (below {limit})","reason.numeric_above_attribute":"{attribute}: {value} (above {limit})","reason.numeric_outside":"{value} (outside {lower}–{upper})","reason.numeric_inside":"{value} (inside {lower}–{upper})","reason.numeric_outside_attribute":"{attribute}: {value} (outside {lower}–{upper})","reason.numeric_inside_attribute":"{attribute}: {value} (inside {lower}–{upper})","reason.state_match":"state “{state}” is one of {list}","reason.state_match_not":"state “{state}” is none of {list}","reason.state_duration":"has been “{state}” for {age} (limit {limit})","reason.entity_missing":"entity no longer exists","template.availability.name":"Availability","template.availability.description":"Alerts when a labelled entity becomes unavailable or unknown.","template.battery_low.name":"Battery low","template.battery_low.description":"Alerts below 25 %, clearing again above 40 %. Works with percentage battery sensors of any name, including Homematic's operating voltage level.","template.no_data.name":"No data","template.no_data.description":"Alerts when an entity has not reported for 24 hours. Measured against the last report, so devices that keep sending the same value do not trigger it.","template.security_devices.name":"Security devices","template.security_devices.description":"The same availability check at security severity: alerts immediately and ignores quiet hours.","template.missing_entities.name":"Missing entities","template.missing_entities.description":"Alerts when a watched entity disappears from Home Assistant.","editor.restart_grace_global":"Use the global grace period after a restart","watches.paused":"paused","watches.show_entities":"Show the entities this covers","watches.hide_entities":"Hide the list","watches.entities_none":"This watch currently covers no entities.","watches.entity_ok":"fine","watches.loading":"Loading…","watches.edit":"Edit","watches.delete":"Delete","watches.confirm_delete":"Delete watch “{name}”?","editor.new":"New watch","editor.name":"Name","editor.severity":"Severity","editor.enabled":"Enabled","editor.target":"What to watch","editor.labels":"Labels","editor.label_mode":"Label matching","editor.label_mode_any":"Any of them","editor.label_mode_all":"All of them","editor.areas":"Areas","editor.floors":"Floors","editor.domains":"Domains","editor.integrations":"Integrations","editor.entities":"Individual entities","editor.exclude_labels":"Exclude labels","editor.exclude_entities":"Exclude entities","editor.include_device_entities":"Include entities of labelled devices","editor.include_diagnostic":"Include diagnostic and configuration entities","editor.conditions":"What counts as a problem","editor.add_condition":"Add condition","editor.condition_or":"Each condition triggers on its own.","editor.advanced":"Advanced","editor.grace_period":"Wait before alerting","editor.restart_grace":"Grace period after restart (empty = global)","editor.overlap_mode":"If several watches cover an entity","editor.overlap_all":"All of them alert","editor.overlap_highest":"Only the highest severity","editor.notify_on_clear":"Notify when resolved","editor.suppress_by_parent":"Suppress when the parent device is down","editor.group_alerts":"Bundle into one message","editor.preview":"Currently covered","editor.preview_none":"This selection covers no entities.","editor.preview_count":"{count} entities","editor.save":"Save","editor.cancel":"Cancel","editor.no_conditions":"Add at least one condition.","editor.needs_name":"Give the watch a name.","cond.unavailable_state":"Unavailable or unknown","cond.stale":"No data for too long","cond.numeric_threshold":"Numeric threshold","cond.state_match":"State is (not)","cond.state_duration":"Stuck in a state","cond.entity_missing":"Entity disappeared","cond.states":"States that count as a problem","cond.time_basis":"Measure against","cond.basis_last_reported":"Last report (recommended)","cond.basis_last_updated":"Last update","cond.basis_last_changed":"Last change","cond.duration":"After","cond.source":"Read from","cond.source_state":"State","cond.source_attribute":"Attribute…","cond.operator":"Comparison","cond.op_lt":"below","cond.op_le":"at or below","cond.op_gt":"above","cond.op_ge":"at or above","cond.op_outside":"outside a range","cond.op_inside":"inside a range","cond.state_empty":"(empty)","cond.value":"Limit","cond.value2":"Upper limit","cond.recovery_value":"Clears again at","cond.recovery_hint":"Leave empty to clear at the same limit.","cond.target_state":"State","cond.negate":"Invert (alert when it is NOT one of these)","cond.remove":"Remove","sev.add":"Add severity","sev.name":"Name","sev.priority":"Priority","sev.priority_hint":"Higher wins when watches overlap.","sev.color":"Colour","color.primary":"Primary","color.accent":"Accent","color.red":"Red","color.pink":"Pink","color.purple":"Purple","color.deep-purple":"Deep purple","color.indigo":"Indigo","color.blue":"Blue","color.light-blue":"Light blue","color.cyan":"Cyan","color.teal":"Teal","color.green":"Green","color.light-green":"Light green","color.lime":"Lime","color.yellow":"Yellow","color.amber":"Amber","color.orange":"Orange","color.deep-orange":"Deep orange","color.brown":"Brown","color.grey":"Grey","color.blue-grey":"Blue grey","color.black":"Black","color.white":"White","sev.icon":"Icon","sev.ignore_quiet_hours":"Ignore quiet hours","sev.persistent_notification":"Create a notification in Home Assistant","sev.bundle_window":"Bundle for","sev.bundle_hint":"0 = send immediately.","sev.repeat_interval":"Repeat every","sev.repeat_hint":"0 = do not repeat.","sev.escalation_after":"Escalate after","sev.escalation_hint":"0 = never escalate. Counted from the first alert.","sev.in_use_one":"used by 1 watch","sev.in_use":"used by {count} watches","sev.confirm_delete":"Delete severity “{name}”?","settings.monitoring":"Monitoring active","settings.restart_grace":"Grace period after a Home Assistant restart","settings.restart_hint":"Right after a restart many entities are briefly unavailable.","settings.internet_entity":"Connectivity entity","settings.internet_hint":"While this entity is off, nothing is reported. Leave empty to disable.","settings.failed_integrations":"Report failed integrations","settings.scope_watched":"Only integrations with watched entities","settings.scope_all":"All integrations","settings.quiet_hours":"Quiet hours","settings.quiet_enabled":"Hold back alerts at night","settings.quiet_from":"From","settings.quiet_to":"To","settings.quiet_hint":"Held back alerts are sent afterwards if the problem still stands.","settings.add_window":"Add another period","settings.remove_window":"Remove","settings.window_wraps":"runs into the next day","settings.no_windows":"No periods yet — nothing is held back.","settings.window_no_days":"Pick at least one day, or this period does nothing.","settings.weekdays":"Days","settings.history_retention":"Keep history for","settings.panel_access":"Who sees StateGuard in the sidebar","settings.panel_admin":"Administrators only","settings.panel_all":"Everyone (read-only for non-administrators)","settings.panel_hint":"Changing anything always stays with administrators. The Lovelace card works for everyone regardless of this setting.","overview.read_only":"You are seeing the status only. Changes are made by an administrator.","settings.language":"Panel language","settings.language_auto":"Follow Home Assistant","settings.save":"Save settings","settings.saved":"Saved","unit.seconds":"seconds","unit.minutes":"minutes","unit.hours":"hours","unit.days":"days","link.entity":"Show entity","link.device":"Go to device","link.integration":"Go to integration","common.none":"None","common.search":"Search…","common.close":"Close","common.error":"Something went wrong: {message}","error.not_loaded":"StateGuard is not set up.","error.not_found":"This entry no longer exists.","error.in_use":"Still used by: {names}","day.0":"Mon","day.1":"Tue","day.2":"Wed","day.3":"Thu","day.4":"Fri","day.5":"Sat","day.6":"Sun","sup.monitoring_off":"monitoring off","sup.watch_disabled":"watch paused","sup.snoozed":"snoozed","sup.acknowledged":"acknowledged","sup.restart_grace":"restart grace period","sup.internet_down":"no internet","sup.integration_down":"integration down","sup.parent_down":"parent device down","sup.quiet_hours":"quiet hours"},ve={cs:()=>v(()=>import("./stateguard-lang-cs.js"),[]).then(s=>s.cs),da:()=>v(()=>import("./stateguard-lang-da.js"),[]).then(s=>s.da),de:()=>v(()=>import("./stateguard-lang-de.js"),[]).then(s=>s.de),es:()=>v(()=>import("./stateguard-lang-es.js"),[]).then(s=>s.es),fr:()=>v(()=>import("./stateguard-lang-fr.js"),[]).then(s=>s.fr),it:()=>v(()=>import("./stateguard-lang-it.js"),[]).then(s=>s.it),nl:()=>v(()=>import("./stateguard-lang-nl.js"),[]).then(s=>s.nl),pl:()=>v(()=>import("./stateguard-lang-pl.js"),[]).then(s=>s.pl),pt:()=>v(()=>import("./stateguard-lang-pt.js"),[]).then(s=>s.pt),sv:()=>v(()=>import("./stateguard-lang-sv.js"),[]).then(s=>s.sv)},it=["en",...Object.keys(ve)].sort(),z={en:U};function Ve(s){return(s||"en").split("-")[0].toLowerCase()}async function st(s){const e=Ve(s);if(z[e])return z[e];const t=ve[e];if(!t)return U;try{return z[e]=await t(),z[e]}catch{return U}}function Ge(s){return(e,t)=>{let i=s[e]??U[e]??e;if(t)for(const[o,r]of Object.entries(t))i=i.replace(new RegExp(`\\{${o}\\}`,"g"),String(r));return i}}const ot=Ge(U),_e=he`
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
`,Fe={primary:"var(--primary-color, #03a9f4)",accent:"var(--accent-color, #ff9800)",red:"#f44336",pink:"#e91e63",purple:"#926bc7","deep-purple":"#6e41ab",indigo:"#3f51b5",blue:"#2196f3","light-blue":"#03a9f4",cyan:"#00bcd4",teal:"#009688",green:"#4caf50","light-green":"#8bc34a",lime:"#cddc39",yellow:"#ffeb3b",amber:"#ffc107",orange:"#ff9800","deep-orange":"#ff6f22",brown:"#795548",grey:"#9e9e9e","blue-grey":"#607d8b",black:"#000000",white:"#ffffff"};function Je(s){return s?Fe[s]??"var(--secondary-text-color)":"var(--secondary-text-color)"}var Ke=Object.defineProperty,Ze=Object.getOwnPropertyDescriptor,_=(s,e,t,i)=>{for(var o=i>1?void 0:i?Ze(e,t):e,r=s.length-1,n;r>=0;r--)(n=s[r])&&(o=(i?n(e,t,o):n(o))||o);return i&&o&&Ke(e,t,o),o};function Ye(s){history.pushState(null,"",s),window.dispatchEvent(new CustomEvent("location-changed"))}let m=class extends k{constructor(){super(...arguments),this.entityId="",this.label="",this.deviceId=null,this.deviceName=null,this.integrationDomain=null,this.integrationTitle=null,this.open=!1,this.position={top:0,left:0},this.onOutside=s=>{s.composedPath().includes(this)||(this.open=!1)},this.onReflow=()=>{this.open&&(this.open=!1)}}connectedCallback(){super.connectedCallback(),window.addEventListener("click",this.onOutside,!0),window.addEventListener("scroll",this.onReflow,!0),window.addEventListener("resize",this.onReflow)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("click",this.onOutside,!0),window.removeEventListener("scroll",this.onReflow,!0),window.removeEventListener("resize",this.onReflow)}async toggle(s){if(s.stopPropagation(),this.open){this.open=!1;return}const e=s.currentTarget.getBoundingClientRect();this.position={top:e.bottom+4,left:e.left},this.open=!0,await this.updateComplete;const t=this.renderRoot.querySelector(".menu");if(!t)return;const i=t.getBoundingClientRect(),o=window.innerWidth||document.documentElement.clientWidth,r=window.innerHeight||document.documentElement.clientHeight;if(!o||!r)return;const n=8;let{top:l,left:a}=this.position;a+i.width>o-n&&(a=Math.max(n,o-i.width-n)),l+i.height>r-n&&(l=Math.max(n,e.top-i.height-4)),this.position={top:l,left:a}}showMoreInfo(){this.open=!1,this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this.entityId},bubbles:!0,composed:!0}))}go(s){this.open=!1,Ye(s)}render(){return b`
      <button class="trigger" @click=${this.toggle}>
        ${this.label||this.entityId}
      </button>
      ${this.open?b`
            <div
              class="menu"
              style=${`top:${this.position.top}px;left:${this.position.left}px`}
            >
              <button class="item" @click=${this.showMoreInfo}>
                <ha-icon icon="mdi:information-outline"></ha-icon>
                ${this.localize("link.entity")}
                <span class="sub">${this.entityId}</span>
              </button>
              ${this.deviceId?b`
                    <button
                      class="item"
                      @click=${()=>this.go(`/config/devices/device/${this.deviceId}`)}
                    >
                      <ha-icon icon="mdi:devices"></ha-icon>
                      ${this.localize("link.device")}
                      <span class="sub">${this.deviceName??""}</span>
                    </button>
                  `:p}
              ${this.integrationDomain?b`
                    <button
                      class="item"
                      @click=${()=>this.go(`/config/integrations/integration/${this.integrationDomain}`)}
                    >
                      <ha-icon icon="mdi:puzzle-outline"></ha-icon>
                      ${this.localize("link.integration")}
                      <span class="sub">${this.integrationTitle??""}</span>
                    </button>
                  `:p}
            </div>
          `:p}
    `}};m.styles=[_e,he`
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
    `];_([g()],m.prototype,"entityId",2);_([g()],m.prototype,"label",2);_([g()],m.prototype,"deviceId",2);_([g()],m.prototype,"deviceName",2);_([g()],m.prototype,"integrationDomain",2);_([g()],m.prototype,"integrationTitle",2);_([g({attribute:!1})],m.prototype,"localize",2);_([Y()],m.prototype,"open",2);_([Y()],m.prototype,"position",2);m=_([fe("sg-entity-menu")],m);var Qe=Object.defineProperty,Xe=Object.getOwnPropertyDescriptor,O=(s,e,t,i)=>{for(var o=i>1?void 0:i?Xe(e,t):e,r=s.length-1,n;r>=0;r--)(n=s[r])&&(o=(i?n(e,t,o):n(o))||o);return i&&o&&Qe(e,t,o),o};let w=class extends k{constructor(){super(...arguments),this.options=[],this.selected=[],this.searchLabel="Search…",this.searchThreshold=12,this.filter=""}toggle(s){const e=this.selected.includes(s)?this.selected.filter(t=>t!==s):[...this.selected,s];this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e}}))}render(){const s=this.filter.trim().toLowerCase(),e=s?this.options.filter(t=>t.name.toLowerCase().includes(s)||t.id.toLowerCase().includes(s)||this.selected.includes(t.id)):this.options;return b`
      ${this.options.length>=this.searchThreshold?b`
            <input
              type="text"
              .value=${this.filter}
              placeholder=${this.searchLabel}
              style="margin-bottom:8px"
              @input=${t=>{this.filter=t.target.value}}
            />
          `:p}
      <div class="chips">
        ${e.map(t=>b`
            <button
              type="button"
              class="chip"
              data-selected=${this.selected.includes(t.id)}
              @click=${()=>this.toggle(t.id)}
            >
              ${t.icon?b`<ha-icon
                    icon=${t.icon}
                    style=${`color:${this.selected.includes(t.id)?"inherit":Je(t.color)}`}
                  ></ha-icon>`:p}
              ${t.name}
            </button>
          `)}
      </div>
    `}};w.styles=_e;O([g({attribute:!1})],w.prototype,"options",2);O([g({attribute:!1})],w.prototype,"selected",2);O([g()],w.prototype,"searchLabel",2);O([g({type:Number})],w.prototype,"searchThreshold",2);O([Y()],w.prototype,"filter",2);w=O([fe("sg-chip-select")],w);export{p as A,Fe as C,k as a,st as b,b as c,Je as d,it as e,ot as f,he as i,Ge as l,g as n,Y as r,_e as s,fe as t};
