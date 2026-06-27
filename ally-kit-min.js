!function(t,e){"use strict";"function"==typeof define&&define.amd?define([],e):"undefined"!=typeof module&&void 0!==module.exports?module.exports=e():t.AllyKit=e()}("undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:this,function(){"use strict";if("undefined"!=typeof window&&window.AllyKit&&window.AllyKit.version)return{};const n="1.2.0",s="allykit-root",o="allykit-page-styles",r="allykit-adhd-mask",i="allyKitSettings",p="p, h1, h2, h3, h4, h5, h6, li, a, label, button, input, textarea, select, td, th, blockquote, figcaption, summary, caption",l="body > *:not(#"+s+"):not(#"+r+")",u={menuTitle:"Accessibility options",openMenu:"Open accessibility options",closeMenu:"Close accessibility options",reset:"Reset all settings",on:"On",off:"Off",default:"Default",changed:"updated",resetDone:"Accessibility settings reset",textSize:"Text size",highContrast:"High contrast",textSpacing:"Text spacing",lineHeight:"Line height",dyslexia:"Dyslexia Friendly",adhd:"ADHD mode",saturation:"Saturation",invert:"Invert color",bigCursor:"Big cursor",hideImages:"Hide images",pauseAnimation:"Pause animation",highlightLinks:"Highlight links",screenReader:"Screen Reader",screenReaderOn:"Screen reader on",screenReaderOff:"Screen reader off",notSupportedBrowser:"is not supported in this browser"},e="#4f46e5";function a(t){return t&&"string"==typeof t?(t=t.trim().replace(/^#/,""),/^[0-9a-fA-F]{6}$/.test(t)?t.toLowerCase():/^[0-9a-fA-F]{3}$/.test(t)?(t[0]+t[0]+t[1]+t[1]+t[2]+t[2]).toLowerCase():null):null}function c(t){return{r:parseInt(t.slice(0,2),16),g:parseInt(t.slice(2,4),16),b:parseInt(t.slice(4,6),16)}}function V(t,e,i){function a(t){return(t/=255)<=.03928?t/12.92:Math.pow((.055+t)/1.055,2.4)}return.2126*a(t)+.7152*a(e)+.0722*a(i)}function D(t,e){function i(t){return Math.round(t+(255-t)*e).toString(16).padStart(2,"0")}var{r:t,g:a,b:n}=c(t);return"#"+i(t)+i(a)+i(n)}function I(t,e){function i(t){return Math.round(t*(1-e)).toString(16).padStart(2,"0")}var{r:t,g:a,b:n}=c(t);return"#"+i(t)+i(a)+i(n)}function R(t){t=a(t)||a(e);return{primary:"#"+t,onPrimary:function(t){var{r:t,g:e,b:i}=c(t);return((t=V(t,e,i))+.05)/.05<=1.05/(t+.05)?"#ffffff":"#000000"}(t),primaryContainer:D(t,.82),onPrimaryContainer:I(t,.7)}}const d={position:"right",buttonOffset:"24px",panelWidth:"560px",accentColor:e,features:{textSize:!0,highContrast:!0,textSpacing:!0,lineHeight:!0,dyslexia:!0,adhd:!0,saturation:!0,invert:!0,bigCursor:!0,hideImages:!0,pauseAnimation:!0,highlightLinks:!0,screenReader:!0}};var t=window.AllyKitConfig||{};const f=Object.assign({},d,t),h=(t.features&&(f.features=Object.assign({},d.features,t.features)),R(f.accentColor)),y={textSize:0,highContrast:0,textSpacing:0,lineHeight:0,dyslexia:!1,adhd:!1,saturation:0,invert:!1,bigCursor:!1,hideImages:!1,pauseAnimation:!1,highlightLinks:!1,screenReader:!1},B={textSize:["Default","110%","120%","130%","140%"],highContrast:["Default","Enhanced","Black / White","Black / Yellow","Dark Mode"],textSpacing:["Default","Loose","Wider","Widest"],lineHeight:["Default","1.5x","1.8x","2x"],saturation:["Default","Low","High","Grayscale"]},N=[{key:"textSize",label:u.textSize,icon:"format_size",type:"level",max:4},{key:"highContrast",label:u.highContrast,icon:"contrast",type:"level",max:4},{key:"textSpacing",label:u.textSpacing,icon:"format_letter_spacing",type:"level",max:3},{key:"lineHeight",label:u.lineHeight,icon:"format_line_spacing",type:"level",max:3},{key:"dyslexia",label:u.dyslexia,icon:"font_download",type:"toggle"},{key:"adhd",label:u.adhd,icon:"center_focus_strong",type:"toggle"},{key:"saturation",label:u.saturation,icon:"palette",type:"level",max:3},{key:"invert",label:u.invert,icon:"invert_colors",type:"toggle"},{key:"bigCursor",label:u.bigCursor,icon:"ads_click",type:"toggle"},{key:"hideImages",label:u.hideImages,icon:"hide_image",type:"toggle"},{key:"pauseAnimation",label:u.pauseAnimation,icon:"pause_circle",type:"toggle"},{key:"highlightLinks",label:u.highlightLinks,icon:"link",type:"toggle"},{key:"screenReader",label:u.screenReader,icon:"record_voice_over",type:"toggle"}];function P(){return N.filter(function(t){return!1!==f.features[t.key]})}const m={highContrast:["allykit-high-contrast-1","allykit-high-contrast-2","allykit-high-contrast-3","allykit-high-contrast-4"],textSpacing:["allykit-text-spacing-1","allykit-text-spacing-2","allykit-text-spacing-3"],lineHeight:["allykit-line-height-1","allykit-line-height-2","allykit-line-height-3"]},g={dyslexia:"allykit-dyslexia",adhd:"allykit-adhd",bigCursor:"allykit-big-cursor",hideImages:"allykit-hide-images",pauseAnimation:"allykit-pause-animation",highlightLinks:"allykit-highlight-links"};let k=function(){try{var t,e=localStorage.getItem(i);return e?(delete(t=JSON.parse(e)).dark,delete t.highlightColor,Object.assign({},y,t)):L(y)}catch(t){return L(y)}}(),b=null,v=null,x=null,w=null,z=null,$=null,S=null,_=!1;const F=new Map,K={accessibility_new:'<path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4.18.9 6 1v13h2v-6h2v6h2V9c1.82-.1 4.14-.5 6-1l-.5-2zM12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2z"/>',close:'<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',restart_alt:'<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>',format_size:'<path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>',contrast:'<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/>',format_letter_spacing:'<path d="M6 14l3.1-8h2.1l3 8h-2.1l-.6-1.8H8.7L8.1 14H6zm3.3-3.6h1.6L10.1 8l-.8 2.4zM4 18h16v2H4v-2zM16 6h2v6h3v2h-5V6z"/>',format_line_spacing:'<path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z"/>',font_download:'<path d="M9.93 13.5h4.14L12 7.98 9.93 13.5zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/>',center_focus_strong:'<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-7 7H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>',palette:'<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.55 0 1-.45 1-1 0-.28-.11-.53-.29-.71-.18-.18-.29-.43-.29-.71 0-.55.45-1 1-1H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',invert_colors:'<path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58s4.1-.78 5.66-2.34c3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/>',ads_click:'<path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>',hide_image:'<path d="M21 5c0-1.1-.9-2-2-2H5.83L21 18.17V5zM2.81 2.81L1.39 4.22 3 5.83V19c0 1.1.9 2 2 2h13.17l1.61 1.61 1.41-1.41L2.81 2.81zM6 17l3-4 2.25 3 .82-1.1 2.1 2.1H6z"/>',pause_circle:'<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>',link:'<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',check:'<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',record_voice_over:'<path d="M18.39 12.56c.09-.18.14-.39.14-.6 0-.71-.52-1.29-1.21-1.37-.05-.01-.1-.01-.15-.01-.26 0-.51.07-.72.22L15.4 10a4 4 0 0 0-4.1-4h-.3a4 4 0 0 0-4 4v.45c-.64.15-1.12.73-1.12 1.42 0 .64.42 1.19 1 1.38V14c0 1.48.81 2.79 2 3.47V19l-2.38 1.19C5.31 20.87 4 22.66 4 24h16c0-1.34-1.31-3.13-2.62-3.81L15 19v-1.53c1.19-.68 2-1.99 2-3.47v-.6l-.26-.04c-.14-.02-.23-.05-.35-.3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 12v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8V9h2V7h2v2h1.9c.6 0 1.1.49 1.1 1.1v3.51c-.46.12-.84.42-1.07.82L13.9 14.39z"/>'};const C=function(){const n="speechSynthesis"in window,i="a[href], button, input, select, textarea, [role='button'], [role='link'], [tabindex]";function o(t){var e=t.getAttribute("aria-label");if(e&&e.trim())return e.trim();var e=t.getAttribute("aria-labelledby");if(e){e=e.split(/\s+/).map(function(t){t=document.getElementById(t);return t?t.textContent.trim():""}).filter(Boolean);if(e.length)return e.join(" ")}if(t.id){e=document.querySelector('label[for="'+t.id+'"]');if(e&&e.textContent.trim())return e.textContent.trim()}return t.alt&&t.alt.trim()?t.alt.trim():t.title&&t.title.trim()?t.title.trim():t.placeholder&&t.placeholder.trim()?t.placeholder.trim():("INPUT"===(e=t.tagName?t.tagName.toUpperCase():"")||"TEXTAREA"===e)&&t.value&&t.value.trim()?t.value.trim():"SELECT"===e&&t.options&&0<=t.selectedIndex?t.options[t.selectedIndex].text.trim():t.innerText?t.innerText.trim():""}function r(t,e,i){if(n&&t)try{window.speechSynthesis.cancel();var a=new SpeechSynthesisUtterance(t);a.lang=i&&i.lang||document.documentElement.lang||"en-US",a.rate=null!=(i&&i.rate)?i.rate:1,a.pitch=null!=(i&&i.pitch)?i.pitch:1,a.volume=null!=(i&&i.volume)?i.volume:1,"function"==typeof e&&(a.onend=e),a.onerror=function(t){"interrupted"!==t.error&&console.warn("[AllyKit] Speech synthesis error:",t.error),"function"==typeof e&&e()},window.speechSynthesis.speak(a)}catch(t){console.warn("[AllyKit] screenReader.speak error:",t),"function"==typeof e&&e()}else"function"==typeof e&&e()}var a=null,l=null;function s(t){for(var e=t.target;e&&e!==document.body&&(!e.matches||!e.matches(i));)e=e.parentElement;e&&e!==document.body&&e!==a&&(a=e,clearTimeout(l),l=setTimeout(function(){var t=o(e);t&&r(t,null)},150))}function c(t){t.target===a&&(clearTimeout(l),a=null)}function d(t){for(var e,i,a,n=t.target;n&&n.tagName&&"A"!==n.tagName.toUpperCase();)n=n.parentElement;n&&n.href&&(b&&b.contains(n)||("_blank"===n.target||"_new"===n.target?r(o(n)||n.href,null):(t.preventDefault(),t.stopPropagation(),e=n.href,t=o(n)||e,i=!1,a=setTimeout(function(){i||(i=!0,window.location.href=e)},4e3),r(t,function(){clearTimeout(a),i||(i=!0,window.location.href=e)}))))}function p(t){b&&b.contains(t.target)||t.target!==a&&(t=o(t.target))&&r(t,null)}return{isSupported:n,toggle:function(t){if(n){if(t)document.addEventListener("focusin",p,{passive:!0}),document.addEventListener("mouseover",s,{passive:!0}),document.addEventListener("mouseout",c,{passive:!0}),document.addEventListener("click",d,!0),r(u.screenReaderOn,null);else if(document.removeEventListener("focusin",p,{passive:!0}),document.removeEventListener("mouseover",s,{passive:!0}),document.removeEventListener("mouseout",c,{passive:!0}),document.removeEventListener("click",d,!0),clearTimeout(l),a=null,n)try{window.speechSynthesis.cancel();var e=new SpeechSynthesisUtterance(u.screenReaderOff);e.lang=document.documentElement.lang||"en-US",e.onerror=function(t){"interrupted"!==t.error&&console.warn("[AllyKit] Speech error:",t.error)},window.speechSynthesis.speak(e)}catch(t){console.warn("[AllyKit] screenReader.disable error:",t)}}else console.warn("[AllyKit] SpeechSynthesis "+u.notSupportedBrowser)},teardown:function(){if(document.removeEventListener("focusin",p,{passive:!0}),document.removeEventListener("mouseover",s,{passive:!0}),document.removeEventListener("mouseout",c,{passive:!0}),document.removeEventListener("click",d,!0),clearTimeout(l),a=null,n)try{window.speechSynthesis.cancel()}catch(t){}}}}();function L(t){return Object.assign({},t)}function q(){try{localStorage.setItem(i,JSON.stringify(k))}catch(t){}}function E(t){return'<svg class="allykit-icon" data-material-icon="'+t+'" aria-hidden="true" focusable="false" viewBox="0 0 24 24">'+(K[t]||K.accessibility_new)+"</svg>"}function A(t,e,i){var a=document.createElement(t);if(e&&(a.className=e),i)for(const n in i)a.setAttribute(n,i[n]);return a}function H(){document.querySelectorAll(l).forEach(function(t){t.style.zoom=""})}const U='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';function M(t){if(t)return""!==(t=t.split(",")[0].trim().replace(/^["']|["']$/g,"").toLowerCase())&&"times new roman"!==t&&"times"!==t&&"serif"!==t}function W(){var t;b&&(t=function(){try{var t=document.body,a=t&&window.getComputedStyle(t).fontFamily;if(M(a))return a.trim();var n=window.getComputedStyle(document.documentElement).fontFamily;if(M(n))return n.trim();var o=Object.create(null);let e=null,i=0;var r=document.querySelectorAll(p),l=Math.min(r.length,250);for(let t=0;t<l;t+=1){var s,c,d=r[t];b&&b.contains(d)||d.textContent&&d.textContent.trim()&&M(s=window.getComputedStyle(d).fontFamily)&&(o[c=s.trim()]=(o[c]||0)+1,o[c]>i)&&(i=o[c],e=c)}if(e)return e}catch(t){}return U}(),b.style.setProperty("--ak-host-font",t),b.style.setProperty("font-family",t,"important"))}function Y(){var t,e,i,a;document.getElementById(o)||((t=document.createElement("style")).id=o,t.textContent=(e=G.map(function(t,e){return t=t,e="body.allykit-high-contrast-"+(e=e+1),i=":not(#"+s+")",a=t.linkThickness?"text-decoration-thickness: "+t.linkThickness+" !important;\n        ":"",`
      ${e},
      ${e} *:not(#${s}):not(#${r}) {
        background-color: ${t.bg} !important;
        color: ${t.fg} !important;
        border-color: ${t.border} !important;
        text-shadow: none !important;
        box-shadow: none !important;
      }
      ${e} a${i} {
        color: ${t.link} !important;
        text-decoration: underline !important;
        ${a}text-underline-offset: 3px !important;
      }
      ${e} img${i}, ${e} svg${i} {
        filter: ${t.img} !important;
      }
      ${e} *:focus-visible${i} {
        outline: 3px solid ${t.focus} !important;
        outline-offset: 3px !important;
      }
      ${e} button${i}, ${e} input${i}, ${e} select${i}, ${e} textarea${i} {
        border: ${t.control} !important;
      }`;var i,a}).join("\n"),i=J.map(function(t,e){return`body.allykit-text-spacing-${e+1} :where(${p}) {
        letter-spacing: ${t[0]} !important;
        word-spacing: ${t[1]} !important;
      }`}).join("\n      "),a=X.map(function(t,e){return`body.allykit-line-height-${e+1} :where(${p}) { line-height: ${t} !important; }`}).join("\n      "),`
      @font-face {
        font-family: "Open-Dyslexic";
        font-style: normal;
        font-weight: 400;
        src: url("https://www.globalimebank.com/blog/wp-content/ally/open-dyslexic.woff") format("woff");
      }

      #${s} {
        all: initial !important;
        color-scheme: light !important;
        position: relative !important;
        z-index: 2147483000 !important;
      }

      /* Text zoom is applied via the JavaScript zoom property. */

      ${i}

      ${a}

      body.allykit-dyslexia :where(${p}) {
        font-family: "Open-Dyslexic", Arial, system-ui, sans-serif !important;
      }

      /* â”€â”€ High Contrast levels 1â€“3 (generated from HC_LEVELS) â”€â”€ */
      ${e}

      /* â”€â”€ High Contrast Level 4: Dark Mode (WCAG AA compliant dark theme) â”€â”€ */
      body.allykit-high-contrast-4 {
        color-scheme: dark !important;
        background: #121212 !important;
        color: #e0e0e0 !important;
      }
      body.allykit-high-contrast-4 *:not(#${s}):not(#${r}) {
        background-color: #1e1e1e !important;
        color: #e0e0e0 !important;
        border-color: #444444 !important;
      }
      body.allykit-high-contrast-4 a:not(#${s}) {
        color: #82b1ff !important;
        text-decoration: underline !important;
        text-underline-offset: 3px !important;
      }
      body.allykit-high-contrast-4 *:focus-visible:not(#${s}) {
        outline: 3px solid #ffdd57 !important;
        outline-offset: 3px !important;
      }
      body.allykit-high-contrast-4 button:not(#${s}),
      body.allykit-high-contrast-4 input:not(#${s}),
      body.allykit-high-contrast-4 select:not(#${s}),
      body.allykit-high-contrast-4 textarea:not(#${s}) {
        border: 1px solid #555555 !important;
      }
      body.allykit-high-contrast-4 img:not(#${s}) {
        opacity: 0.88 !important;
      }

      html.allykit-filter-active body > :not(#${s}):not(#${r}) {
        filter: var(--allykit-page-filter) !important;
      }

      body.allykit-highlight-links a:not(#${s}) {
        background-color: #ffff68 !important;
        color: #111 !important;
        outline: 2px solid #111 !important;
        outline-offset: 2px !important;
        text-decoration: underline !important;
        text-decoration-thickness: 0.18em !important;
      }

      body.allykit-hide-images img:not(#${s}),
      body.allykit-hide-images picture:not(#${s}),
      body.allykit-hide-images video[poster]:not(#${s}) {
        visibility: hidden !important;
      }
      body.allykit-hide-images,
      body.allykit-hide-images *:not(#${s}):not(#${r}) {
        background-image: none !important;
      }

      body.allykit-pause-animation,
      body.allykit-pause-animation::before,
      body.allykit-pause-animation::after,
      body.allykit-pause-animation *:not(#${s}),
      body.allykit-pause-animation *:not(#${s})::before,
      body.allykit-pause-animation *:not(#${s})::after {
        animation-delay: 0s !important;
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-delay: 0s !important;
        transition-duration: 0.001ms !important;
      }

      body.allykit-big-cursor,
      body.allykit-big-cursor *:not(#${s}) {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath fill='%23fff' stroke='%23000' stroke-width='2.8' d='M8 4 38 27 24.5 30.5 31 44 24 47 17.8 33.7 8 43z'/%3E%3C/svg%3E") 4 4, auto !important;
      }

      .allykit-adhd-mask {
        --allykit-adhd-y: 50vh;
        display: none;
        position: fixed;
        inset: 0;
        z-index: 2147482000;
        pointer-events: none;
        mix-blend-mode: multiply;
        transition: background-position 0.05s;
        filter: saturate(0.5) !important;
        background:
          linear-gradient(
            to bottom,
            hsla(0, 0%, 0%, 0.7) 0%,
            rgba(0, 0, 0, 0.7) calc(var(--allykit-adhd-y) - 80px),
            transparent calc(var(--allykit-adhd-y) - 80px),
            transparent calc(var(--allykit-adhd-y) + 80px),
            rgba(0, 0, 0, 0.7) calc(var(--allykit-adhd-y) + 80px),
            rgba(0, 0, 0, 0.7) 100%
          );
      }
      body.allykit-adhd .allykit-adhd-mask {
        display: block;
      }
      .allykit-adhd-mask::before,
      .allykit-adhd-mask::after {
        content: "";
        position: absolute;
        left: 0;
        width: 100%;
        height: 6px;
        pointer-events: none;
      }
      .allykit-adhd-mask::before {
        top: calc(var(--allykit-adhd-y) - 80px);
        background-color: #6f339d;
      }
      .allykit-adhd-mask::after {
        top: calc(var(--allykit-adhd-y) + 80px);
        background-color: #11298b;
      }
      body.allykit-adhd {
        --allykit-page-focus-outline: #ffff68;
      }
      body.allykit-adhd *:not(#${s}):not(#${r}) {
        transition: filter 0.5s ease;
      }
      body.allykit-adhd :focus-visible:not(#${s}) {
        outline: 3px solid var(--allykit-page-focus-outline) !important;
        outline-offset: 4px !important;
      }
    `),document.head.appendChild(t))}const G=[{bg:"#000000",fg:"#ffffff",border:"#ffffff",link:"#6db3f8",img:"contrast(1.2)",focus:"#ffff68",control:"2px solid #ffffff"},{bg:"#000000",fg:"#ffffff",border:"#ffffff",link:"#ffffff",linkThickness:"2px",img:"contrast(1.4) brightness(1.1)",focus:"#ffff68",control:"2px solid #ffffff"},{bg:"#000000",fg:"#ffff68",border:"#ffff68",link:"#80d8ff",linkThickness:"2px",img:"contrast(1.4) brightness(1.1)",focus:"#ff4081",control:"2px solid #ffff68"}];const J=[["0.08em","0.16em"],["0.12em","0.24em"],["0.16em","0.32em"]],X=["1.5","1.8","2"];function Q(){b=A("div","",{id:s}),v=b.attachShadow({mode:"open"}),W();var t=document.createElement("style"),e=(t.textContent=(i="left"===f.position?"left":"right",e="left"==i?"right":"left",`
      :host {
        all: initial;
        --ak-primary:              ${h.primary};
        --ak-on-primary:           ${h.onPrimary};
        --ak-primary-container:    ${h.primaryContainer};
        --ak-on-primary-container: ${h.onPrimaryContainer};
        --ak-secondary: #526070;
        --ak-tertiary: #695779;
        --ak-surface: #fbfcff;
        --ak-surface-container: #eef3f8;
        --ak-surface-container-high: #e7edf4;
        --ak-on-surface: #181c20;
        --ak-on-surface-variant: #404852;
        --ak-outline: #707984;
        --ak-outline-variant: #c0c8d2;
        --ak-shadow: rgba(0, 0, 0, 0.22);
        --ak-radius: 12px;
        --ak-focus:           ${h.primary};
        color-scheme: light;
        /* Resolved from the host page at runtime via applyHostFont(); inherited by every child. */
        font-family: var(--ak-host-font, ${U});
        /* Page-immune type anchor. The widget sizes its text in em, NOT rem: rem ignores the
           shadow boundary and resolves against the host page's <html> font-size, so any site that
           sets a small root size (e.g. html { font-size: 62.5% }) would shrink every label here.
           "medium" is the user's browser default â€” independent of the page â€” so em keeps the panel
           readable everywhere while still honoring the visitor's own font-size preference. */
        font-size: medium;
      }

      * {
        box-sizing: border-box;
        font-family: inherit;
      }

      .allykit-shell {
        position: fixed;
        z-index: 2147483001;
        bottom: ${f.buttonOffset};
        ${i}: ${f.buttonOffset};
        color: var(--ak-on-surface);
      }

      /* â”€â”€ FAB Button â”€â”€ */
      .allykit-fab {
        width: 58px;
        height: 58px;
        border: 0;
        border-radius: 16px;
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0;
        padding: 0 14px;
        overflow: hidden;
        white-space: nowrap;
        background: var(--ak-primary);
        color: var(--ak-on-primary);
        box-shadow: 0 4px 14px var(--ak-shadow);
        cursor: pointer;
        transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
      }

      .allykit-fab:hover,
      .allykit-fab:focus-visible {
        width: 190px;
        transform: translateY(-2px);
        box-shadow: 0 8px 22px var(--ak-shadow);
      }

      .allykit-fab__content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        opacity: 0;
        padding-left: 10px;
        transition: opacity 150ms ease;
      }

      .allykit-fab:hover .allykit-fab__content,
      .allykit-fab:focus-visible .allykit-fab__content {
        opacity: 1;
        transition-delay: 50ms;
      }

      .allykit-fab__label {
        font-size: 1.0em;
        font-weight: 700;
        line-height: 1.2;
      }

      .allykit-fab__shortcut {
        font-size: 0.65em;
        line-height: 1;
        font-weight: 600;
        letter-spacing: 0.02em;
        opacity: 0.85;
        color: var(--ak-on-primary);
        pointer-events: none;
        white-space: nowrap;
      }

      .allykit-fab:focus-visible,
      .allykit-icon-button:focus-visible,
      .allykit-tool:focus-visible {
        outline: 3px solid var(--ak-focus);
        outline-offset: 3px;
      }

      .allykit-fab .allykit-icon {
        width: 30px;
        height: 30px;
        display: block;
        flex-shrink: 0;
      }

      /* â”€â”€ Panel â”€â”€ */
      .allykit-panel {
        position: fixed;
        z-index: 2147483002;
        inset-block: 20px;
        ${i}: 20px;
        ${e}: auto;
        width: min(${f.panelWidth}, calc(100vw - 32px));
        max-height: calc(100vh - 40px);
        display: grid;
        grid-template-rows: auto 1fr;
        background: var(--ak-surface);
        color: var(--ak-on-surface);
        border: 1px solid var(--ak-outline-variant);
        border-radius: 16px;
        box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateX(${"right"==i?"18px":"-18px"});
        transition: opacity 180ms ease, transform 180ms ease, visibility 180ms ease;
      }

      .allykit-panel[data-open="true"] {
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
      }

      /* â”€â”€ Header â”€â”€ */
      .allykit-header {
        min-height: 64px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto auto;
        gap: 10px;
        align-items: center;
        padding: 10px 14px;
        background: var(--ak-surface-container);
        border-bottom: 1px solid var(--ak-outline-variant);
      }

      .allykit-title-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--ak-primary);
        color: var(--ak-on-primary);
      }

      .allykit-title {
        margin: 0;
        font-size: 1.05em;
        line-height: 1.2;
        font-weight: 700;
        letter-spacing: 0;
      }

      .allykit-icon-button {
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--ak-on-surface-variant);
        cursor: pointer;
      }

      .allykit-icon-button:hover {
        background: var(--ak-surface-container-high);
        color: var(--ak-on-surface);
      }

      .allykit-reset-button {
        width: auto;
        min-width: 88px;
        height: 38px;
        gap: 6px;
        padding: 0 12px;
        border-radius: 20px;
        background: var(--ak-primary-container);
        color: var(--ak-on-primary-container);
        font-weight: 700;
      }

      .allykit-icon {
        width: 22px;
        height: 22px;
        display: block;
        fill: currentColor;
        flex: 0 0 auto;
      }

      /* â”€â”€ Body & Grid â”€â”€ */
      .allykit-body {
        overflow: auto;
        padding: 16px;
        scrollbar-width: thin;
      }

      .allykit-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      /* â”€â”€ Feature Tool Cards â”€â”€ */
      .allykit-tool {
        min-height: 108px;
        border: 1px solid var(--ak-outline-variant);
        border-radius: var(--ak-radius);
        background: var(--ak-surface-container);
        color: var(--ak-on-surface);
        display: grid;
        grid-template-rows: auto 1fr auto;
        align-items: center;
        justify-items: center;
        gap: 6px;
        padding: 12px 10px;
        cursor: pointer;
        text-align: center;
        font: inherit;
        transition: background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
      }

      .allykit-tool:hover {
        background: color-mix(in srgb, var(--ak-primary) 6%, var(--ak-surface-container));
        border-color: var(--ak-primary);
      }

      .allykit-tool[data-active="true"] {
        background: var(--ak-primary-container);
        border-color: var(--ak-primary);
        box-shadow: inset 0 0 0 1px var(--ak-primary);
      }

      .allykit-tool__icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--ak-primary) 12%, transparent);
        color: var(--ak-primary);
      }

      .allykit-tool[data-active="true"] .allykit-tool__icon {
        background: var(--ak-primary);
        color: var(--ak-on-primary);
      }

      .allykit-tool__label {
        min-height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.84em;
        line-height: 1.25;
        font-weight: 650;
        letter-spacing: 0;
      }

      .allykit-tool__state {
        min-height: 18px;
        font-size: 0.72em;
        line-height: 1.2;
        color: var(--ak-on-surface-variant);
        font-weight: 600;
      }

      .allykit-tool[data-active="true"] .allykit-tool__state {
        color: var(--ak-on-primary-container);
      }

      .allykit-steps {
        min-height: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .allykit-step {
        width: 18px;
        height: 6px;
        border-radius: 999px;
        background: var(--ak-outline-variant);
      }

      .allykit-step[data-active="true"] {
        background: var(--ak-primary);
      }

      .allykit-sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* â”€â”€ Tablet breakpoint â”€â”€ */
      @media (max-width: 640px) {
        .allykit-panel {
          inset: 12px;
          width: calc(100vw - 24px);
          max-height: calc(100vh - 24px);
          border-radius: 14px;
        }

        .allykit-body {
          padding: 14px;
        }

        .allykit-grid {
          gap: 8px;
        }

        .allykit-tool {
          min-height: 100px;
          padding: 10px 8px;
        }
      }

      /* â”€â”€ Mobile breakpoint â”€â”€ */
      @media (max-width: 480px) {
        .allykit-panel {
          inset: 0;
          width: 100vw;
          max-height: 100vh;
          border-radius: 0;
          border: none;
        }

        .allykit-header {
          min-height: 56px;
          padding: 8px 12px;
          gap: 8px;
        }

        .allykit-title {
          font-size: 0.95em;
        }

        .allykit-body {
          padding: 12px;
        }

        .allykit-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .allykit-tool {
          min-height: 96px;
          padding: 10px 6px;
          gap: 5px;
        }

        .allykit-tool__icon {
          width: 36px;
          height: 36px;
        }

        .allykit-tool__label {
          font-size: 0.78em;
          min-height: 28px;
        }

        .allykit-shell {
          bottom: 16px;
          ${i}: 16px;
        }

        .allykit-fab {
          width: 52px;
          height: 52px;
          padding: 0 13px;
          border-radius: 14px;
        }

        .allykit-fab:hover,
        .allykit-fab:focus-visible {
          width: 170px;
        }

        .allykit-fab .allykit-icon {
          width: 26px;
          height: 26px;
        }

        .allykit-fab__label {
          font-size: 0.8em;
        }

        .allykit-fab__shortcut {
          font-size: 0.6em;
        }
      }

      /* â”€â”€ Small mobile â”€â”€ */
      @media (max-width: 360px) {
        .allykit-grid {
          gap: 6px;
        }

        .allykit-tool {
          min-height: 88px;
          padding: 8px 4px;
        }

        .allykit-tool__label {
          font-size: 0.74em;
        }

        .allykit-body {
          padding: 10px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .allykit-fab,
        .allykit-panel,
        .allykit-tool {
          transition: none;
        }
      }
    `),A("div","allykit-shell")),i=((w=A("button","allykit-fab",{type:"button","aria-label":u.openMenu,"aria-haspopup":"dialog","aria-expanded":"false","aria-keyshortcuts":"Control+F2"})).innerHTML=E("accessibility_new")+'<span class="allykit-fab__content"><span class="allykit-fab__label">Accessibility Tool</span><span class="allykit-fab__shortcut" aria-hidden="true">Ctrl+F2</span></span>',w.addEventListener("click",j),x=A("section","allykit-panel",{role:"dialog","aria-modal":"true","aria-labelledby":"allykit-title","aria-hidden":"true","data-open":"false"}),A("div","allykit-header")),a=A("span","allykit-title-icon",{"aria-hidden":"true"}),n=(a.innerHTML=E("accessibility_new"),A("h2","allykit-title",{id:"allykit-title"})),o=(n.textContent=u.menuTitle,A("button","allykit-icon-button allykit-reset-button",{type:"button","aria-label":u.reset})),r=(o.innerHTML=E("restart_alt")+"<span>Reset</span>",o.addEventListener("click",it),A("button","allykit-icon-button",{type:"button","aria-label":u.closeMenu})),a=(r.innerHTML=E("close"),r.addEventListener("click",O),i.append(a,n,o,r),A("div","allykit-body"));const l=A("div","allykit-grid");P().forEach(function(t){l.appendChild(function(i){var t=A("button","allykit-tool",{type:"button","data-key":i.key}),e=A("span","allykit-tool__icon",{"aria-hidden":"true"}),a=(e.innerHTML=E(i.icon),A("span","allykit-tool__label")),n=(a.textContent=i.label,A("span","allykit-tool__state"));t.append(e,a);let o=null;if("level"===i.type){var r=A("span","allykit-steps",{"aria-hidden":"true"});for(let t=0;t<i.max;t+=1)r.appendChild(A("span","allykit-step"));t.append(r),o=r.children}else t.setAttribute("role","switch");return t.append(n),t.addEventListener("click",function(){var e,t;e=i.key,(t=N.find(function(t){return t.key===e}))&&("level"===t.type?k[e]=(Number(k[e])+1)%(t.max+1):k[e]=!k[e],T(!0),"screenReader"===e&&C.toggle(Boolean(k.screenReader)),rt(t.label+" "+Z(t)))}),F.set(i.key,{button:t,stateNode:n,steps:o}),t}(t))}),z=A("div","allykit-sr-only",{"aria-live":"polite","aria-atomic":"true"}),a.append(l,z),x.append(i,a),e.append(w,x),v.append(t,e),document.body.appendChild(b)}function T(t){if(document.body&&document.documentElement){Object.keys(m).forEach(function(t){var e=document.body.classList,i=(e.remove.apply(e,m[t]),Number(k[t])||0);0<i&&e.add(m[t][i-1])});var e=Number(k.textSize)||0;if(0<e){const a=(1+.1*e).toFixed(2);document.querySelectorAll(l).forEach(function(t){t.style.setProperty("zoom",a,"important")})}else H();Object.keys(g).forEach(function(t){document.body.classList.toggle(g[t],Boolean(k[t]))});var e=[],i=(k.invert&&e.push("invert(1) hue-rotate(180deg)"),1===k.saturation&&e.push("saturate(0.45)"),2===k.saturation&&e.push("saturate(1.9)"),3===k.saturation&&e.push("grayscale(1) saturate(0)"),document.documentElement.style);document.documentElement.classList.toggle("allykit-filter-active",0<e.length),0<e.length?i.setProperty("--allykit-page-filter",e.join(" ")):i.removeProperty("--allykit-page-filter"),P().forEach(function(t){var e=F.get(t.key);if(e){var i="level"===t.type?0<Number(k[t.key]):Boolean(k[t.key]),a=Z(t),i=String(i);if(e.button.dataset.active=i,e.button.setAttribute("aria-label",t.label+". Current setting: "+a+"."),"toggle"===t.type)e.button.setAttribute("aria-checked",i);else{e.button.setAttribute("aria-pressed",i);var n=Number(k[t.key]),o=e.steps;for(let t=0;t<o.length;t+=1)o[t].dataset.active=String(t<n)}e.stateNode.textContent=a}}),(k.pauseAnimation?tt:et)(),t&&q()}}function Z(t){var e;return"level"===t.type?(e=Number(k[t.key])||0,B[t.key][e]||u.default):k[t.key]?u.on:u.off}function tt(){document.querySelectorAll("video, audio").forEach(function(t){b&&b.contains(t)||t.paused||(t.setAttribute("data-allykit-was-playing","true"),t.pause())})}function et(){document.querySelectorAll('[data-allykit-was-playing="true"]').forEach(function(t){t.removeAttribute("data-allykit-was-playing"),"function"==typeof t.play&&(t=t.play())&&"function"==typeof t.catch&&t.catch(function(){})})}function it(){k.screenReader&&C.teardown(),k=L(y),q(),H(),T(!1),rt(u.resetDone)}function at(){if(x){$=document.activeElement,x.dataset.open="true",x.setAttribute("aria-hidden","false"),w.setAttribute("aria-expanded","true");const t=v.querySelector(".allykit-tool");window.setTimeout(function(){(t||x).focus()},0)}}function O(){x&&(x.dataset.open="false",x.setAttribute("aria-hidden","true"),w.setAttribute("aria-expanded","false"),($&&"function"==typeof $.focus?$:w).focus())}function j(){(x&&"true"===x.dataset.open?O:at)()}function nt(t){var e,i,a,n;t.ctrlKey&&"F2"===t.key?(t.preventDefault(),j()):x&&"true"===x.dataset.open&&("Escape"===t.key?(t.preventDefault(),O()):"Tab"===t.key?(n=t,(a=ot()).length&&(e=a[0],a=a[a.length-1],i=v.activeElement,n.shiftKey&&i===e?(n.preventDefault(),a.focus()):n.shiftKey||i!==a||(n.preventDefault(),e.focus()))):"ArrowDown"!==t.key&&"ArrowUp"!==t.key||(i=v.activeElement)&&i.matches("button")&&-1!==(n=(a=ot()).indexOf(i))&&(t.preventDefault(),a["ArrowDown"===t.key?(n+1)%a.length:(n-1+a.length)%a.length].focus()))}function ot(){return Array.from(v.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))}function rt(t){z&&(z.textContent="",window.setTimeout(function(){z.textContent=t},30))}function lt(){(S=new MutationObserver(function(){!k.pauseAnimation||_||(_=!0,window.requestAnimationFrame(function(){_=!1,k.pauseAnimation&&tt()}))})).observe(document.body,{childList:!0,subtree:!0})}function st(){document.removeEventListener("keydown",nt,!0),S&&S.disconnect(),et(),H(),C.teardown();const e=document.body.classList;Object.keys(m).forEach(function(t){e.remove.apply(e,m[t])}),Object.keys(g).forEach(function(t){e.remove(g[t])}),document.documentElement.classList.remove("allykit-filter-active"),document.documentElement.style.removeProperty("--allykit-page-filter");var t=document.getElementById(o),t=(t&&t.remove(),document.getElementById(r));t&&t.remove(),b&&b.remove(),"undefined"!=typeof window&&(window.AllyKit=null)}function ct(t){var e;if(t&&"object"==typeof t&&(e=Object.assign({},d,t),t.features&&(e.features=Object.assign({},d.features,t.features)),t.accentColor&&Object.assign(h,R(t.accentColor)),Object.assign(f,e)),!document.body)return null;if(Y(),Q(),!document.getElementById(r)){const i=A("div","allykit-adhd-mask",{id:r,"aria-hidden":"true"}),a=(document.body.appendChild(i),function(t){i.style.setProperty("--allykit-adhd-y",t+"px")});document.addEventListener("mousemove",function(t){a(t.clientY)},{passive:!0}),document.addEventListener("touchmove",function(t){t.touches&&t.touches[0]&&a(t.touches[0].clientY)},{passive:!0})}T(!1),lt(),document.addEventListener("keydown",nt,!0),k.screenReader&&C.isSupported&&window.setTimeout(function(){k.screenReader&&C.toggle(!0)},800),"complete"!==document.readyState&&window.addEventListener("load",W,{once:!0});t={version:n,open:at,close:O,toggle:j,reset:it,destroy:st,getState:function(){return L(k)}};return"undefined"!=typeof window&&(window.AllyKit=t),t}return t=function(){ct()},"loading"===document.readyState?document.addEventListener("DOMContentLoaded",t,{once:!0}):t(),{version:n,init:ct}});