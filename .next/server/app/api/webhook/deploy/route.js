"use strict";(()=>{var e={};e.id=6847,e.ids=[6847],e.modules={3524:e=>{e.exports=require("@prisma/client")},2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1282:e=>{e.exports=require("child_process")},4770:e=>{e.exports=require("crypto")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},1568:e=>{e.exports=require("zlib")},2254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},7261:e=>{e.exports=require("node:util")},7537:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>R,patchFetch:()=>$,requestAsyncStorage:()=>S,routeModule:()=>k,serverHooks:()=>E,staticGenerationAsyncStorage:()=>T});var r={};a.r(r),a.d(r,{GET:()=>x,POST:()=>v,dynamic:()=>g});var i=a(9303),o=a(8716),s=a(670),n=a(7070),c=a(1282);let l=require("util");var d=a(8408),p=a(2048),u=a(5315);let m=(0,l.promisify)(c.exec),g="force-dynamic",h=process.env.DEPLOY_SECRET||"examjk_deploy_2026";async function y(e){let t=new URL(e.url),a=t.searchParams.get("key")||t.searchParams.get("secret");if(a&&a===h)return{authorized:!0,user:"Secret Key Token"};let r=e.headers.get("x-deploy-key")||e.headers.get("x-deploy-secret");if(r&&r===h)return{authorized:!0,user:"Header Token"};let i=e.headers.get("x-github-event");if(i&&a===h)return{authorized:!0,user:`GitHub Webhook (${i})`};try{let t=await (0,d.xn)(e);if(t&&"admin"===t.role)return{authorized:!0,user:t.name||t.email||"Admin User"}}catch{}return{authorized:!1}}function f(){let e="/home/examjkco/repositories/Sigma-UBT";return p.existsSync(e)?e:process.cwd()}async function b(e,t=!1){let r=[],i=e=>r.push(`[${new Date().toISOString().slice(11,19)}] ${e}`),o={cwd:e,env:{...process.env,PATH:`/opt/alt/python311/bin:/opt/alt/python310/bin:/opt/alt/python39/bin:/opt/alt/python38/bin:${process.env.PATH||""}:/usr/local/bin:/usr/bin:/bin:/usr/local/cpanel/3rdparty/bin:/opt/cpanel/ea-git/bin`}};i(`📁 Working directory: ${e}`);let s=u.join(e,"prisma","dev.db"),n=u.join(e,"prisma","dev.db.cpanel_backup");if(p.existsSync(s))try{p.copyFileSync(s,n),i(`🛡️ Backed up SQLite database to prisma/dev.db.cpanel_backup`)}catch(e){i(`⚠️ Database backup warning: ${e.message}`)}try{let e=await m("git stash",o),t=String(e?.stdout||"").trim();i(`📦 Git stash: ${t||"No local untracked conflicts"}`)}catch(e){i(`⚠️ Git stash notice: ${e.message}`)}try{i(`🌐 Fetching latest changes from origin/main...`);try{await m("rm -f .git/index.lock .git/refs/remotes/origin/*\\ *",o)}catch{}let{stdout:e,stderr:t}=await m("git fetch origin main --force",o),a=e?String(e).trim():"",r=t?String(t).trim():"";a&&i(`⬇️ Fetch output:
${a}`),r&&i(`ℹ️ Fetch details: ${r}`)}catch(e){throw i(`❌ Git fetch failed: ${e.message}`),Error(`Git fetch failed: ${e.message}`)}try{i(`🔄 Resetting local tree to origin/main...`);let{stdout:e}=await m("git reset --hard origin/main",o),t=e?String(e).trim():"";i(`✅ Reset output:
${t}`)}catch(e){throw i(`❌ Git reset failed: ${e.message}`),Error(`Git reset failed: ${e.message}`)}try{let r=u.join(e,"prisma","dev.db.template.gz"),o=t||!p.existsSync(s);if(!o&&p.existsSync(s))try{if(p.statSync(s).size<1e4)o=!0;else{let{default:e}=await a.e(7598).then(a.bind(a,7598)),t=await e.examSet.findFirst({select:{id:!0,name:!0,isFree:!0}});i(`✅ SQLite database verified (Active sample set: ${t?.name||"Available"})`)}}catch(e){i(`⚠️ SQLite corrupt / malformed: ${e.message}. Restoring from clean template...`),o=!0}if(o&&p.existsSync(r)){i(`📦 Restoring pristine SQLite database from dev.db.template.gz...`);let e=await Promise.resolve().then(a.t.bind(a,1568,19)),t=p.readFileSync(r),o=e.gunzipSync(t);p.writeFileSync(s,o),i(`🎉 Database successfully restored from template! (${o.length} bytes, 100+ UBT & Chapterwise sets ready)`)}}catch(e){i(`⚠️ Database verification notice: ${e.message}`)}try{i(`⚙️ Ensuring SQLite columns exist in dev.db...`);let{default:e}=await a.e(7598).then(a.bind(a,7598));for(let t of["ALTER TABLE BillRecord ADD COLUMN nextPaymentDate TEXT;","ALTER TABLE BillRecord ADD COLUMN nextPaymentDays INTEGER;","ALTER TABLE BillRecord ADD COLUMN admittedDate TEXT;","ALTER TABLE BillRecord ADD COLUMN classTime TEXT;","ALTER TABLE BillRecord ADD COLUMN parentName TEXT;"])try{await e.$executeRawUnsafe(t)}catch(e){}i(`✅ SQLite schema columns verified.`);try{await e.$executeRawUnsafe("UPDATE BillingProfile SET googleSheetUrl = ? WHERE instituteId IN ('default-institute', 'd932da89-c112-45ba-85b3-76cb742ff9c2', '90e5713b-5d1c-4351-bc19-3b0d7c17ef95', '686e3813-ad09-42cb-99d7-d28dc5cea44c') OR companyName LIKE '%SIGMA%';","https://script.google.com/macros/s/AKfycbxL8QJVF4_IzcCPSbIwOcQorTX19KPVgb6Y0xOMfOQOLQcmCwblhStD0nEgmXirXoreFQ/exec"),i(`✅ Authoritative Sigma Google Sheet webhook verified in database.`)}catch(e){i(`ℹ️ Profile webhook update notice: ${e.message}`)}}catch(e){i(`ℹ️ Schema check notice: ${e.message}`)}try{i(`🔄 Updating Prisma Client binary on server...`),await m("node ./node_modules/prisma/build/index.js generate",o),i(`✅ Prisma Client generated on server.`)}catch(e){i(`ℹ️ Prisma generate notice: ${e.message}`)}let l=u.join(e,"node_modules");try{let e=p.lstatSync(l);e.isDirectory()&&!e.isSymbolicLink()&&(i(`🧹 Cleaning conflicting physical node_modules for CloudLinux symlink compatibility...`),p.rmSync(l,{recursive:!0,force:!0}))}catch{}try{i(`🐍 Ensuring edge-tts python dependency is installed...`);let e=`
      for p in /opt/alt/python311/bin/python3 /opt/alt/python310/bin/python3 /opt/alt/python39/bin/python3 /usr/bin/python3 python3; do
        if [ -x "$p" ]; then
          $p -m pip install --user --upgrade edge-tts 2>&1 && break
        fi
      done
    `,t=await m(e,o),a=String(t?.stdout||"").trim();a&&i(`🐍 Pip details: ${a.slice(0,150)}`),i(`✅ edge-tts package verified.`)}catch(e){i(`ℹ️ edge-tts pip check notice: ${e.message}`)}try{let t=u.join(e,"public","audio-cache","elevenlabs");if(p.existsSync(t)){let e=p.readdirSync(t),a=0;for(let r of e)if(r.endsWith(".mp3"))try{p.unlinkSync(u.join(t,r)),a++}catch{}a>0&&i(`🧹 Purged ${a} stale audio cache files.`)}}catch(e){i(`ℹ️ Cache purge notice: ${e.message}`)}let d=u.join(e,"tmp"),g=u.join(d,"restart.txt");try{p.existsSync(d)||p.mkdirSync(d,{recursive:!0}),p.writeFileSync(g,`Restart triggered by ExamJK Deploy at ${new Date().toISOString()}
`),i(`🔄 Touched tmp/restart.txt — Phusion Passenger reload initiated.`);try{(0,c.exec)("nohup sh -c 'sleep 3 && pkill -9 -u examjkco node' >/dev/null 2>&1 &"),i(`⚡ Scheduled background node worker refresh (pkill) in 3s.`)}catch{}}catch(e){i(`⚠️ Restart touch warning: ${e.message}`)}let h="";try{let e=await m("git log -1 --oneline",o);h=String(e?.stdout||"").trim(),i(`📌 Current deployed commit: ${h}`)}catch(e){i(`⚠️ Could not read latest commit: ${e.message}`)}return{success:!0,latestCommit:h,logs:r}}async function x(e){let t=await y(e);if(!t.authorized)return new Response(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:#f87171;">
        <h2>⛔ 401 Unauthorized</h2>
        <p>You must provide a valid secret key or be logged in as Super Admin.</p>
        <p style="color:#94a3b8;font-size:14px;">Example: <code>https://examjk.com/api/webhook/deploy?key=examjk_deploy_2026</code></p>
      </body></html>`,{status:401,headers:{"Content-Type":"text/html"}});let a=new URL(e.url),r=f(),i=a.searchParams.get("format"),o=e.headers.get("accept")||"",s=!!(a.searchParams.get("restore_db")||a.searchParams.get("reset_db"));try{let e=await b(r,s);if("json"===i||o.includes("application/json"))return n.NextResponse.json(e);let a=e.logs.map(e=>`<div style="margin: 4px 0; font-family: monospace;">${w(e)}</div>`).join(""),c=`<!DOCTYPE html>
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
      ${a}
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
</html>`;return new Response(c,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate"}})}catch(e){return n.NextResponse.json({success:!1,error:e.message},{status:500})}}async function v(e){let t=await y(e);if(!t.authorized)return n.NextResponse.json({error:"Unauthorized",message:"Invalid deploy secret."},{status:401});let a=f(),r=new URL(e.url),i=!!(r.searchParams.get("restore_db")||r.searchParams.get("reset_db"));try{let e=await b(a,i);return n.NextResponse.json({success:!0,user:t.user,latestCommit:e.latestCommit,logs:e.logs})}catch(e){return n.NextResponse.json({success:!1,error:e.message},{status:500})}}function w(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}let k=new i.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/webhook/deploy/route",pathname:"/api/webhook/deploy",filename:"route",bundlePath:"app/api/webhook/deploy/route"},resolvedPagePath:"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/api/webhook/deploy/route.js",nextConfigOutput:"",userland:r}),{requestAsyncStorage:S,staticGenerationAsyncStorage:T,serverHooks:E}=k,R="/api/webhook/deploy/route";function $(){return(0,s.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:T})}},8408:(e,t,a)=>{a.d(t,{Gv:()=>d,WX:()=>u,c_:()=>l,fT:()=>p,xn:()=>m});var r=a(2023),i=a(6091),o=a(6176),s=a(1615);let n=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let c=new TextEncoder().encode(n);async function l(e){return await r.hash(e,10)}async function d(e,t){return await r.compare(e,t)}async function p(e){return await new i.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(c)}async function u(e){try{let{payload:t}=await (0,o._)(e,c);return t}catch(e){return null}}async function m(e){try{let t=null;if(e){let a=e.cookies.get("sigma_session")?.value||e.cookies.get("sigma_token")?.value;if(a)t=a;else{let a=e.headers.get("authorization");a&&a.startsWith("Bearer ")&&(t=a.split(" ")[1])}}else{let e=(0,s.cookies)();t=e.get("sigma_session")?.value||e.get("sigma_token")?.value}if(!t)return null;return await u(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[8948,3881,5972],()=>a(7537));module.exports=r})();