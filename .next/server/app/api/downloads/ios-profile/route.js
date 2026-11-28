"use strict";(()=>{var e={};e.id=9728,e.ids=[9728],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},8852:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>g,patchFetch:()=>h,requestAsyncStorage:()=>y,routeModule:()=>c,serverHooks:()=>f,staticGenerationAsyncStorage:()=>m});var i={};r.r(i),r.d(i,{GET:()=>d,dynamic:()=>u});var n=r(9303),o=r(8716),a=r(670),s=r(7070),l=r(2048),p=r(5315);let u="force-dynamic";async function d(e){try{let t=e.headers.get("host")||"examjk.com",r=e.headers.get("x-forwarded-proto")||"https",i=t.includes("localhost")?`${r}://${t}`:"https://examjk.com",n="";for(let e of[p.join(process.cwd(),"public","apple-touch-icon.png"),p.join(process.cwd(),"public","icon-192.png")])if(l.existsSync(e)){n=l.readFileSync(e).toString("base64");break}let o=n?`      <key>Icon</key>
      <data>
${n.match(/.{1,68}/g)?.join("\n")||n}
      </data>
`:"",a=`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>FullScreen</key>
      <true/>
${o}      <key>IgnoreManifestScope</key>
      <false/>
      <key>IsRemovable</key>
      <true/>
      <key>Label</key>
      <string>ExamJK</string>
      <key>PayloadDescription</key>
      <string>Installs the ExamJK UBT Practice &amp; Learning App on your iPhone or iPad Home Screen.</string>
      <key>PayloadDisplayName</key>
      <string>ExamJK App</string>
      <key>PayloadIdentifier</key>
      <string>com.examjk.webclip.app</string>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadUUID</key>
      <string>8A4F2C10-5E9B-4D3A-9F12-EXAMJK000001</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>Precomposed</key>
      <true/>
      <key>URL</key>
      <string>${i}</string>
    </dict>
  </array>
  <key>PayloadDescription</key>
  <string>Install ExamJK (EPS-TOPIK UBT &amp; Smart Learning) as a full-screen app on iPhone and iPad.</string>
  <key>PayloadDisplayName</key>
  <string>ExamJK iPhone App</string>
  <key>PayloadIdentifier</key>
  <string>com.examjk.profile</string>
  <key>PayloadOrganization</key>
  <string>ExamJK.com</string>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>8A4F2C10-5E9B-4D3A-9F12-EXAMJK000002</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>
`;return new s.NextResponse(a,{status:200,headers:{"Content-Type":"application/x-apple-aspen-config; charset=utf-8","Content-Disposition":'attachment; filename="ExamJK-iOS.mobileconfig"',"Cache-Control":"no-store"}})}catch(e){return console.error("Failed to generate iOS mobileconfig:",e),s.NextResponse.json({error:"Failed to generate iOS install profile"},{status:500})}}let c=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/downloads/ios-profile/route",pathname:"/api/downloads/ios-profile",filename:"route",bundlePath:"app/api/downloads/ios-profile/route"},resolvedPagePath:"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/api/downloads/ios-profile/route.js",nextConfigOutput:"",userland:i}),{requestAsyncStorage:y,staticGenerationAsyncStorage:m,serverHooks:f}=c,g="/api/downloads/ios-profile/route";function h(){return(0,a.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:m})}},9925:e=>{var t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,n=Object.prototype.hasOwnProperty,o={};function a(e){var t;let r=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),i=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===r.length?i:`${i}; ${r.join("; ")}`}function s(e){let t=new Map;for(let r of e.split(/; */)){if(!r)continue;let e=r.indexOf("=");if(-1===e){t.set(r,"true");continue}let[i,n]=[r.slice(0,e),r.slice(e+1)];try{t.set(i,decodeURIComponent(null!=n?n:"true"))}catch{}}return t}function l(e){var t,r;if(!e)return;let[[i,n],...o]=s(e),{domain:a,expires:l,httponly:d,maxage:c,path:y,samesite:m,secure:f,partitioned:g,priority:h}=Object.fromEntries(o.map(([e,t])=>[e.toLowerCase(),t]));return function(e){let t={};for(let r in e)e[r]&&(t[r]=e[r]);return t}({name:i,value:decodeURIComponent(n),domain:a,...l&&{expires:new Date(l)},...d&&{httpOnly:!0},..."string"==typeof c&&{maxAge:Number(c)},path:y,...m&&{sameSite:p.includes(t=(t=m).toLowerCase())?t:void 0},...f&&{secure:!0},...h&&{priority:u.includes(r=(r=h).toLowerCase())?r:void 0},...g&&{partitioned:!0}})}((e,r)=>{for(var i in r)t(e,i,{get:r[i],enumerable:!0})})(o,{RequestCookies:()=>d,ResponseCookies:()=>c,parseCookie:()=>s,parseSetCookie:()=>l,stringifyCookie:()=>a}),e.exports=((e,o,a,s)=>{if(o&&"object"==typeof o||"function"==typeof o)for(let a of i(o))n.call(e,a)||void 0===a||t(e,a,{get:()=>o[a],enumerable:!(s=r(o,a))||s.enumerable});return e})(t({},"__esModule",{value:!0}),o);var p=["strict","lax","none"],u=["low","medium","high"],d=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t)for(let[e,r]of s(t))this._parsed.set(e,{name:e,value:r})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed);if(!e.length)return r.map(([e,t])=>t);let i="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(([e])=>e===i).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,r]=1===e.length?[e[0].name,e[0].value]:e,i=this._parsed;return i.set(t,{name:t,value:r}),this._headers.set("cookie",Array.from(i).map(([e,t])=>a(t)).join("; ")),this}delete(e){let t=this._parsed,r=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>a(t)).join("; ")),r}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},c=class{constructor(e){var t,r,i;this._parsed=new Map,this._headers=e;let n=null!=(i=null!=(r=null==(t=e.getSetCookie)?void 0:t.call(e))?r:e.get("set-cookie"))?i:[];for(let e of Array.isArray(n)?n:function(e){if(!e)return[];var t,r,i,n,o,a=[],s=0;function l(){for(;s<e.length&&/\s/.test(e.charAt(s));)s+=1;return s<e.length}for(;s<e.length;){for(t=s,o=!1;l();)if(","===(r=e.charAt(s))){for(i=s,s+=1,l(),n=s;s<e.length&&"="!==(r=e.charAt(s))&&";"!==r&&","!==r;)s+=1;s<e.length&&"="===e.charAt(s)?(o=!0,s=n,a.push(e.substring(t,i)),t=s):s=i+1}else s+=1;(!o||s>=e.length)&&a.push(e.substring(t,e.length))}return a}(n)){let t=l(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed.values());if(!e.length)return r;let i="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(e=>e.name===i)}has(e){return this._parsed.has(e)}set(...e){let[t,r,i]=1===e.length?[e[0].name,e[0].value,e[0]]:e,n=this._parsed;return n.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:r,...i})),function(e,t){for(let[,r]of(t.delete("set-cookie"),e)){let e=a(r);t.append("set-cookie",e)}}(n,this._headers),this}delete(...e){let[t,r,i]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:r,domain:i,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(a).join("; ")}}},8238:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ReflectAdapter",{enumerable:!0,get:function(){return r}});class r{static get(e,t,r){let i=Reflect.get(e,t,r);return"function"==typeof i?i.bind(e):i}static set(e,t,r,i){return Reflect.set(e,t,r,i)}static has(e,t){return Reflect.has(e,t)}static deleteProperty(e,t){return Reflect.deleteProperty(e,t)}}},2044:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RequestCookies:function(){return i.RequestCookies},ResponseCookies:function(){return i.ResponseCookies},stringifyCookie:function(){return i.stringifyCookie}});let i=r(9925)}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[8948,5972],()=>r(8852));module.exports=i})();