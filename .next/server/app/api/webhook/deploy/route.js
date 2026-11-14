"use strict";(()=>{var e={};e.id=6847,e.ids=[6847],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},1282:e=>{e.exports=require("child_process")},4770:e=>{e.exports=require("crypto")},2048:e=>{e.exports=require("fs")},5315:e=>{e.exports=require("path")},2254:e=>{e.exports=require("node:buffer")},6005:e=>{e.exports=require("node:crypto")},7261:e=>{e.exports=require("node:util")},7537:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>j,patchFetch:()=>R,requestAsyncStorage:()=>S,routeModule:()=>w,serverHooks:()=>$,staticGenerationAsyncStorage:()=>T});var i={};r.r(i),r.d(i,{GET:()=>b,POST:()=>k,dynamic:()=>m});var o=r(9303),a=r(8716),s=r(670),n=r(7070),c=r(1282);let d=require("util");var l=r(8408),p=r(2048),u=r(5315);let g=(0,d.promisify)(c.exec),m="force-dynamic",h=process.env.DEPLOY_SECRET||"examjk_deploy_2026";async function y(e){let t=new URL(e.url),r=t.searchParams.get("key")||t.searchParams.get("secret");if(r&&r===h)return{authorized:!0,user:"Secret Key Token"};let i=e.headers.get("x-deploy-key")||e.headers.get("x-deploy-secret");if(i&&i===h)return{authorized:!0,user:"Header Token"};let o=e.headers.get("x-github-event");if(o&&r===h)return{authorized:!0,user:`GitHub Webhook (${o})`};try{let t=await (0,l.xn)(e);if(t&&"admin"===t.role)return{authorized:!0,user:t.name||t.email||"Admin User"}}catch{}return{authorized:!1}}function f(){let e="/home/examjkco/repositories/Sigma-UBT";return p.existsSync(e)?e:process.cwd()}async function x(e){let t=[],r=e=>t.push(`[${new Date().toISOString().slice(11,19)}] ${e}`),i={cwd:e,env:{...process.env,PATH:`${process.env.PATH||""}:/usr/local/bin:/usr/bin:/bin:/usr/local/cpanel/3rdparty/bin:/opt/cpanel/ea-git/bin`}};r(`📁 Working directory: ${e}`);let o=u.join(e,"prisma","dev.db"),a=u.join(e,"prisma","dev.db.cpanel_backup");if(p.existsSync(o))try{p.copyFileSync(o,a),r(`🛡️ Backed up SQLite database to prisma/dev.db.cpanel_backup`)}catch(e){r(`⚠️ Database backup warning: ${e.message}`)}try{let e=await g("git stash --include-untracked",i),t=String(e?.stdout||"").trim();r(`📦 Git stash: ${t||"No local untracked conflicts"}`)}catch(e){r(`⚠️ Git stash notice: ${e.message}`)}try{r(`🌐 Fetching latest changes from origin/main...`);try{await g("rm -f .git/index.lock .git/refs/remotes/origin/*\\ *",i)}catch{}let{stdout:e,stderr:t}=await g("git fetch origin main --force",i),o=e?String(e).trim():"",a=t?String(t).trim():"";o&&r(`⬇️ Fetch output:
${o}`),a&&r(`ℹ️ Fetch details: ${a}`)}catch(e){throw r(`❌ Git fetch failed: ${e.message}`),Error(`Git fetch failed: ${e.message}`)}try{r(`🔄 Resetting local tree to origin/main...`);let{stdout:e}=await g("git reset --hard origin/main",i),t=e?String(e).trim():"";r(`✅ Reset output:
${t}`)}catch(e){throw r(`❌ Git reset failed: ${e.message}`),Error(`Git reset failed: ${e.message}`)}let s=u.join(e,"node_modules");try{let e=p.lstatSync(s);e.isDirectory()&&!e.isSymbolicLink()&&(r(`🧹 Cleaning conflicting physical node_modules for CloudLinux symlink compatibility...`),p.rmSync(s,{recursive:!0,force:!0}))}catch{}try{r(`🐍 Ensuring edge-tts python dependency is installed...`);let e=await g("python3 -m pip install --user --upgrade edge-tts 2>&1 || pip3 install --user --upgrade edge-tts 2>&1",i),t=String(e?.stdout||"").trim();t&&r(`🐍 Pip details: ${t.slice(0,150)}`),r(`✅ edge-tts package verified.`);try{let e=await g("python3 --version 2>&1",i);r(`🐍 Python version: ${String(e.stdout||"").trim()}`);let t=await g('python3 -c "import sys; print(sys.path); import edge_tts; print(edge_tts.__file__)" 2>&1',i);r(`🐍 Edge_tts file: ${String(t.stdout||"").trim()}`)}catch(e){r(`❌ Python check error: ${e.stdout||e.stderr||e.message}`)}}catch(e){r(`ℹ️ edge-tts pip check notice: ${e.message}`)}let n=u.join(e,"tmp"),d=u.join(n,"restart.txt");try{p.existsSync(n)||p.mkdirSync(n,{recursive:!0}),p.writeFileSync(d,`Restart triggered by ExamJK Deploy at ${new Date().toISOString()}
`),r(`🔄 Touched tmp/restart.txt — Phusion Passenger reload initiated.`);try{(0,c.exec)("nohup sh -c 'sleep 3 && pkill -9 -u examjkco node' >/dev/null 2>&1 &"),r(`⚡ Scheduled background node worker refresh (pkill) in 3s.`)}catch{}}catch(e){r(`⚠️ Restart touch warning: ${e.message}`)}let l="";try{let e=await g('git log -1 --format="%h - %s (%cr) by %an"',i);l=String(e?.stdout||"").trim(),r(`📌 Current deployed commit: ${l}`)}catch(e){r(`⚠️ Could not read latest commit: ${e.message}`)}return{success:!0,latestCommit:l,logs:t}}async function b(e){let t=await y(e);if(!t.authorized)return new Response(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#0f172a;color:#f87171;">
        <h2>⛔ 401 Unauthorized</h2>
        <p>You must provide a valid secret key or be logged in as Super Admin.</p>
        <p style="color:#94a3b8;font-size:14px;">Example: <code>https://examjk.com/api/webhook/deploy?key=examjk_deploy_2026</code></p>
      </body></html>`,{status:401,headers:{"Content-Type":"text/html"}});let r=new URL(e.url),i=f(),o=r.searchParams.get("format"),a=e.headers.get("accept")||"";try{let e=await x(i);if("json"===o||a.includes("application/json"))return n.NextResponse.json(e);let r=e.logs.map(e=>`<div style="margin: 4px 0; font-family: monospace;">${v(e)}</div>`).join(""),s=`<!DOCTYPE html>
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
      <div>Authorized by: <strong style="color: #cbd5e1;">${v(t.user)}</strong></div>
      <div>
        <a href="/api/webhook/deploy?key=${encodeURIComponent(h)}" class="btn">🔄 Re-Pull Latest Git</a>
        <a href="/admin/dictionary" class="btn" style="background: #374151; margin-left: 8px;">Open Dictionary</a>
      </div>
    </div>
  </div>
</body>
</html>`;return new Response(s,{status:200,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store, no-cache, must-revalidate"}})}catch(e){return n.NextResponse.json({success:!1,error:e.message},{status:500})}}async function k(e){let t=await y(e);if(!t.authorized)return n.NextResponse.json({error:"Unauthorized",message:"Invalid deploy secret."},{status:401});let r=f();try{let e=await x(r);return n.NextResponse.json({success:!0,user:t.user,latestCommit:e.latestCommit,logs:e.logs})}catch(e){return n.NextResponse.json({success:!1,error:e.message},{status:500})}}function v(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}let w=new o.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/webhook/deploy/route",pathname:"/api/webhook/deploy",filename:"route",bundlePath:"app/api/webhook/deploy/route"},resolvedPagePath:"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/api/webhook/deploy/route.js",nextConfigOutput:"",userland:i}),{requestAsyncStorage:S,staticGenerationAsyncStorage:T,serverHooks:$}=w,j="/api/webhook/deploy/route";function R(){return(0,s.patchFetch)({serverHooks:$,staticGenerationAsyncStorage:T})}},8408:(e,t,r)=>{r.d(t,{Gv:()=>l,WX:()=>u,c_:()=>d,fT:()=>p,xn:()=>g});var i=r(2023),o=r(6091),a=r(6176),s=r(1615);let n=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let c=new TextEncoder().encode(n);async function d(e){return await i.hash(e,10)}async function l(e,t){return await i.compare(e,t)}async function p(e){return await new o.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(c)}async function u(e){try{let{payload:t}=await (0,a._)(e,c);return t}catch(e){return null}}async function g(e){try{let t=null;if(e){let r=e.cookies.get("sigma_session")?.value;if(r)t=r;else{let r=e.headers.get("authorization");r&&r.startsWith("Bearer ")&&(t=r.split(" ")[1])}}else{let e=(0,s.cookies)();t=e.get("sigma_session")?.value}if(!t)return null;return await u(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[8948,3881,5972],()=>r(7537));module.exports=i})();