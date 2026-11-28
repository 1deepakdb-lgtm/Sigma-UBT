"use strict";(()=>{var e={};e.id=6847,e.ids=[6847],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},92048:e=>{e.exports=require("fs")},55315:e=>{e.exports=require("path")},71568:e=>{e.exports=require("zlib")},72254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},47261:e=>{e.exports=require("node:util")},87537:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>R,patchFetch:()=>$,requestAsyncStorage:()=>k,routeModule:()=>S,serverHooks:()=>E,staticGenerationAsyncStorage:()=>T});var a={};r.r(a),r.d(a,{GET:()=>x,POST:()=>v,dynamic:()=>g});var i=r(49303),o=r(88716),s=r(60670),n=r(87070),c=r(61282);let l=require("util");var d=r(68408),p=r(92048),u=r(55315);let m=(0,l.promisify)(c.exec),g="force-dynamic",h=process.env.DEPLOY_SECRET||"examjk_deploy_2026";async function y(e){let t=new URL(e.url),r=t.searchParams.get("key")||t.searchParams.get("secret");if(r&&r===h)return{authorized:!0,user:"Secret Key Token"};let a=e.headers.get("x-deploy-key")||e.headers.get("x-deploy-secret");if(a&&a===h)return{authorized:!0,user:"Header Token"};let i=e.headers.get("x-github-event");if(i&&r===h)return{authorized:!0,user:`GitHub Webhook (${i})`};try{let t=await (0,d.xn)(e);if(t&&"admin"===t.role)return{authorized:!0,user:t.name||t.email||"Admin User"}}catch{}return{authorized:!1}}function f(){let e="/home/examjkco/repositories/Sigma-UBT";return p.existsSync(e)?e:process.cwd()}async function b(e,t=!1){let a=[],i=e=>a.push(`[${new Date().toISOString().slice(11,19)}] ${e}`),o={cwd:e,env:{...process.env,HOME:"/home/examjkco",USER:"examjkco",PATH:`/opt/alt/python311/bin:/opt/alt/python310/bin:/opt/alt/python39/bin:/opt/alt/python38/bin:${process.env.PATH||""}:/usr/local/bin:/usr/bin:/bin:/usr/local/cpanel/3rdparty/bin:/opt/cpanel/ea-git/bin`}};i(`📁 Working directory: ${e}`);try{await m('git config --global --add safe.directory "*"',o)}catch{}let s=u.join(e,"prisma","dev.db"),n=u.join(e,"prisma","dev.db.cpanel_backup");if(p.existsSync(s))try{p.copyFileSync(s,n),i(`🛡️ Backed up SQLite database to prisma/dev.db.cpanel_backup`)}catch(e){i(`⚠️ Database backup warning: ${e.message}`)}try{let e=await m("git stash",o),t=String(e?.stdout||"").trim();i(`📦 Git stash: ${t||"No local untracked conflicts"}`)}catch(e){i(`⚠️ Git stash notice: ${e.message}`)}try{i(`🌐 Fetching latest changes from origin/main...`);try{await m("rm -f .git/index.lock .git/refs/remotes/origin/*\\ *",o)}catch{}let{stdout:e,stderr:t}=await m("git fetch origin main --force",o),r=e?String(e).trim():"",a=t?String(t).trim():"";r&&i(`⬇️ Fetch output:
${r}`),a&&i(`ℹ️ Fetch details: ${a}`)}catch(e){throw i(`❌ Git fetch failed: ${e.message}`),Error(`Git fetch failed: ${e.message}`)}try{i(`🔄 Resetting local tree to origin/main...`);let e=await m("git reset --hard origin/main",o),t=(String(e?.stdout||"")+" "+String(e?.stderr||"")).trim();i(`✅ Reset output:
${t}`)}catch(e){throw i(`❌ Git reset failed: ${e.message}`),Error(`Git reset failed: ${e.message}`)}try{let t=u.join(e,".next","cache");p.existsSync(t)&&(p.rmSync(t,{recursive:!0,force:!0}),i(`🧹 Purged stale .next/cache to force fresh SSR/SSG page rendering.`))}catch(e){i(`ℹ️ Next cache purge notice: ${e.message}`)}try{let a=u.join(e,"prisma","dev.db.template.gz"),o=t||!p.existsSync(s);if(!o&&p.existsSync(s))try{if(p.statSync(s).size<1e4)o=!0;else{let{default:e}=await r.e(7598).then(r.bind(r,37598)),t=await e.examSet.findFirst({select:{id:!0,name:!0,isFree:!0}});i(`✅ SQLite database verified (Active sample set: ${t?.name||"Available"})`)}}catch(e){i(`⚠️ SQLite corrupt / malformed: ${e.message}. Restoring from clean template...`),o=!0}if(o&&p.existsSync(a)){i(`📦 Restoring pristine SQLite database from dev.db.template.gz...`);let e=await Promise.resolve().then(r.t.bind(r,71568,19)),t=p.readFileSync(a),o=e.gunzipSync(t);p.writeFileSync(s,o),i(`🎉 Database successfully restored from template! (${o.length} bytes, 100+ UBT & Chapterwise sets ready)`)}}catch(e){i(`⚠️ Database verification notice: ${e.message}`)}try{i(`⚙️ Ensuring SQLite columns exist in dev.db...`);let{default:e}=await r.e(7598).then(r.bind(r,37598));for(let t of["ALTER TABLE BillRecord ADD COLUMN nextPaymentDate TEXT;","ALTER TABLE BillRecord ADD COLUMN nextPaymentDays INTEGER;","ALTER TABLE BillRecord ADD COLUMN admittedDate TEXT;","ALTER TABLE BillRecord ADD COLUMN classTime TEXT;","ALTER TABLE BillRecord ADD COLUMN parentName TEXT;"])try{await e.$executeRawUnsafe(t)}catch(e){}i(`✅ SQLite schema columns verified.`);try{await e.$executeRawUnsafe("UPDATE BillingProfile SET googleSheetUrl = ? WHERE instituteId IN ('default-institute', 'd932da89-c112-45ba-85b3-76cb742ff9c2', '90e5713b-5d1c-4351-bc19-3b0d7c17ef95', '686e3813-ad09-42cb-99d7-d28dc5cea44c') OR companyName LIKE '%SIGMA%';","https://script.google.com/macros/s/AKfycbxL8QJVF4_IzcCPSbIwOcQorTX19KPVgb6Y0xOMfOQOLQcmCwblhStD0nEgmXirXoreFQ/exec"),i(`✅ Authoritative Sigma Google Sheet webhook verified in database.`)}catch(e){i(`ℹ️ Profile webhook update notice: ${e.message}`)}}catch(e){i(`ℹ️ Schema check notice: ${e.message}`)}try{i(`🔄 Updating Prisma Client binary on server...`),await m("node ./node_modules/prisma/build/index.js generate",o),i(`✅ Prisma Client generated on server.`)}catch(e){i(`ℹ️ Prisma generate notice: ${e.message}`)}let c=u.join(e,"node_modules");try{let e=p.lstatSync(c);e.isDirectory()&&!e.isSymbolicLink()&&(i(`🧹 Cleaning conflicting physical node_modules for CloudLinux symlink compatibility...`),p.rmSync(c,{recursive:!0,force:!0}))}catch{}try{i(`🐍 Ensuring edge-tts python dependency is installed...`);let e=`
      for p in /opt/alt/python311/bin/python3 /opt/alt/python310/bin/python3 /opt/alt/python39/bin/python3 /usr/bin/python3 python3; do
        if [ -x "$p" ]; then
          $p -m pip install --user --upgrade edge-tts 2>&1 && break
        fi
      done
    `,t=await m(e,o),r=String(t?.stdout||"").trim();r&&i(`🐍 Pip details: ${r.slice(0,150)}`),i(`✅ edge-tts package verified.`)}catch(e){i(`ℹ️ edge-tts pip check notice: ${e.message}`)}try{let t=u.join(e,"public","audio-cache","elevenlabs");if(p.existsSync(t)){let e=p.readdirSync(t),r=0;for(let a of e)if(a.endsWith(".mp3"))try{p.unlinkSync(u.join(t,a)),r++}catch{}r>0&&i(`🧹 Purged ${r} stale audio cache files.`)}}catch(e){i(`ℹ️ Cache purge notice: ${e.message}`)}let l=u.join(e,"tmp"),d=u.join(l,"restart.txt");try{p.existsSync(l)||p.mkdirSync(l,{recursive:!0}),p.writeFileSync(d,`Restart triggered by ExamJK Deploy at ${new Date().toISOString()}
`),i(`🔄 Touched tmp/restart.txt — Phusion Passenger reload initiated.`);try{setTimeout(()=>{console.log("[ExamJK] Webhook: Terminating worker process to force clean reload..."),process.exit(0)},1e3),i(`⚡ Scheduled Node worker process restart in 1s.`)}catch{}}catch(e){i(`⚠️ Restart touch warning: ${e.message}`)}let g="";try{let e=await m('git log -1 --format="%h - %s (%ci)"',o);g=(String(e?.stdout||"")+" "+String(e?.stderr||"")).trim(),i(`📌 Current deployed commit: ${g}`)}catch(e){i(`⚠️ Could not read latest commit: ${e.message}`)}return{success:!0,latestCommit:g,logs:a}}async function x(e){let t=await y(e);if(!t.authorized)return new Response(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:#f87171;">
        <h2>⛔ 401 Unauthorized</h2>
        <p>You must provide a valid secret key or be logged in as Super Admin.</p>
        <p style="color:#94a3b8;font-size:14px;">Example: <code>https://examjk.com/api/webhook/deploy?key=examjk_deploy_2026</code></p>
      </body></html>`,{status:401,headers:{"Content-Type":"text/html"}});let r=new URL(e.url),a=f(),i=r.searchParams.get("format"),o=e.headers.get("accept")||"",s=!!(r.searchParams.get("restore_db")||r.searchParams.get("reset_db"));try{let e=await b(a,s);if("json"===i||o.includes("application/json"))return n.NextResponse.json(e);let r=e.logs.map(e=>`<div style="margin: 4px 0; font-family: monospace;">${w(e)}</div>`).join(""),c=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ExamJK Live Deployment Console</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      padding: 30px;
      margin: 0;
    }
    .card {
      max-width: 900px;
      margin: 0 auto;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .header {
      padding: 20px 24px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: #10b981;
      color: #064e3b;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      text-transform: uppercase;
    }
    .terminal {
      background: #030712;
      padding: 24px;
      color: #34d399;
      font-size: 13.5px;
      line-height: 1.6;
      max-height: 550px;
      overflow-y: auto;
      border-top: 1px solid #1f2937;
    }
    .footer {
      padding: 16px 24px;
      background: #0f172a;
      border-top: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #94a3b8;
    }
    .btn {
      background: #2563eb;
      color: #ffffff;
      padding: 8px 18px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      display: inline-block;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">
        <span>⚡ ExamJK Real-Time cPanel Deployment</span>
      </div>
      <div class="badge">Deployed & Active</div>
    </div>
    <div class="terminal">
      ${r}
    </div>
    <div class="footer">
      <div>Authorized by: <strong style="color: #cbd5e1;">${w(t.user)}</strong></div>
      <div>
        <a href="/api/webhook/deploy?key=${encodeURIComponent(h)}" class="btn">🔄 Re-Pull Latest Git</a>
        <a href="/admin/dictionary" class="btn" style="background: #374151; margin-left: 8px;">Open Dictionary</a>
      </div>
    </div>
  </div>
</body>
</html>`;return new Response(c,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate"}})}catch(e){return n.NextResponse.json({success:!1,error:e.message},{status:500})}}async function v(e){let t=await y(e);if(!t.authorized)return n.NextResponse.json({error:"Unauthorized",message:"Invalid deploy secret."},{status:401});let r=f(),a=new URL(e.url),i=!!(a.searchParams.get("restore_db")||a.searchParams.get("reset_db"));try{let e=await b(r,i);return n.NextResponse.json({success:!0,user:t.user,latestCommit:e.latestCommit,logs:e.logs})}catch(e){return n.NextResponse.json({success:!1,error:e.message},{status:500})}}function w(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}let S=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/webhook/deploy/route",pathname:"/api/webhook/deploy",filename:"route",bundlePath:"app/api/webhook/deploy/route"},resolvedPagePath:"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/api/webhook/deploy/route.js",nextConfigOutput:"",userland:a}),{requestAsyncStorage:k,staticGenerationAsyncStorage:T,serverHooks:E}=S,R="/api/webhook/deploy/route";function $(){return(0,s.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:T})}},68408:(e,t,r)=>{r.d(t,{Gv:()=>d,WX:()=>u,c_:()=>l,fT:()=>p,xn:()=>m});var a=r(42023),i=r(6091),o=r(6176),s=r(71615);let n=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let c=new TextEncoder().encode(n);async function l(e){return await a.hash(e,10)}async function d(e,t){return await a.compare(e,t)}async function p(e){return await new i.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(c)}async function u(e){try{let{payload:t}=await (0,o._)(e,c);return t}catch(e){return null}}async function m(e){try{let t=null;if(e){let r=e.cookies.get("sigma_session")?.value||e.cookies.get("sigma_token")?.value;if(r)t=r;else{let r=e.headers.get("authorization");r&&r.startsWith("Bearer ")&&(t=r.split(" ")[1])}}else{let e=(0,s.cookies)();t=e.get("sigma_session")?.value||e.get("sigma_token")?.value}if(!t)return null;return await u(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[8948,3881,5972],()=>r(87537));module.exports=a})();