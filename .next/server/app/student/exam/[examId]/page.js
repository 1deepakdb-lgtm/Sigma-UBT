(()=>{var e={};e.id=4663,e.ids=[4663],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},84770:e=>{"use strict";e.exports=require("crypto")},72254:e=>{"use strict";e.exports=require("node:buffer")},6005:e=>{"use strict";e.exports=require("node:crypto")},47261:e=>{"use strict";e.exports=require("node:util")},47631:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>a.a,__next_app__:()=>u,originalPathname:()=>p,pages:()=>c,routeModule:()=>f,tree:()=>d}),n(3277),n(78440),n(56437),n(91837);var i=n(23191),o=n(88716),r=n(37922),a=n.n(r),s=n(95231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);n.d(t,l);let d=["",{children:["student",{children:["exam",{children:["[examId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.bind(n,3277)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,78440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(n.bind(n,56437)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(n.bind(n,91837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],c=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"],p="/student/exam/[examId]/page",u={require:n,loadChunk:()=>Promise.resolve()},f=new i.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/student/exam/[examId]/page",pathname:"/student/exam/[examId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},6473:(e,t,n)=>{Promise.resolve().then(n.bind(n,74387))},95359:(e,t,n)=>{Promise.resolve().then(n.bind(n,92766))},74387:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>s});var i=n(10326),o=n(17577);n(90434);var r=n(35047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let a=({logoUrl:e="",instituteName:t="",opacity:n=.16})=>e?(0,i.jsxs)("div",{style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",pointerEvents:"none",userSelect:"none",opacity:n,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1,maxWidth:"85%",maxHeight:"85%"},children:[i.jsx("img",{src:e,alt:"Institute Logo Watermark",style:{maxHeight:"140px",maxWidth:"250px",width:"auto",height:"auto",objectFit:"contain",filter:"grayscale(20%)"},draggable:"false"}),t&&i.jsx("span",{style:{fontSize:"13px",fontWeight:"800",color:"#0284c7",marginTop:"6px",textAlign:"center",letterSpacing:"0.5px"},children:t})]}):i.jsx("div",{style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",pointerEvents:"none",userSelect:"none",opacity:n,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1},children:(0,i.jsxs)("svg",{width:"240",height:"150",viewBox:"0 0 240 150",fill:"none",children:[i.jsx("path",{d:"M65 118 H175 A38 38 0 0 0 175 42 A48 48 0 0 0 82 50 A32 32 0 0 0 65 118 Z",fill:"#38bdf8",fillOpacity:"0.25"}),i.jsx("text",{x:"120",y:"55",textAnchor:"middle",fill:"#0284c7",fontSize:"19",fontWeight:"900",fontFamily:"sans-serif",children:"EPS"}),i.jsx("text",{x:"120",y:"76",textAnchor:"middle",fill:"#0284c7",fontSize:"19",fontWeight:"900",fontFamily:"sans-serif",children:"TOPIK"}),i.jsx("text",{x:"120",y:"98",textAnchor:"middle",fill:"#db2777",fontSize:"14",fontWeight:"800",fontFamily:"sans-serif",children:"Exam Korean"}),i.jsx("text",{x:"120",y:"116",textAnchor:"middle",fill:"#0284c7",fontSize:"15",fontWeight:"800",fontFamily:"sans-serif",children:"UBT APP"})]})}),s=()=>{let e=(0,r.useRouter)(),t=(0,r.useParams)(),n=t?.examId,[s,l]=(0,o.useState)(""),[d,c]=(0,o.useState)(""),[p,u]=(0,o.useState)(""),[f,x]=(0,o.useState)(null),[m,g]=(0,o.useState)(!1),[h,b]=(0,o.useState)(1),[y,v]=(0,o.useState)(!1),[w,S]=(0,o.useState)("all"),[j,k]=(0,o.useState)("single"),[I,C]=(0,o.useState)(!1),[z,N]=(0,o.useState)([]),[E,R]=(0,o.useState)(0),[T,L]=(0,o.useState)({}),[W,A]=(0,o.useState)(3e3),[_,O]=(0,o.useState)(`Chapterwise 0${n}`),[P,H]=(0,o.useState)(!1),[q,U]=(0,o.useState)(null),[D,B]=(0,o.useState)(!1),[M,$]=(0,o.useState)(null);(0,o.useEffect)(()=>{try{e.prefetch("/student/result"),e.prefetch("/student")}catch(e){}},[e]),(0,o.useEffect)(()=>{try{let e=localStorage.getItem("currentUser")||localStorage.getItem("currentStudentName")||"Student";l(e);let t=localStorage.getItem("currentInstituteLogo");t&&c(t);let n=localStorage.getItem("currentInstituteName");n&&u(n);let i=JSON.parse(localStorage.getItem("institutes")||"[]");i[0]?.logoUrl&&!t&&c(i[0].logoUrl),i[0]?.name&&!n&&u(i[0].name),fetch("/api/auth/me").then(e=>e.json()).then(e=>{e?.user?.institute?.logoUrl&&(c(e.user.institute.logoUrl),localStorage.setItem("currentInstituteLogo",e.user.institute.logoUrl)),e?.user?.institute?.name&&(u(e.user.institute.name),localStorage.setItem("currentInstituteName",e.user.institute.name)),(e?.user?.name||e?.user?.username)&&l(e.user.name||e.user.username)}).catch(()=>{})}catch(e){}},[]),(0,o.useEffect)(()=>{let e=async()=>{try{screen.orientation&&"function"==typeof screen.orientation.lock?await screen.orientation.lock("landscape").catch(()=>{}):screen.lockOrientation?screen.lockOrientation("landscape"):screen.webkitLockOrientation?screen.webkitLockOrientation("landscape"):screen.mozLockOrientation&&screen.mozLockOrientation("landscape")}catch(e){}};return window.addEventListener("orientationchange",e),screen.orientation&&screen.orientation.addEventListener("change",e),e(),()=>{window.removeEventListener("orientationchange",e),screen.orientation&&screen.orientation.removeEventListener("change",e)}},[]),(0,o.useEffect)(()=>{if(y)return;let e=setInterval(()=>{b(t=>{if(t>=100)return clearInterval(e),100;if(0===z.length&&t>=85)return 85;let n=Math.min(100,t+(Math.floor(8*Math.random())+6));return n>=100&&clearInterval(e),n})},100);return()=>clearInterval(e)},[z.length,y]),(0,o.useEffect)(()=>{if(h>=100&&z.length>0&&!y){let e=setTimeout(()=>{v(!0),g(!0),es()},300);return()=>clearTimeout(e)}},[h,z.length,y]);let F=(0,o.useRef)(null),J=(0,o.useRef)({}),Q=(0,o.useRef)(0),G=(0,o.useRef)({}),Y=(0,o.useRef)(null),K=(0,o.useRef)({}),[X,Z]=(0,o.useState)(!1),[V,ee]=(0,o.useState)({}),[et,en]=(0,o.useState)(!1),[ei,eo]=(0,o.useState)(null),[er,ea]=(0,o.useState)({});(0,o.useEffect)(()=>{(async function(){try{let t=await fetch(`/api/student/exams/${n||"set-1-demo"}/start`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentPhone:""})});if(t.ok){let e=await t.json();if(e.questions&&e.questions.length>0){let t=[...e.questions];if(t.length<40)for(let e=t.length+1;e<=40;e++)t.push({id:`q_gen_${e}`,qIndex:e,type:e<=20?"Reading":"Listening",mainHeading:e<=20?`[ ${e} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${e} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["1","2","3","4"],answer:0});N(t),e.answerSheet&&ea(e.answerSheet),eo(e.sessionId),e.examName&&O(e.examName),e.instituteLogoUrl?(c(e.instituteLogoUrl),localStorage.setItem("currentInstituteLogo",e.instituteLogoUrl)):e.watermark&&(e.watermark.startsWith("http")||e.watermark.startsWith("/"))&&(c(e.watermark),localStorage.setItem("currentInstituteLogo",e.watermark)),e.instituteName&&(u(e.instituteName),localStorage.setItem("currentInstituteName",e.instituteName));try{localStorage.setItem(`offline_ubt_exam_${n||"set-1-demo"}`,JSON.stringify({questions:t,answerSheet:e.answerSheet||{},sessionId:e.sessionId,examName:e.examName,duration:e.duration,expiresAt:e.expiresAt,cachedAt:Date.now()}))}catch(e){console.warn("Could not write offline exam cache:",e)}return}}else{let n=await t.json().catch(()=>({}));if(401===t.status||403===t.status){alert(n.error||"This exam set requires payment of Rs. 30. Please unlock via eSewa to take this test."),e.push("/student");return}console.warn("Backend start API status:",t.status,n)}}catch(e){console.warn("Backend start API network error (attempting offline cache):",e);try{let e=localStorage.getItem(`offline_ubt_exam_${n||"set-1-demo"}`);if(e){let t=JSON.parse(e);if(t.questions&&t.questions.length>=40){N(t.questions),t.answerSheet&&ea(t.answerSheet),eo(t.sessionId||`offline_${Date.now()}`),t.examName&&O(t.examName);return}}}catch(e){console.warn("Offline restore error:",e)}}let t=JSON.parse(localStorage.getItem("examSets"))||[],i=JSON.parse(localStorage.getItem("questionBank"))||[],o=t.find(e=>e.id.toString()===n?.toString()||e.name===n),r=o?o.name:`Chapterwise 0${n}`;O(r);let a={};if(a[""]||a[""],[].some(e=>e?.toString()===n?.toString()||e?.toString()===o?.id?.toString()||e?.toString()===o?.name?.toString()||e?.toString()===r?.toString()||"string"==typeof n&&e?.toString()===decodeURIComponent(n)),o&&o.creatorInstituteName&&!o.isPublished){let t={},n=("".toString().replace(/[^0-9]/g,"").slice(-10),e=>!1),i=null;for(let e in t)if((t[e]||[]).some(e=>n(e.phone))){i=e;break}if(!i||i.toLowerCase()!==o.creatorInstituteName.toLowerCase()){alert(`Access Restricted: This exam set is in the private bucket of "${o.creatorInstituteName}". Students from other institutes cannot access it.`),e.push("/student");return}}let s=o?o.packageName:"",l=i.filter(e=>e&&(e.setId?.toString()===n?.toString()||e.set===r||e.package===s&&e.set===r)),d=l.filter(e=>"Reading"===e.type),p=l.filter(e=>"Listening"===e.type),f=[];for(let e=1;e<=20;e++)d[e-1]?f.push({...d[e-1],id:d[e-1].id||e,type:"Reading"}):f.push({id:e,type:"Reading",mainHeading:`[ ${e} ] 다음을 읽고 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["가방","지갑","우산","이불"],answer:0});for(let e=1;e<=20;e++){let t=20+e;p[e-1]?f.push({...p[e-1],id:p[e-1].id||t,type:"Listening"}):f.push({id:t,type:"Listening",mainHeading:`[ ${t} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["듣기 1","듣기 2","듣기 3","듣기 4"],answer:0})}N(f);let x={};f.forEach(e=>{void 0!==e.answer&&null!==e.answer&&(x[e.id]=Number(e.answer),void 0!==e.qIndex&&(x[e.qIndex]=Number(e.answer)))}),ea(e=>({...x,...e}))})()},[n]),(0,o.useEffect)(()=>{Y.current&&clearTimeout(Y.current),Object.values(K.current).forEach(e=>clearTimeout(e)),K.current={},F.current&&(F.current.pause(),F.current.currentTime=0),Object.values(J.current).forEach(e=>{e&&(e.pause(),e.currentTime=0)}),Q.current=0,G.current={},Z(!1),ee({}),en(!1)},[E]),(0,o.useEffect)(()=>{},[n]),(0,o.useEffect)(()=>{},[T,E,W,m,n]);let es=()=>{try{"undefined"!=typeof document&&(document.body.classList.add("pdf-open","exam-fullscreen-active"),document.documentElement.classList.add("pdf-open","exam-fullscreen-active"))}catch(e){}};(0,o.useEffect)(()=>{es();let e=()=>{es()},t=()=>{"visible"===document.visibilityState&&es()};return window.addEventListener("orientationchange",e),window.addEventListener("resize",e),document.addEventListener("visibilitychange",t),document.addEventListener("fullscreenchange",e),()=>{window.removeEventListener("orientationchange",e),window.removeEventListener("resize",e),document.removeEventListener("visibilitychange",t),document.removeEventListener("fullscreenchange",e);try{"undefined"!=typeof document&&(document.body.classList.remove("pdf-open","exam-fullscreen-active"),document.documentElement.classList.remove("pdf-open","exam-fullscreen-active"))}catch(e){}}},[]);let el=()=>{try{"undefined"!=typeof document&&(document.fullscreenElement||document.webkitFullscreenElement)?document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitExitFullscreen&&document.webkitExitFullscreen():es()}catch(e){}},ed=e=>{let t=Math.floor(e/60).toString().padStart(2,"0"),n=(e%60).toString().padStart(2,"0");return`${t}:${n}`},ec=e=>{let t=z[E];L({...T,[t.id]:e})},ep=()=>{0===Q.current&&(Q.current=1,Z(!0),en(!0))},eu=()=>{1===Q.current?(Y.current&&clearTimeout(Y.current),Y.current=setTimeout(()=>{F.current&&1===Q.current&&(Q.current=2,F.current.currentTime=0,F.current.play().catch(e=>console.log("Audio 2nd play error:",e)))},3e3)):Q.current>=2&&en(!1)},ef=async()=>{try{Y.current&&clearTimeout(Y.current),Object.values(K.current).forEach(e=>clearTimeout(e)),F.current&&F.current.pause(),Object.values(J.current).forEach(e=>e&&e.pause());let t=z.map((e,t)=>{let n=er[e.id]??er[String(e.id)]??er[e.qIndex]??er[String(e.qIndex)]??er[t+1]??e.answer,i=null!=n?Number(n):0;return{...e,answer:i}}),i=0,o=0,r=0,a=0,s={};t.forEach((e,t)=>{let n=void 0!==e.id?e.id:t+1,l=void 0!==e.qIndex?e.qIndex:t+1,d=void 0!==T[e.id]?T[e.id]:void 0!==T[String(e.id)]?T[String(e.id)]:void 0!==T[l]?T[l]:void 0!==T[String(l)]?T[String(l)]:T[t];if(null!=d&&""!==d){let c=Number(d);s[n]=c,s[String(n)]=c,s[l]=c,s[String(l)]=c,s[t]=c,a+=1;let p=void 0!==e.answer&&null!==e.answer?Number(e.answer):void 0,u=!1;void 0!==p&&(c===p||c+1===p)&&(u=!0),u&&(i+=1,e.type&&"reading"===e.type.toLowerCase()||l<=20||t<20?o+=1:r+=1)}});let l=t.length>0?t.length:40,d=5*o,c=5*r,p=d+c,u=Math.round(i/l*100),f=u>=40||p>=96,x="Student",m={examName:_,score:i,total:l,attempted:a,readingCorrect:o,listeningCorrect:r,readingScore:d,listeningScore:c,totalScore:p,percentage:u,passed:f,questions:t,selectedAnswers:s,isOfflineSubmitted:!1,studentName:x,createdAt:new Date().toISOString()},g=!1;if("undefined"!=typeof navigator&&navigator.onLine)try{let e=new AbortController,o=setTimeout(()=>e.abort(),4500),r=await fetch(`/api/student/exams/${n||"set-1-demo"}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:ei||`offline_${Date.now()}`,selectedAnswers:s,studentName:x,studentPhone:""}),signal:e.signal});if(clearTimeout(o),r.ok){g=!0;let e=await r.json();if(e.result){let n=e.result;m.score=void 0!==n.correctAnswers?n.correctAnswers:i,m.total=n.totalQuestions||l,m.readingScore=n.readingScore??d,m.listeningScore=n.listeningScore??c,m.totalScore=n.totalScore??p,m.passed=!!n.passed,m.percentage=Math.round(m.score/m.total*100),Array.isArray(n.breakdown)&&(m.questions=t.map((e,t)=>{let i=n.breakdown.find(n=>n.qIndex===e.qIndex||n.qIndex===t+1);return i?{...e,answer:i.correctAnswer}:e}))}}}catch(e){console.warn("Submit API network notice (enqueuing for offline sync):",e)}if(!g){m.isOfflineSubmitted=!0;try{let e=JSON.parse(localStorage.getItem("offlineExamSyncQueue")||"[]");e.push({examId:n||"set-1-demo",sessionId:ei||`offline_${Date.now()}`,selectedAnswers:s,score:i,total:l,readingScore:d,listeningScore:c,totalScore:p,studentName:x,studentPhone:"",submittedAt:new Date().toISOString()}),localStorage.setItem("offlineExamSyncQueue",JSON.stringify(e))}catch(e){console.warn("Could not save to offline sync queue:",e)}}try{localStorage.removeItem(`active_exam_progress_${n||"set-1-demo"}`)}catch(e){}localStorage.setItem("lastExamResult",JSON.stringify(m));let h=JSON.parse(localStorage.getItem("examResults"))||[];localStorage.setItem("examResults",JSON.stringify([m,...h])),U(m),H(!0),C(!1);try{e.push("/student/result")}catch(e){console.warn("Offline router navigation notice (active in-page review fallback):",e)}}catch(t){console.error("Submission error:",t);try{e.push("/student/result")}catch(e){}}},ex=Object.keys(T).length,em=z.length-ex,eg={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"},eh=`
    .ubt-exam-wrapper {
      width: 100%;
      height: 100%;
      max-height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: relative;
      z-index: 1;
      background-color: #f8fafc;
    }
    .student-bottom-nav,
    .institute-bottom-nav,
    .navbar-bottom-nav,
    .student-header,
    .institute-top-nav,
    nav {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    .ubt-exam-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 100%;
      width: 100%;
      height: 100%;
      max-height: 100%;
      margin: 0;
      justify-content: stretch;
      min-height: 0;
      border-radius: 0;
      overflow: hidden;
      box-shadow: none;
    }
    .ubt-exam-header-bar,
    .ubt-overview-top-bar {
      display: flex !important;
      align-items: center !important;
      background-color: #f8fafc !important;
      color: #334155 !important;
      border-bottom: 1px solid #cbd5e1 !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
      padding-left: 14px !important;
      padding-right: 14px !important;
      font-size: 13.5px !important;
      font-weight: 600 !important;
      flex-shrink: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    .ubt-exam-card {
      background-color: #f8fafc !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      flex: 1 !important;
      min-height: 0 !important;
      overflow: hidden !important;
      padding: 8px 12px !important;
      gap: 8px !important;
    }
    .ubt-exam-columns {
      display: flex !important;
      flex: 1 !important;
      overflow: hidden !important;
      min-height: 0 !important;
      gap: 10px !important;
    }
    .ubt-exam-left {
      flex: 1.25 !important;
      background-color: #ffffff !important;
      border: 1.5px solid #cbd5e1 !important;
      border-radius: 12px !important;
      padding: 14px 18px !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      overflow-y: auto !important;
      height: 100% !important;
      min-height: 0 !important;
    }
    .ubt-exam-right {
      flex: 1 !important;
      background-color: #ffffff !important;
      border: 1.5px solid #cbd5e1 !important;
      border-radius: 12px !important;
      padding: 0 !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-evenly !important;
      overflow-y: auto !important;
      height: 100% !important;
      min-height: 0 !important;
    }
    .ubt-opt-row {
      display: flex !important;
      align-items: center !important;
      padding: 10px 18px !important;
      border-bottom: 1px solid #e2e8f0 !important;
      background-color: transparent !important;
      cursor: pointer !important;
      transition: background-color 0.15s ease !important;
      flex: 1 !important;
    }
    .ubt-opt-row:last-child {
      border-bottom: none !important;
    }
    .ubt-opt-selected {
      background-color: #dbeafe !important;
      box-shadow: inset 4px 0 0 #0284c7 !important;
    }
    .ubt-opt-badge {
      width: 32px !important;
      height: 32px !important;
      border-radius: 50% !important;
      border: 2px solid #94a3b8 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      color: #334155 !important;
      margin-right: 14px !important;
      flex-shrink: 0 !important;
      background-color: #ffffff !important;
      transition: all 0.15s ease !important;
    }
    .ubt-opt-selected .ubt-opt-badge,
    .ubt-opt-badge-selected {
      border-color: #0284c7 !important;
      background-color: #0284c7 !important;
      color: #ffffff !important;
    }
    .ubt-opt-text {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #1e293b !important;
      flex: 1 !important;
    }
    .ubt-opt-selected .ubt-opt-text {
      color: #0369a1 !important;
      font-weight: 700 !important;
    }
    .ubt-exam-nav-bar {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 4px 6px !important;
      flex-shrink: 0 !important;
      gap: 12px !important;
    }
    .ubt-exam-nav-bar button {
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.35) !important;
      transition: all 0.15s ease !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      border: none !important;
      border-radius: 9999px !important;
      padding: 9px 24px !important;
      cursor: pointer !important;
    }
    .ubt-exam-nav-bar button:disabled {
      opacity: 0.45 !important;
      cursor: not-allowed !important;
      box-shadow: none !important;
      transform: none !important;
    }

    /* FORCE LANDSCAPE: rotate entire exam when device is held in portrait, staying strictly below status bar insets */
    @media (orientation: portrait) {
      .ubt-exam-landscape-enforcer {
        position: fixed !important;
        top: env(safe-area-inset-top, 0px) !important;
        left: calc(100vw - env(safe-area-inset-right, 0px)) !important;
        left: calc(100dvw - env(safe-area-inset-right, 0px)) !important;
        width: calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
        width: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
        height: calc(100vw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;
        height: calc(100dvw - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)) !important;
        transform: rotate(90deg) !important;
        transform-origin: top left !important;
        overflow: hidden !important;
        z-index: 2147483640 !important;
        background-color: #f8fafc !important;
      }
    }
    @media (orientation: landscape) {
      .ubt-exam-landscape-enforcer {
        position: fixed !important;
        inset: 0 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding-top: env(safe-area-inset-top, 0px) !important;
        padding-right: env(safe-area-inset-right, 0px) !important;
        padding-bottom: env(safe-area-inset-bottom, 0px) !important;
        padding-left: env(safe-area-inset-left, 0px) !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        z-index: 2147483640 !important;
        background-color: #003b73 !important;
      }
    }

    /* Responsive Confirm Submission Modal */
    .ubt-confirm-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background-color: rgba(15, 23, 42, 0.72) !important;
      backdrop-filter: blur(3px) !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      z-index: 99999999 !important;
      padding: 12px !important;
      box-sizing: border-box !important;
    }
    .ubt-confirm-modal-card {
      background-color: #ffffff !important;
      padding: 24px 22px !important;
      border-radius: 18px !important;
      max-width: min(420px, 94vw) !important;
      width: 100% !important;
      max-height: 92dvh !important;
      overflow-y: auto !important;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
      box-sizing: border-box !important;
      text-align: center !important;
    }
    .ubt-confirm-modal-icon {
      width: 44px !important;
      height: 44px !important;
      border-radius: 50% !important;
      background-color: #e0f2fe !important;
      color: #0284c7 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 auto 10px auto !important;
    }
    .ubt-confirm-modal-title {
      margin: 0 0 6px 0 !important;
      color: #0f172a !important;
      font-size: 18px !important;
      font-weight: 800 !important;
    }
    .ubt-confirm-modal-text {
      color: #475569 !important;
      font-size: 13.5px !important;
      margin: 0 0 18px 0 !important;
      line-height: 1.45 !important;
    }
    .ubt-confirm-modal-actions {
      display: flex !important;
      justify-content: center !important;
      gap: 10px !important;
    }
    .ubt-confirm-btn-cancel {
      flex: 1 !important;
      background-color: #f1f5f9 !important;
      color: #475569 !important;
      border: 1px solid #cbd5e1 !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
    }
    .ubt-confirm-btn-submit {
      flex: 1 !important;
      background-color: #0284c7 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 10px 16px !important;
      border-radius: 8px !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      cursor: pointer !important;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35) !important;
      transition: all 0.15s ease !important;
    }
  `;if(!m||!y||0===z.length)return(0,i.jsxs)("div",{className:"ubt-exam-landscape-enforcer",onClick:es,onTouchStart:es,onContextMenu:e=>e.preventDefault(),children:[i.jsx("style",{dangerouslySetInnerHTML:{__html:eh}}),i.jsx("div",{style:{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#f8fafc",fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",boxSizing:"border-box",...eg},children:(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"14px",color:"#334155",fontSize:"22px",fontWeight:"400",letterSpacing:"0.2px"},children:[(0,i.jsxs)("span",{children:["Downloading Questions ",h," %"]}),(0,i.jsxs)("svg",{className:"ubt-download-spinner",width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",strokeWidth:"2.5",strokeLinecap:"round",children:[i.jsx("style",{children:`
                @keyframes ubt-spinner-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .ubt-download-spinner { animation: ubt-spinner-spin 1s steps(8, end) infinite; }
              `}),i.jsx("line",{x1:"12",y1:"2",x2:"12",y2:"6",stroke:"#94a3b8"}),i.jsx("line",{x1:"12",y1:"18",x2:"12",y2:"22",stroke:"#475569"}),i.jsx("line",{x1:"4.93",y1:"4.93",x2:"7.76",y2:"7.76",stroke:"#cbd5e1"}),i.jsx("line",{x1:"16.24",y1:"16.24",x2:"19.07",y2:"19.07",stroke:"#334155"}),i.jsx("line",{x1:"2",y1:"12",x2:"6",y2:"12",stroke:"#e2e8f0"}),i.jsx("line",{x1:"18",y1:"12",x2:"22",y2:"12",stroke:"#1e293b"}),i.jsx("line",{x1:"4.93",y1:"19.07",x2:"7.76",y2:"16.24",stroke:"#64748b"}),i.jsx("line",{x1:"16.24",y1:"7.76",x2:"19.07",y2:"4.93",stroke:"#cbd5e1"})]})]})})]});let eb={width:"100%",height:"100%",minHeight:0,display:"flex",flexDirection:"column",backgroundColor:"#ffffff",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"0",overflow:"hidden",position:"relative",backgroundImage:"none",...eg};return i.jsx("div",{className:"ubt-exam-landscape-enforcer",children:(0,i.jsxs)("div",{className:"ubt-exam-wrapper",style:eb,onContextMenu:e=>e.preventDefault(),children:[i.jsx("style",{dangerouslySetInnerHTML:{__html:eh}}),I&&i.jsx("div",{className:"ubt-confirm-modal-overlay",children:(0,i.jsxs)("div",{className:"ubt-confirm-modal-card",children:[i.jsx("div",{className:"ubt-confirm-modal-icon",children:(0,i.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),i.jsx("polyline",{points:"14 2 14 8 20 8"}),i.jsx("line",{x1:"16",y1:"13",x2:"8",y2:"13"}),i.jsx("line",{x1:"16",y1:"17",x2:"8",y2:"17"}),i.jsx("polyline",{points:"10 9 9 9 8 9"})]})}),i.jsx("h3",{className:"ubt-confirm-modal-title",children:"Confirm Submission"}),i.jsx("p",{className:"ubt-confirm-modal-text",children:"Are you sure you want to submit and complete the exam? Your final score and answer breakdown will be calculated."}),(0,i.jsxs)("div",{className:"ubt-confirm-modal-actions",children:[i.jsx("button",{type:"button",className:"ubt-confirm-btn-cancel",onClick:()=>C(!1),children:"CONTINUE TEST"}),i.jsx("button",{type:"button",className:"ubt-confirm-btn-submit",onClick:ef,children:"YES, SUBMIT"})]})]})}),"overview"===j?(0,i.jsxs)("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"100%",width:"100%",height:"100%",margin:"0",justifyContent:"stretch",borderRadius:"0",overflow:"hidden"},children:[(0,i.jsxs)("div",{className:"ubt-overview-top-bar",style:{display:"flex",alignItems:"center",justifyContent:"space-between",backgroundColor:"#f8fafc",borderBottom:"1px solid #cbd5e1",flexShrink:0,boxSizing:"border-box",width:"100%"},children:[(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px",fontWeight:"700",fontSize:"14px",color:"#1e293b"},children:[i.jsx("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"#475569",children:i.jsx("path",{d:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"})}),i.jsx("span",{children:_||"New UBT - 127"})]}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[i.jsx("span",{style:{color:"#475569",fontSize:"13.5px",fontWeight:"600",padding:"4px 10px"},children:"Nepal"}),i.jsx("button",{type:"button",onClick:()=>S("all"),style:{backgroundColor:"all"===w?"#0284c7":"transparent",color:"all"===w?"#ffffff":"#475569",border:"none",borderRadius:"8px",padding:"5px 14px",fontWeight:"700",fontSize:"13.5px",cursor:"pointer"},children:"Whole Questions"}),i.jsx("button",{type:"button",onClick:()=>S("solved"),style:{backgroundColor:"solved"===w?"#0284c7":"transparent",color:"solved"===w?"#ffffff":"#475569",border:"none",borderRadius:"8px",padding:"5px 14px",fontWeight:"700",fontSize:"13.5px",cursor:"pointer"},children:"Solved Questions"}),i.jsx("button",{type:"button",onClick:()=>S("unsolved"),style:{backgroundColor:"unsolved"===w?"#0284c7":"transparent",color:"unsolved"===w?"#ffffff":"#475569",border:"none",borderRadius:"8px",padding:"5px 14px",fontWeight:"700",fontSize:"13.5px",cursor:"pointer"},children:"Unsolved Questions"})]}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"14px"},children:[i.jsx("span",{style:{fontWeight:"800",fontSize:"14.5px",color:"#0f172a"},children:ed(W)}),i.jsx("span",{style:{fontSize:"12px",color:"#64748b",fontWeight:"600"},children:s||"jdf jdf"}),i.jsx("button",{type:"button",onClick:el,title:"Toggle Fullscreen",style:{background:"transparent",border:"1px solid #cbd5e1",color:"#64748b",borderRadius:"6px",padding:"2px 6px",fontSize:"11px",cursor:"pointer"},children:"⛶"})]})]}),(0,i.jsxs)("div",{style:{display:"flex",flex:1,minHeight:0,gap:"12px",padding:"10px 14px",backgroundColor:"#f8fafc",boxSizing:"border-box",overflow:"hidden"},children:[(0,i.jsxs)("div",{style:{flex:1,backgroundColor:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"12px",padding:"10px 14px",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"},children:[i.jsx(a,{logoUrl:d,instituteName:p,opacity:.15}),i.jsx("h3",{style:{textAlign:"center",margin:"0 0 8px 0",fontSize:"15px",fontWeight:"700",color:"#334155",flexShrink:0,zIndex:2},children:"Reading Questions"}),i.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gridTemplateRows:"repeat(4, 1fr)",gap:"8px",flex:1,minHeight:0,zIndex:2},children:z.slice(0,20).map((e,t)=>{let n=E===t,o=void 0!==T[e.id],r=1;return"solved"!==w||o||(r=.28),"unsolved"===w&&o&&(r=.28),i.jsx("button",{type:"button",onClick:()=>{R(t),k("single")},style:{height:"100%",minHeight:"34px",borderRadius:"10px",border:n?"2px solid #0284c7":"1px solid #cbd5e1",backgroundColor:n?"#0284c7":o?"#e0f2fe":"#ffffff",color:n?"#ffffff":o?"#0369a1":"#1e293b",fontSize:"14px",fontWeight:"700",cursor:"pointer",opacity:r,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.03)",transition:"all 0.15s ease"},children:t+1},e.id||t)})})]}),(0,i.jsxs)("div",{style:{flex:1,backgroundColor:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"12px",padding:"10px 14px",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"},children:[i.jsx(a,{logoUrl:d,instituteName:p,opacity:.15}),i.jsx("h3",{style:{textAlign:"center",margin:"0 0 8px 0",fontSize:"15px",fontWeight:"700",color:"#334155",flexShrink:0,zIndex:2},children:"Listening Questions"}),i.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gridTemplateRows:"repeat(4, 1fr)",gap:"8px",flex:1,minHeight:0,zIndex:2},children:z.slice(20,40).map((e,t)=>{let n=t+20,o=E===n,r=void 0!==T[e.id],a=1;return"solved"!==w||r||(a=.28),"unsolved"===w&&r&&(a=.28),i.jsx("button",{type:"button",onClick:()=>{R(n),k("single")},style:{height:"100%",minHeight:"34px",borderRadius:"10px",border:o?"2px solid #0284c7":"1px solid #cbd5e1",backgroundColor:o?"#0284c7":r?"#e0f2fe":"#ffffff",color:o?"#ffffff":r?"#0369a1":"#1e293b",fontSize:"14px",fontWeight:"700",cursor:"pointer",opacity:a,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 1px 2px rgba(0,0,0,0.03)",transition:"all 0.15s ease"},children:n+1},e.id||n)})})]})]}),(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 18px",backgroundColor:"#f8fafc",borderTop:"1px solid #cbd5e1",flexShrink:0},children:[i.jsx("button",{type:"button",onClick:()=>k("single"),style:{backgroundColor:"#64748b",color:"#ffffff",borderRadius:"9999px",border:"none",padding:"8px 22px",fontWeight:"700",fontSize:"13px",cursor:"pointer"},children:"❮ Back to Question"}),i.jsx("button",{type:"button",onClick:()=>C(!0),style:{backgroundColor:"#0284c7",color:"#ffffff",borderRadius:"9999px",border:"none",padding:"8px 26px",fontWeight:"800",fontSize:"13.5px",cursor:"pointer",boxShadow:"0 2px 6px rgba(2, 132, 199, 0.35)"},children:"Submit And Finish Exam"})]})]}):i.jsx("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"100%",width:"100%",height:"100%",margin:"0",justifyContent:"stretch",borderRadius:"0",overflow:"hidden"},children:(()=>{let e=z[E];if(!e)return null;let t=e.options||[];return(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",minHeight:0},children:[(0,i.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",alignItems:"center",backgroundColor:"#f8fafc",color:"#334155",borderBottom:"1px solid #cbd5e1",fontSize:"13.5px",fontWeight:"600",flexShrink:0,width:"100%",boxSizing:"border-box"},children:[i.jsx("div",{style:{padding:"0 16px 0 4px",borderRight:"1px solid #cbd5e1",whiteSpace:"nowrap"},children:i.jsx("span",{children:_||"New UBT - 127"})}),i.jsx("div",{style:{padding:"0 16px",borderRight:"1px solid #cbd5e1",whiteSpace:"nowrap"},children:i.jsx("span",{children:"Whole Question:40"})}),i.jsx("div",{style:{padding:"0 16px",borderRight:"1px solid #cbd5e1",whiteSpace:"nowrap"},children:(0,i.jsxs)("span",{children:["Remaining Question:",em]})}),i.jsx("div",{style:{padding:"0 16px",fontWeight:"800",color:"#0f172a",whiteSpace:"nowrap"},children:i.jsx("span",{children:ed(W)})}),(0,i.jsxs)("div",{style:{marginLeft:"auto",display:"flex",alignItems:"center",gap:"12px"},children:[i.jsx("span",{style:{fontSize:"12px",color:"#64748b",fontWeight:"600"},children:s||""}),i.jsx("button",{type:"button",onClick:el,title:"Toggle Fullscreen",style:{background:"transparent",border:"1px solid #cbd5e1",color:"#64748b",borderRadius:"6px",padding:"2px 6px",fontSize:"11px",cursor:"pointer"},children:"⛶"})]})]}),(0,i.jsxs)("div",{className:"ubt-exam-card",style:{backgroundColor:"#f8fafc",display:"flex",flexDirection:"column",justifyContent:"space-between",flex:1,minHeight:0,overflow:"hidden",padding:"8px 12px",gap:"8px"},children:[(0,i.jsxs)("div",{className:"ubt-exam-columns",style:{display:"flex",flex:1,overflow:"hidden",minHeight:0,gap:"10px"},children:[(0,i.jsxs)("div",{className:"ubt-exam-left",style:{flex:1.25,backgroundColor:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"12px",padding:"14px 18px",position:"relative",display:"flex",flexDirection:"column",overflowY:"auto",height:"100%",minHeight:0},children:[i.jsx("p",{style:{margin:"0 0 4px 0",fontSize:"16.5px",fontWeight:"700",color:"#1e293b",lineHeight:"1.35",paddingRight:"30px"},children:e.mainHeading||(E<20?"[ 1~4 ] 다음 그림을 보고 맞은 단어나 문장을 고르십시오.":"[ 21~22 ] 들은 것을 고르십시오.")}),(0,i.jsxs)("p",{style:{margin:"0 0 8px 0",fontSize:"18px",fontWeight:"800",color:"#0f172a"},children:[E+1,"."]}),(0,i.jsxs)("div",{style:{flex:1,minHeight:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",width:"100%"},children:[i.jsx(a,{logoUrl:d,instituteName:p,opacity:.2}),e.description&&i.jsx("div",{className:"ubt-exam-desc",style:{border:"1.5px solid #cbd5e1",borderRadius:"8px",padding:"10px 14px",backgroundColor:"#ffffff",color:"#1e293b",fontSize:"16px",fontWeight:"600",lineHeight:"1.4",whiteSpace:"pre-wrap",maxHeight:"160px",overflowY:"auto",width:"92%",zIndex:2,marginBottom:"8px"},dangerouslySetInnerHTML:{__html:e.description}}),e.image&&i.jsx("div",{style:{zIndex:2,textAlign:"center",maxWidth:"90%",maxHeight:"155px"},children:i.jsx("img",{src:e.image,alt:`Question ${E+1}`,style:{maxHeight:"145px",maxWidth:"100%",objectFit:"contain",borderRadius:"6px"}})}),!!(e.audio&&e.audio.trim())&&(0,i.jsxs)("div",{style:{zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:[i.jsx("button",{type:"button",onClick:()=>{F.current&&e.audio&&(et?(F.current.pause(),en(!1)):F.current.play().catch(e=>console.log("Audio play notice:",e)))},style:{width:"54px",height:"54px",borderRadius:"50%",backgroundColor:"#0284c7",color:"#ffffff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(2, 132, 199, 0.4)",transition:"transform 0.15s ease"},children:et?(0,i.jsxs)("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"#ffffff",children:[i.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"}),i.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"})]}):i.jsx("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"#ffffff",style:{marginLeft:"3px"},children:i.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})})}),i.jsx("audio",{ref:F,src:e.audio,onPlay:ep,onEnded:eu,style:{display:"none"}})]})]}),i.jsx("div",{style:{textAlign:"center",fontSize:"10.5px",color:"#94a3b8",marginTop:"auto",flexShrink:0,paddingTop:"4px"},children:"\xa9 Protected content. Copying or sharing is prohibited."})]}),(0,i.jsxs)("div",{className:"ubt-exam-right",style:{flex:1,backgroundColor:"#ffffff",border:"1.5px solid #cbd5e1",borderRadius:"12px",padding:0,position:"relative",display:"flex",flexDirection:"column",justifyContent:"space-evenly",overflowY:"auto",height:"100%",minHeight:0},children:[i.jsx(a,{logoUrl:d,instituteName:p,opacity:.16}),t.map((n,o)=>{let r=T[e.id]===o,a="object"==typeof n&&null!==n?n.text:n,s="object"==typeof n&&null!==n?n.image:null,l="object"==typeof n&&null!==n?n.audio:e.optionAudios?.[o]||null,d=!!(l&&String(l).trim());return(0,i.jsxs)("div",{className:`ubt-opt-row ${r?"ubt-opt-selected":""}`,onClick:()=>ec(o),style:{display:"flex",alignItems:"center",flex:1,padding:"10px 18px",borderBottom:o<t.length-1?"1px solid #e2e8f0":"none",backgroundColor:r?"#dbeafe":"transparent",cursor:"pointer",zIndex:2,transition:"background-color 0.15s ease"},children:[i.jsx("div",{className:`ubt-opt-badge ${r?"ubt-opt-badge-selected":""}`,style:{width:"28px",height:"28px",borderRadius:"50%",border:`1.5px solid ${r?"#0284c7":"#38bdf8"}`,backgroundColor:r?"#0284c7":"#ffffff",color:r?"#ffffff":"#0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"14px",marginRight:"14px",flexShrink:0,transition:"all 0.15s ease"},children:o+1}),(0,i.jsxs)("div",{style:{flex:1,display:"flex",alignItems:"center",gap:"10px"},children:[s&&i.jsx("img",{src:s,alt:`Option ${o+1}`,style:{maxHeight:"65px",maxWidth:"120px",objectFit:"contain",borderRadius:"4px"}}),i.jsx("span",{style:{fontSize:"17px",fontWeight:r?"700":"500",color:r?"#0284c7":"#1e293b",lineHeight:1.3},dangerouslySetInnerHTML:{__html:a}})]}),d&&i.jsx("button",{type:"button",onClick:e=>{e.stopPropagation();let t=J.current[o];t&&(f===o?(t.pause(),x(null)):(F.current&&F.current.pause(),Object.values(J.current).forEach(e=>e&&e.pause()),t.currentTime=0,t.play().then(()=>x(o)).catch(e=>console.log("Opt audio error:",e))))},style:{backgroundColor:f===o?"#ef4444":"#0284c7",color:"#ffffff",border:"none",borderRadius:"50%",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:"auto",flexShrink:0,boxShadow:"0 2px 4px rgba(2, 132, 199, 0.25)"},title:"Play option audio",children:f===o?(0,i.jsxs)("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"#ffffff",children:[i.jsx("rect",{x:"6",y:"4",width:"4",height:"16",rx:"1"}),i.jsx("rect",{x:"14",y:"4",width:"4",height:"16",rx:"1"})]}):i.jsx("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"#ffffff",style:{marginLeft:"1.5px"},children:i.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})})}),d&&i.jsx("audio",{ref:e=>J.current[o]=e,src:l,onEnded:()=>x(null),style:{display:"none"}})]},o)})]})]}),(0,i.jsxs)("div",{className:"ubt-exam-nav-bar",style:{display:"flex",padding:"7px 18px",backgroundColor:"#f8fafc",borderTop:"1px solid #cbd5e1",justifyContent:"space-between",alignItems:"center",gap:"12px",flexShrink:0},children:[i.jsx("button",{type:"button",disabled:0===E,onClick:()=>{F.current&&F.current.pause(),en(!1),R(e=>Math.max(0,e-1))},style:{backgroundColor:"#0284c7",color:"#ffffff",border:"none",borderRadius:"9999px",padding:"7px 22px",fontWeight:"800",fontSize:"13.5px",cursor:0===E?"not-allowed":"pointer",opacity:0===E?.45:1,display:"inline-flex",alignItems:"center",gap:"6px",boxShadow:"0 2px 6px rgba(2, 132, 199, 0.3)"},children:"❮ PREV"}),(0,i.jsxs)("button",{type:"button",onClick:()=>{F.current&&F.current.pause(),en(!1),k("overview")},style:{backgroundColor:"#0284c7",color:"#ffffff",border:"none",borderRadius:"9999px",padding:"7px 26px",fontWeight:"800",fontSize:"13.5px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"7px",boxShadow:"0 2px 6px rgba(2, 132, 199, 0.3)"},children:[(0,i.jsxs)("svg",{width:"15",height:"15",viewBox:"0 0 24 24",fill:"currentColor",children:[i.jsx("rect",{x:"3",y:"3",width:"7",height:"7",rx:"1"}),i.jsx("rect",{x:"14",y:"3",width:"7",height:"7",rx:"1"}),i.jsx("rect",{x:"3",y:"14",width:"7",height:"7",rx:"1"}),i.jsx("rect",{x:"14",y:"14",width:"7",height:"7",rx:"1"})]}),"WHOLE QUESTIONS"]}),i.jsx("button",{type:"button",onClick:()=>{F.current&&F.current.pause(),en(!1),E<z.length-1?R(e=>e+1):C(!0)},style:{backgroundColor:"#0284c7",color:"#ffffff",border:"none",borderRadius:"9999px",padding:"7px 22px",fontWeight:"800",fontSize:"13.5px",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"6px",boxShadow:"0 2px 6px rgba(2, 132, 199, 0.3)"},children:E===z.length-1?"SUBMIT ❯":"NEXT ❯"})]})]})]})})()})]})})}},92766:(e,t,n)=>{"use strict";n.d(t,{default:()=>r});var i=n(10326),o=n(17577);function r({allowedRoles:e=[],children:t}){let[n,r]=(0,o.useState)(!0),[a,s]=(0,o.useState)(null);return!n&&a?(0,i.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[i.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:a}),i.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):t}},3277:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>i});let i=(0,n(68570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx#default`)},78440:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>c,dynamic:()=>s,metadata:()=>l});var i=n(19510),o=n(68408),r=n(58585),a=n(52858);let s="force-dynamic",l={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function c({children:e}){let t=await (0,o.xn)();return t&&!d.includes(t.role)&&(0,r.redirect)("/?error=unauthorized"),i.jsx(a.Z,{allowedRoles:d,children:e})}},52858:(e,t,n)=>{"use strict";n.d(t,{Z:()=>i});let i=(0,n(68570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},68408:(e,t,n)=>{"use strict";n.d(t,{Gv:()=>c,WX:()=>u,c_:()=>d,fT:()=>p,xn:()=>f});var i=n(42023),o=n(6091),r=n(6176),a=n(71615);let s=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let l=new TextEncoder().encode(s);async function d(e){return await i.hash(e,10)}async function c(e,t){return await i.compare(e,t)}async function p(e){return await new o.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(l)}async function u(e){try{let{payload:t}=await (0,r._)(e,l);return t}catch(e){return null}}async function f(e){try{let t=null;if(e){let n=e.cookies.get("sigma_session")?.value||e.cookies.get("sigma_token")?.value;if(n)t=n;else{let n=e.headers.get("authorization");n&&n.startsWith("Bearer ")&&(t=n.split(" ")[1])}}else{let e=(0,a.cookies)();t=e.get("sigma_session")?.value||e.get("sigma_token")?.value}if(!t)return null;return await u(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),i=t.X(0,[8948,3881,4669,7512,5805],()=>n(47631));module.exports=i})();