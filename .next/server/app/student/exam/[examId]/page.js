(()=>{var t={};t.id=4663,t.ids=[4663],t.modules={2934:t=>{"use strict";t.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:t=>{"use strict";t.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:t=>{"use strict";t.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:t=>{"use strict";t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4770:t=>{"use strict";t.exports=require("crypto")},2254:t=>{"use strict";t.exports=require("node:buffer")},6005:t=>{"use strict";t.exports=require("node:crypto")},7261:t=>{"use strict";t.exports=require("node:util")},7631:(t,e,i)=>{"use strict";i.r(e),i.d(e,{GlobalError:()=>a.a,__next_app__:()=>c,originalPathname:()=>x,pages:()=>l,routeModule:()=>m,tree:()=>d}),i(3277),i(8440),i(5603),i(1837);var n=i(3191),o=i(8716),r=i(7922),a=i.n(r),p=i(5231),s={};for(let t in p)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(t)&&(s[t]=()=>p[t]);i.d(e,s);let d=["",{children:["student",{children:["exam",{children:["[examId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(i.bind(i,3277)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(i.bind(i,8440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(i.bind(i,5603)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(i.bind(i,1837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],l=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"],x="/student/exam/[examId]/page",c={require:i,loadChunk:()=>Promise.resolve()},m=new n.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/student/exam/[examId]/page",pathname:"/student/exam/[examId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},6473:(t,e,i)=>{Promise.resolve().then(i.bind(i,4387))},5359:(t,e,i)=>{Promise.resolve().then(i.bind(i,2766))},4387:(t,e,i)=>{"use strict";i.r(e),i.d(e,{default:()=>a});var n=i(326),o=i(7577);i(434);var r=i(5047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let a=()=>{let t=(0,r.useRouter)(),e=(0,r.useParams)(),i=e?.examId,[a,p]=(0,o.useState)(""),[s,d]=(0,o.useState)(""),[l,x]=(0,o.useState)(!1),[c,m]=(0,o.useState)("single"),[f,u]=(0,o.useState)(!1),[h,g]=(0,o.useState)([]),[b,y]=(0,o.useState)(0),[w,v]=(0,o.useState)({}),[j,S]=(0,o.useState)(3e3),[k,C]=(0,o.useState)(`Chapterwise 0${i}`),[z,I]=(0,o.useState)(!1),[N,R]=(0,o.useState)(null),[T,W]=(0,o.useState)(!1),[E,A]=(0,o.useState)(null);(0,o.useEffect)(()=>{try{t.prefetch("/student/result"),t.prefetch("/student")}catch(t){}},[t]),(0,o.useEffect)(()=>{try{let t=localStorage.getItem("currentUser")||"Student";p(t);let e=JSON.parse(localStorage.getItem("institutes")||"[]");e[0]?.logoUrl&&d(e[0].logoUrl)}catch(t){}},[]),(0,o.useEffect)(()=>{if(!l)return;let t=async()=>{try{screen.orientation&&"function"==typeof screen.orientation.lock?await screen.orientation.lock("landscape").catch(()=>{}):screen.lockOrientation?screen.lockOrientation("landscape"):screen.webkitLockOrientation?screen.webkitLockOrientation("landscape"):screen.mozLockOrientation&&screen.mozLockOrientation("landscape")}catch(t){}};return window.addEventListener("orientationchange",t),screen.orientation&&screen.orientation.addEventListener("change",t),t(),()=>{window.removeEventListener("orientationchange",t),screen.orientation&&screen.orientation.removeEventListener("change",t);try{screen.orientation&&"function"==typeof screen.orientation.unlock&&screen.orientation.unlock()}catch(t){}}},[l]);let L=(0,o.useRef)(null),D=(0,o.useRef)({}),O=(0,o.useRef)(0),q=(0,o.useRef)({}),H=(0,o.useRef)(null),_=(0,o.useRef)({}),[P,F]=(0,o.useState)(!1),[M,B]=(0,o.useState)({}),[U,$]=(0,o.useState)(!1),[Q,J]=(0,o.useState)(null),[Y,G]=(0,o.useState)({});(0,o.useEffect)(()=>{(async function(){try{let e=await fetch(`/api/student/exams/${i||"set-1-demo"}/start`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentPhone:""})});if(e.ok){let t=await e.json();if(t.questions&&t.questions.length>0){let e=[...t.questions];if(e.length<40)for(let t=e.length+1;t<=40;t++)e.push({id:`q_gen_${t}`,qIndex:t,type:t<=20?"Reading":"Listening",mainHeading:t<=20?`[ ${t} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${t} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["1","2","3","4"],answer:0});g(e),t.answerSheet&&G(t.answerSheet),J(t.sessionId),t.examName&&C(t.examName);try{localStorage.setItem(`offline_ubt_exam_${i||"set-1-demo"}`,JSON.stringify({questions:e,answerSheet:t.answerSheet||{},sessionId:t.sessionId,examName:t.examName,duration:t.duration,expiresAt:t.expiresAt,cachedAt:Date.now()}))}catch(t){console.warn("Could not write offline exam cache:",t)}return}}else{let i=await e.json().catch(()=>({}));if(401===e.status||403===e.status){alert(i.error||"This exam set requires payment of Rs. 30. Please unlock via eSewa to take this test."),t.push("/student");return}console.warn("Backend start API status:",e.status,i)}}catch(t){console.warn("Backend start API network error (attempting offline cache):",t);try{let t=localStorage.getItem(`offline_ubt_exam_${i||"set-1-demo"}`);if(t){let e=JSON.parse(t);if(e.questions&&e.questions.length>=40){g(e.questions),e.answerSheet&&G(e.answerSheet),J(e.sessionId||`offline_${Date.now()}`),e.examName&&C(e.examName);return}}}catch(t){console.warn("Offline restore error:",t)}}let e=JSON.parse(localStorage.getItem("examSets"))||[],n=JSON.parse(localStorage.getItem("questionBank"))||[],o=e.find(t=>t.id.toString()===i?.toString()||t.name===i),r=o?o.name:`Chapterwise 0${i}`;C(r);let a={};if(a[""]||a[""],[].some(t=>t?.toString()===i?.toString()||t?.toString()===o?.id?.toString()||t?.toString()===o?.name?.toString()||t?.toString()===r?.toString()||"string"==typeof i&&t?.toString()===decodeURIComponent(i)),o&&o.creatorInstituteName&&!o.isPublished){let e={},i=("".toString().replace(/[^0-9]/g,"").slice(-10),t=>!1),n=null;for(let t in e)if((e[t]||[]).some(t=>i(t.phone))){n=t;break}if(!n||n.toLowerCase()!==o.creatorInstituteName.toLowerCase()){alert(`Access Restricted: This exam set is in the private bucket of "${o.creatorInstituteName}". Students from other institutes cannot access it.`),t.push("/student");return}}let p=o?o.packageName:"",s=n.filter(t=>t&&(t.setId?.toString()===i?.toString()||t.set===r||t.package===p&&t.set===r)),d=s.filter(t=>"Reading"===t.type),l=s.filter(t=>"Listening"===t.type),x=[];for(let t=1;t<=20;t++)d[t-1]?x.push({...d[t-1],id:d[t-1].id||t,type:"Reading"}):x.push({id:t,type:"Reading",mainHeading:`[ ${t} ] 다음을 읽고 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["가방","지갑","우산","이불"],answer:0});for(let t=1;t<=20;t++){let e=20+t;l[t-1]?x.push({...l[t-1],id:l[t-1].id||e,type:"Listening"}):x.push({id:e,type:"Listening",mainHeading:`[ ${e} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["듣기 1","듣기 2","듣기 3","듣기 4"],answer:0})}g(x);let c={};x.forEach(t=>{void 0!==t.answer&&null!==t.answer&&(c[t.id]=Number(t.answer),void 0!==t.qIndex&&(c[t.qIndex]=Number(t.answer)))}),G(t=>({...c,...t}))})()},[i]),(0,o.useEffect)(()=>{H.current&&clearTimeout(H.current),Object.values(_.current).forEach(t=>clearTimeout(t)),_.current={},L.current&&(L.current.pause(),L.current.currentTime=0),Object.values(D.current).forEach(t=>{t&&(t.pause(),t.currentTime=0)}),O.current=0,q.current={},F(!1),B({}),$(!1)},[b]),(0,o.useEffect)(()=>{if(l){let t=setInterval(()=>{S(e=>e<=1?(clearInterval(t),tr(),0):e-1)},1e3);return()=>clearInterval(t)}},[l]);let V=()=>{try{if("undefined"!=typeof document&&!document.fullscreenElement&&!document.webkitFullscreenElement){let t=document.documentElement;t.requestFullscreen?t.requestFullscreen().catch(()=>{}):t.webkitRequestFullscreen?t.webkitRequestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.msRequestFullscreen&&t.msRequestFullscreen()}}catch(t){}},X=()=>{try{"undefined"!=typeof document&&(document.fullscreenElement||document.webkitFullscreenElement)?document.exitFullscreen?document.exitFullscreen().catch(()=>{}):document.webkitExitFullscreen&&document.webkitExitFullscreen():V()}catch(t){}},Z=async()=>{V(),y(0),m("single"),x(!0)},K=t=>{let e=Math.floor(t/60).toString().padStart(2,"0"),i=(t%60).toString().padStart(2,"0");return`${e}:${i}`},tt=t=>{let e=h[b];v({...w,[e.id]:t})},te=()=>{0===O.current&&(O.current=1,F(!0),$(!0))},ti=()=>{1===O.current?(H.current&&clearTimeout(H.current),H.current=setTimeout(()=>{L.current&&1===O.current&&(O.current=2,L.current.currentTime=0,L.current.play().catch(t=>console.log("Audio 2nd play error:",t)))},3e3)):O.current>=2&&$(!1)},tn=t=>{0===(q.current[t]||0)&&(q.current[t]=1,B(e=>({...e,[t]:!0})),$(!0))},to=t=>{let e=q.current[t]||1;1===e?(_.current[t]&&clearTimeout(_.current[t]),_.current[t]=setTimeout(()=>{let e=D.current[t];e&&1===q.current[t]&&(q.current[t]=2,e.currentTime=0,e.play().catch(t=>console.log("Opt audio 2nd play error:",t)))},3e3)):e>=2&&$(!1)},tr=async()=>{try{H.current&&clearTimeout(H.current),Object.values(_.current).forEach(t=>clearTimeout(t)),L.current&&L.current.pause(),Object.values(D.current).forEach(t=>t&&t.pause());let e=h.map((t,e)=>{let i=Y[t.id]??Y[String(t.id)]??Y[t.qIndex]??Y[String(t.qIndex)]??Y[e+1]??t.answer,n=null!=i?Number(i):0;return{...t,answer:n}}),n=0,o=0,r=0,a=0,p={};e.forEach((t,e)=>{let i=void 0!==t.id?t.id:e+1,s=void 0!==t.qIndex?t.qIndex:e+1,d=void 0!==w[t.id]?w[t.id]:void 0!==w[String(t.id)]?w[String(t.id)]:void 0!==w[s]?w[s]:void 0!==w[String(s)]?w[String(s)]:w[e];if(null!=d&&""!==d){let l=Number(d);p[i]=l,p[String(i)]=l,p[s]=l,p[String(s)]=l,p[e]=l,a+=1;let x=void 0!==t.answer&&null!==t.answer?Number(t.answer):void 0,c=!1;void 0!==x&&(l===x||l+1===x)&&(c=!0),c&&(n+=1,t.type&&"reading"===t.type.toLowerCase()||s<=20||e<20?o+=1:r+=1)}});let s=e.length>0?e.length:40,d=5*o,l=5*r,x=d+l,c=Math.round(n/s*100),m=c>=40||x>=96,f="Student",g={examName:k,score:n,total:s,attempted:a,readingCorrect:o,listeningCorrect:r,readingScore:d,listeningScore:l,totalScore:x,percentage:c,passed:m,questions:e,selectedAnswers:p,isOfflineSubmitted:!1,studentName:f,createdAt:new Date().toISOString()},b=!1;if("undefined"!=typeof navigator&&navigator.onLine)try{let t=new AbortController,o=setTimeout(()=>t.abort(),4500),r=await fetch(`/api/student/exams/${i||"set-1-demo"}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:Q||`offline_${Date.now()}`,selectedAnswers:p,studentName:f,studentPhone:""}),signal:t.signal});if(clearTimeout(o),r.ok){b=!0;let t=await r.json();if(t.result){let i=t.result;g.score=void 0!==i.correctAnswers?i.correctAnswers:n,g.total=i.totalQuestions||s,g.readingScore=i.readingScore??d,g.listeningScore=i.listeningScore??l,g.totalScore=i.totalScore??x,g.passed=!!i.passed,g.percentage=Math.round(g.score/g.total*100),Array.isArray(i.breakdown)&&(g.questions=e.map((t,e)=>{let n=i.breakdown.find(i=>i.qIndex===t.qIndex||i.qIndex===e+1);return n?{...t,answer:n.correctAnswer}:t}))}}}catch(t){console.warn("Submit API network notice (enqueuing for offline sync):",t)}if(!b){g.isOfflineSubmitted=!0;try{let t=JSON.parse(localStorage.getItem("offlineExamSyncQueue")||"[]");t.push({examId:i||"set-1-demo",sessionId:Q||`offline_${Date.now()}`,selectedAnswers:p,score:n,total:s,readingScore:d,listeningScore:l,totalScore:x,studentName:f,studentPhone:"",submittedAt:new Date().toISOString()}),localStorage.setItem("offlineExamSyncQueue",JSON.stringify(t))}catch(t){console.warn("Could not save to offline sync queue:",t)}}localStorage.setItem("lastExamResult",JSON.stringify(g));let y=JSON.parse(localStorage.getItem("examResults"))||[];localStorage.setItem("examResults",JSON.stringify([g,...y])),R(g),I(!0),u(!1);try{t.push("/student/result")}catch(t){console.warn("Offline router navigation notice (active in-page review fallback):",t)}}catch(e){console.error("Submission error:",e);try{t.push("/student/result")}catch(t){}}},ta=Object.keys(w).length,tp=h.length-ta,ts={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"};if(!l)return(0,n.jsxs)("div",{className:"ubt-pre-exam-screen",style:{position:"fixed",top:0,left:0,right:0,bottom:0,width:"100vw",height:"100vh",height:"100dvh",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"12px 14px",overflowY:"auto",zIndex:2147483640,...ts},onContextMenu:t=>t.preventDefault(),children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
          .ubt-pre-exam-dialog {
            background-color: #ffffff;
            padding: 22px 26px;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            max-width: 760px;
            width: 100%;
            max-height: 94vh;
            max-height: 94dvh;
            overflow-y: auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            gap: 22px;
            margin: auto;
            align-items: center;
          }
          .ubt-pre-exam-col-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            justify-content: space-between;
          }
          .ubt-pre-exam-col-details {
            flex: 1.25;
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
          }
          .ubt-pre-exam-icon {
            width: 54px;
            height: 54px;
            background-color: #0284c7;
            border-radius: 50%;
            margin: 0 auto 8px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(2,132,199,0.3);
            flex-shrink: 0;
          }
          .ubt-pre-exam-title {
            color: #0f172a;
            font-size: 22px;
            margin: 0 0 4px 0;
            font-weight: 800;
          }
          .ubt-pre-exam-subtitle {
            color: #64748b;
            margin: 0 0 14px 0;
            font-size: 13px;
          }
          .ubt-pre-exam-table {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            text-align: left;
            width: 100%;
            box-sizing: border-box;
          }
          .ubt-pre-exam-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 8px;
            font-size: 13px;
          }
          .ubt-pre-exam-btn {
            flex: 1;
            padding: 11px;
            font-size: 13.5px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .ubt-pre-exam-buttons {
            display: flex;
            gap: 10px;
            width: 100%;
            margin-top: 14px;
          }

          /* Stack vertically on portrait mode phones or narrow views */
          @media (orientation: portrait), (max-width: 580px) {
            .ubt-pre-exam-dialog {
              flex-direction: column !important;
              max-width: 440px !important;
              padding: 20px 18px !important;
              border-radius: 24px !important;
              gap: 14px !important;
            }
            .ubt-pre-exam-buttons {
              margin-top: 8px !important;
            }
          }

          /* Compact fit on landscape mobile viewports */
          @media (orientation: landscape) and (max-height: 540px) {
            .ubt-pre-exam-dialog {
              flex-direction: row !important;
              max-width: 680px !important;
              max-height: 96dvh !important;
              padding: 10px 18px !important;
              border-radius: 16px !important;
              gap: 14px !important;
            }
            .ubt-pre-exam-icon {
              width: 36px !important;
              height: 36px !important;
              margin: 0 auto 4px auto !important;
            }
            .ubt-pre-exam-icon svg {
              width: 20px !important;
              height: 20px !important;
            }
            .ubt-pre-exam-title {
              font-size: 16px !important;
              margin-bottom: 2px !important;
            }
            .ubt-pre-exam-subtitle {
              font-size: 11px !important;
              margin-bottom: 6px !important;
            }
            .ubt-pre-exam-table {
              padding: 6px 12px !important;
              border-radius: 8px !important;
            }
            .ubt-pre-exam-row {
              padding-bottom: 4px !important;
              margin-bottom: 4px !important;
              font-size: 11.5px !important;
            }
            .ubt-pre-exam-btn {
              padding: 7px 12px !important;
              font-size: 12px !important;
            }
            .ubt-pre-exam-buttons {
              margin-top: 6px !important;
              gap: 8px !important;
            }
          }
        `}}),(0,n.jsxs)("div",{className:"ubt-pre-exam-dialog",children:[(0,n.jsxs)("div",{className:"ubt-pre-exam-col-info",children:[n.jsx("div",{className:"ubt-pre-exam-icon",children:(0,n.jsxs)("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("path",{d:"M22 10v6M2 10l10-5 10 5-10 5z"}),n.jsx("path",{d:"M6 12v5c3 3 9 3 12 0v-5"})]})}),n.jsx("h2",{className:"ubt-pre-exam-title",children:"EPS-TOPIK UBT Exam"}),n.jsx("p",{className:"ubt-pre-exam-subtitle",children:"Please verify your details before starting"}),(0,n.jsxs)("div",{className:"ubt-pre-exam-buttons",children:[n.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:()=>t.push("/student"),style:{backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1"},children:"CANCEL"}),n.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:Z,style:{backgroundColor:"#0284c7",color:"white",border:"none",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"GET START"})]})]}),n.jsx("div",{className:"ubt-pre-exam-col-details",children:(0,n.jsxs)("div",{className:"ubt-pre-exam-table",children:[(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Exam ID"}),n.jsx("span",{style:{color:"#0f172a",fontWeight:"bold"},children:"287378RM"})]}),(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Student Name"}),n.jsx("span",{suppressHydrationWarning:!0,style:{color:"#0f172a",fontWeight:"bold"},children:a})]}),(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Exam Title"}),n.jsx("span",{style:{color:"#0f172a",fontWeight:"bold"},children:k})]}),(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Total Questions"}),n.jsx("span",{style:{color:"#2563eb",fontWeight:"bold"},children:"40 (20 Reading + 20 Listening)"})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"13px"},children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Time Limit"}),n.jsx("span",{style:{color:"#d97706",fontWeight:"bold"},children:"50 Minutes"})]})]})})]})]});if(z&&N){let e=N.questions||[],i=e.filter(t=>t.type&&"reading"===t.type.toLowerCase()||void 0!==t.qIndex&&t.qIndex<=20).slice(0,20),o=e.filter(t=>t.type&&"listening"===t.type.toLowerCase()||void 0!==t.qIndex&&t.qIndex>20).slice(0,20),r=[...i,...o].length>0?[...i,...o]:e.slice(0,40),p=N.selectedAnswers||{},s=(t,e)=>{if(t){if(void 0!==p[t.id])return p[t.id];if(void 0!==t.qIndex&&void 0!==p[t.qIndex])return p[t.qIndex];if(void 0!==p[e])return p[e]}};if(T&&null!==E){let t=r[E],e=s(t,E),i=null!=e&&""!==e,o=i&&t?.answer!==void 0&&Number(e)===Number(t.answer);return n.jsx("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",padding:"16px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",overflowY:"auto"},children:(0,n.jsxs)("div",{style:{maxWidth:"980px",margin:"0 auto"},children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[n.jsx("button",{type:"button",onClick:()=>A(null),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 16px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Grid"}),(0,n.jsxs)("h3",{style:{margin:0,color:"#0f172a",fontSize:"18px",fontWeight:"800"},children:["Question ",E+1," Review (",t?.type||(E<20?"Reading":"Listening"),")"]})]}),(0,n.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[n.jsx("span",{style:{backgroundColor:o?"#dcfce7":i?"#fee2e2":"#f1f5f9",color:o?"#15803d":i?"#b91c1c":"#64748b",padding:"6px 14px",borderRadius:"20px",fontWeight:"800",fontSize:"12px"},children:o?"✓ Correct":i?"✗ Incorrect":"○ Not Attempted"}),n.jsx("button",{type:"button",onClick:()=>{W(!1),A(null)},style:{backgroundColor:"#f1f5f9",color:"#334155",border:"1px solid #cbd5e1",padding:"6px 14px",borderRadius:"6px",fontWeight:"700",cursor:"pointer",fontSize:"12px"},children:"Summary"})]})]}),(0,n.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"10px",padding:"24px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},children:[n.jsx("p",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold",margin:"0 0 10px 0"},children:t?.mainHeading||(E<20?`[ ${E+1} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${E+1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}),t?.questionHeading&&n.jsx("p",{style:{color:"#334155",fontSize:"14px",fontWeight:"bold",margin:"0 0 10px 0"},children:t.questionHeading}),n.jsx("p",{style:{color:"#0f172a",fontSize:"17px",fontWeight:"bold",margin:"0 0 15px 0"},dangerouslySetInnerHTML:{__html:`${E+1}. ${t?.description||""}`}}),t?.image&&n.jsx("div",{style:{margin:"15px 0",textAlign:"center"},children:n.jsx("img",{src:t.image,alt:"Question",style:{maxHeight:"180px",maxWidth:"260px",objectFit:"contain",borderRadius:"6px",border:"1px solid #cbd5e1"}})}),t?.audio&&n.jsx("div",{style:{margin:"15px 0"},children:n.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:t=>t.preventDefault(),src:t.audio,style:{width:"100%",height:"35px"}})}),n.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"10px",marginTop:"20px"},children:Array.isArray(t?.options)&&t.options.map((i,r)=>{let a="object"==typeof i&&null!==i?i.text:i,p="object"==typeof i&&null!==i?i.image:null,s="object"==typeof i&&null!==i?i.audio:null,d=Number(r)===Number(t.answer),l=Number(r)===Number(e),x="#f8fafc",c="1px solid #cbd5e1",m="#1e293b",f="white",u="2px solid #0284c7",h="#0284c7";return d?(x="#f0fdf4",c="1.5px solid #16a34a",m="#15803d",f="#16a34a",u="2px solid #16a34a",h="white"):l&&!o&&(x="#fef2f2",c="1.5px solid #ef4444",m="#b91c1c",f="#ef4444",u="2px solid #ef4444",h="white"),(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",padding:"10px 14px",backgroundColor:x,border:c,borderRadius:"8px"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[n.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"50%",backgroundColor:f,color:h,border:u,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"13px",marginRight:"12px",flexShrink:0},children:r+1}),n.jsx("span",{style:{fontSize:"15px",flex:1,color:m},dangerouslySetInnerHTML:{__html:a}}),d&&n.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:"#16a34a",marginLeft:"8px"},children:"✓ Correct Answer"}),l&&!d&&n.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:"#ef4444",marginLeft:"8px"},children:"✗ Your Answer"})]}),p&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:n.jsx("img",{src:p,alt:`Opt ${r+1}`,style:{maxHeight:"60px",borderRadius:"4px"}})}),s&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:n.jsx("audio",{controls:!0,controlsList:"nodownload",src:s,style:{width:"100%",height:"26px"}})})]},r)})}),(0,n.jsxs)("div",{style:{marginTop:"24px",display:"flex",justifyContent:"space-between"},children:[n.jsx("button",{type:"button",onClick:()=>A(t=>Math.max(0,t-1)),disabled:0===E,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"6px",fontWeight:"bold",cursor:0===E?"not-allowed":"pointer",opacity:0===E?.5:1},children:"❮ Previous"}),n.jsx("button",{type:"button",onClick:()=>A(t=>Math.min(r.length-1,t+1)),disabled:E===r.length-1,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"6px",fontWeight:"bold",cursor:E===r.length-1?"not-allowed":"pointer",opacity:E===r.length-1?.5:1},children:"Next ❯"})]})]})]})})}return T&&null===E?(0,n.jsxs)("div",{style:{maxWidth:"100%",width:"100%",height:"100vh",height:"100dvh",margin:"0 auto",padding:"8px 12px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column",overflow:"hidden",backgroundColor:"#f8fafc"},children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px",flexWrap:"wrap",gap:"8px",flexShrink:0},children:[n.jsx("button",{type:"button",onClick:()=>W(!1),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"6px 16px",borderRadius:"8px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Summary"}),(0,n.jsxs)("div",{style:{display:"flex",gap:"10px",alignItems:"center"},children:[(0,n.jsxs)("span",{style:{fontSize:"12.5px",fontWeight:"700",color:"#16a34a"},children:["● Correct (",N.score,")"]}),(0,n.jsxs)("span",{style:{fontSize:"12.5px",fontWeight:"700",color:"#ef4444"},children:["● Incorrect (",N.attempted-N.score,")"]}),(0,n.jsxs)("span",{style:{fontSize:"12.5px",fontWeight:"700",color:"#64748b"},children:["● Unanswered (",N.total-N.attempted,")"]})]})]}),(0,n.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"12px",overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,0.05)",flex:1,minHeight:0,display:"flex",flexDirection:"column"},children:[(0,n.jsxs)("div",{style:{backgroundColor:"#0284c7",color:"white",padding:"8px 14px",display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:"13px",flexWrap:"wrap",gap:"6px",flexShrink:0},children:[(0,n.jsxs)("span",{children:["Exam: ",N.examName]}),(0,n.jsxs)("span",{children:["Score: ",N.score," / ",N.total," (",N.percentage,"%)"]}),n.jsx("span",{children:"Click question number to review"})]}),n.jsx("div",{style:{padding:"8px 12px",flex:1,minHeight:0,display:"flex",flexDirection:"column",overflow:"hidden"},children:(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",gap:"12px",flex:1,minHeight:0,height:"100%",overflow:"hidden"},children:[(0,n.jsxs)("div",{style:{flex:1,borderRight:"2px solid #e2e8f0",paddingRight:"10px",display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"},children:[n.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 4px 0",fontSize:"13px",fontWeight:"800",flexShrink:0},children:"Reading Questions (1 - 20)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gridTemplateRows:"repeat(5, 1fr)",gap:"5px",flex:1,height:"100%",minHeight:0},children:r.slice(0,20).map((t,e)=>{let i=s(t,e),o=null!=i&&""!==i,r=o&&void 0!==t.answer&&Number(i)===Number(t.answer),a="white",p="#cbd5e1",d="#1e293b";return o&&(r?(a="#16a34a",p="#15803d"):(a="#ef4444",p="#dc2626"),d="white"),n.jsx("button",{type:"button",onClick:()=>A(e),style:{height:"100%",minHeight:0,padding:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:a,border:`1.5px solid ${p}`,borderRadius:"12px",fontWeight:"800",fontSize:"13px",cursor:"pointer",color:d,boxShadow:"0 1px 2px rgba(0,0,0,0.05)"},children:e+1},e)})})]}),(0,n.jsxs)("div",{style:{flex:1,paddingLeft:"10px",display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"},children:[n.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 4px 0",fontSize:"13px",fontWeight:"800",flexShrink:0},children:"Listening Questions (21 - 40)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gridTemplateRows:"repeat(5, 1fr)",gap:"5px",flex:1,height:"100%",minHeight:0},children:r.slice(20,40).map((t,e)=>{let i=e+20,o=s(t,i),r=null!=o&&""!==o,a=r&&void 0!==t.answer&&Number(o)===Number(t.answer),p="white",d="#cbd5e1",l="#1e293b";return r&&(a?(p="#16a34a",d="#15803d"):(p="#ef4444",d="#dc2626"),l="white"),n.jsx("button",{type:"button",onClick:()=>A(i),style:{height:"100%",minHeight:0,padding:0,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:p,border:`1.5px solid ${d}`,borderRadius:"12px",fontWeight:"800",fontSize:"13px",cursor:"pointer",color:l,boxShadow:"0 1px 2px rgba(0,0,0,0.05)"},children:i+1},i)})})]})]})})]})]}):(0,n.jsxs)("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"},children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
          .exam-finish-top-bar {
            background-color: #0284c7;
            color: white;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .exam-finish-wrap {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
          }
          .exam-finish-card {
            width: 100%;
            max-width: 500px;
            background-color: white;
            border-radius: 24px;
            padding: 26px 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e2e8f0;
            box-sizing: border-box;
            max-height: 94vh;
            overflow-y: auto;
          }
          .exam-finish-header {
            text-align: center;
            margin-bottom: 18px;
          }
          .exam-finish-trophy {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: #fef3c7;
            border: 1px solid #fde68a;
            margin: 0 auto 10px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
          }
          .exam-finish-title {
            color: #0f172a;
            font-size: 22px;
            margin: 0 0 8px 0;
            font-weight: 800;
          }
          .exam-finish-badge {
            display: inline-block;
            background-color: #f1f5f9;
            padding: 6px 14px;
            border-radius: 20px;
            color: #475569;
            font-weight: 600;
            font-size: 13.5px;
          }
          .exam-finish-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .exam-finish-stats {
            background-color: #f8fafc;
            border-radius: 16px;
            padding: 16px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            border: 1px solid #e2e8f0;
          }
          .exam-finish-actions {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          /* LANDSCAPE MODE: FIT ON SCREEN CLEANLY WITHOUT SCROLL OR OVERFLOW */
          @media (orientation: landscape), (max-height: 650px) {
            .exam-finish-top-bar {
              display: none !important;
            }
            .exam-finish-wrap {
              padding: 6px 12px !important;
              height: 100vh !important;
              height: 100dvh !important;
              min-height: 0 !important;
              overflow: hidden !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .exam-finish-card {
              max-width: 660px !important;
              width: 100% !important;
              padding: 12px 20px !important;
              max-height: calc(100dvh - 16px) !important;
              border-radius: 24px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              box-sizing: border-box !important;
              overflow-y: auto !important;
            }
            .exam-finish-header {
              margin-bottom: 8px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 12px !important;
              text-align: left !important;
            }
            .exam-finish-trophy {
              width: 38px !important;
              height: 38px !important;
              font-size: 20px !important;
              margin: 0 !important;
              flex-shrink: 0 !important;
            }
            .exam-finish-title {
              font-size: 16px !important;
              margin: 0 !important;
            }
            .exam-finish-badge {
              font-size: 12px !important;
              padding: 2px 10px !important;
              border-radius: 14px !important;
            }
            .exam-finish-grid {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              gap: 12px !important;
              width: 100% !important;
            }
            .exam-finish-stats {
              width: 100% !important;
              max-width: 420px !important;
              padding: 8px 16px !important;
              gap: 4px !important;
              margin-bottom: 0 !important;
              border-radius: 14px !important;
            }
            .exam-finish-stats > div {
              padding-bottom: 3px !important;
              max-width: 100% !important;
            }
            .exam-finish-stats span {
              font-size: 13px !important;
            }
            .exam-finish-actions {
              display: flex !important;
              flex-direction: row !important;
              justify-content: center !important;
              gap: 12px !important;
              width: 100% !important;
              max-width: 420px !important;
            }
            .exam-finish-actions button {
              flex: 1 !important;
              width: auto !important;
              max-width: none !important;
              min-width: 0 !important;
              padding: 10px 16px !important;
              font-size: 13px !important;
              border-radius: 8px !important;
            }
          }
        `}}),n.jsx("div",{className:"exam-finish-top-bar",children:n.jsx("span",{children:"Exam Summary"})}),n.jsx("div",{className:"exam-finish-wrap",children:(0,n.jsxs)("div",{className:"exam-finish-card",children:[(0,n.jsxs)("div",{className:"exam-finish-header",children:[n.jsx("div",{className:"exam-finish-trophy",children:"\uD83C\uDFC6"}),(0,n.jsxs)("div",{children:[n.jsx("h2",{className:"exam-finish-title",children:"Congratulations, Exam Ended!"}),(0,n.jsxs)("div",{className:"exam-finish-badge",children:[n.jsx("span",{style:{color:"#0284c7"},children:"\uD83D\uDC64 Name:"})," ",a," \xa0 | \xa0 ",n.jsx("span",{style:{color:"#0284c7"},children:"Exam:"})," ",N.examName]})]})]}),(0,n.jsxs)("div",{className:"exam-finish-grid",children:[(0,n.jsxs)("div",{className:"exam-finish-stats",children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Total Questions"}),n.jsx("span",{style:{color:"#0f172a",fontSize:"14px",fontWeight:"bold"},children:N.total||40})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Total Attempted"}),n.jsx("span",{style:{color:"#0f172a",fontSize:"14px",fontWeight:"bold"},children:N.attempted})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Total Correct"}),(0,n.jsxs)("span",{style:{color:"#16a34a",fontSize:"16px",fontWeight:"900"},children:[N.score," / ",N.total||40]})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Reading Score"}),(0,n.jsxs)("span",{style:{color:"#0284c7",fontSize:"13.5px",fontWeight:"700"},children:[N.readingScore??5*(N.readingCorrect||0)," / 100"]})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Listening Score"}),(0,n.jsxs)("span",{style:{color:"#0284c7",fontSize:"13.5px",fontWeight:"700"},children:[N.listeningScore??5*(N.listeningCorrect||0)," / 100"]})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",paddingTop:"3px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Percentage & Status"}),(0,n.jsxs)("span",{style:{color:N.passed?"#16a34a":"#ef4444",fontSize:"14px",fontWeight:"900"},children:[N.percentage,"% \xa0 (",N.passed?"PASSED":"FAILED",")"]})]})]}),(0,n.jsxs)("div",{className:"exam-finish-actions",children:[n.jsx("button",{type:"button",onClick:()=>W(!0),style:{flex:1,minWidth:"160px",backgroundColor:"#0284c7",color:"white",border:"none",padding:"12px 18px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"VIEW REVIEW (1-40)"}),n.jsx("button",{type:"button",onClick:()=>t.push("/student"),style:{flex:1,minWidth:"160px",backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",padding:"12px 18px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer"},children:"CLOSE"})]})]})]})})]})}if(0===h.length)return n.jsx("div",{style:{padding:"50px",textAlign:"center"},children:"Loading exam questions..."});let td={width:"100%",height:"100%",minHeight:0,display:"flex",flexDirection:"column",backgroundColor:"#ffffff",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"0",overflow:"hidden",position:"relative",backgroundImage:"none",...ts};return n.jsx("div",{className:"ubt-exam-landscape-enforcer",children:(0,n.jsxs)("div",{className:"ubt-exam-wrapper",style:td,onContextMenu:t=>t.preventDefault(),children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
        .ubt-exam-wrapper {
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          max-height: 100dvh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 0;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2147483640;
          background-color: #ffffff;
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
        .ubt-exam-card {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          border-radius: 0 0 18px 18px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .ubt-exam-columns {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .ubt-exam-left {
          flex: 1.25;
          padding: 14px 18px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          height: 100%;
          min-height: 0;
        }
        .ubt-exam-right {
          flex: 1;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 8px;
          overflow-y: auto;
          height: 100%;
          min-height: 0;
        }
        .ubt-exam-header-bar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          background-color: #0284c7;
          color: white;
          padding-top: max(calc(env(safe-area-inset-top, 0px) + 10px), 38px);
          padding-bottom: 8px;
          padding-left: calc(env(safe-area-inset-left, 0px) + 16px);
          padding-right: calc(env(safe-area-inset-right, 0px) + 16px);
          border-radius: 18px 18px 0 0;
          font-weight: bold;
          font-size: 14px;
          gap: 8px;
          flex-shrink: 0;
          box-sizing: border-box;
          width: 100%;
        }
        .ubt-exam-header-bar > *:nth-child(1) {
          justify-self: start;
          text-align: left;
        }
        .ubt-exam-header-bar > *:nth-child(2) {
          justify-self: center;
          text-align: center;
          font-weight: 800;
        }
        .ubt-exam-header-bar > *:nth-child(3) {
          justify-self: end;
          text-align: right;
        }
        .ubt-exam-nav-bar {
          display: flex;
          padding: 9px 18px;
          background-color: #f8fafc;
          border-top: 1px solid #cbd5e1;
          border-radius: 0 0 18px 18px;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .ubt-exam-nav-bar button {
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 9px 20px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 13.5px;
          cursor: pointer;
          letter-spacing: 0.3px;
          box-shadow: 0 2px 6px rgba(14, 165, 233, 0.35);
          transition: all 0.15s ease;
        }
        .ubt-exam-nav-bar button:active {
          transform: scale(0.97);
        }
        .ubt-overview-box {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 14px 18px;
          border-radius: 0 0 18px 18px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          overflow: hidden;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .ubt-overview-flex {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }
        .ubt-overview-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }
        .ubt-overview-col:first-child {
          border-right: 2px solid #e2e8f0;
          padding-right: 14px;
        }
        .ubt-overview-col:last-child {
          padding-left: 14px;
        }
        .ubt-overview-grid-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }
        .ubt-overview-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 6px;
          max-width: 420px;
          width: 100%;
          margin: 0 auto;
          flex: 1;
          height: 100%;
        }
        .ubt-overview-grid button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 68px;
          height: 44px;
          min-height: 44px;
          margin: 0 auto;
          padding: 0;
          font-size: 14.5px;
          font-weight: 800;
          border-radius: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.15s ease;
        }

        /* LANDSCAPE OPTIMIZED EXAM STYLING: ALWAYS FIT FULL DISPLAY SCREEN */
        @media (orientation: landscape), (max-height: 650px) {
          .ubt-exam-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            width: 100dvw !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            border-radius: 0 !important;
            background-color: #ffffff !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            max-height: 100% !important;
            max-width: 100% !important;
            width: 100% !important;
            justify-content: stretch !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            flex: 1 !important;
            min-height: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
          }
          .ubt-exam-card {
            flex: 1 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            justify-content: space-between !important;
          }
          .ubt-exam-columns {
            flex-direction: row !important;
            flex: 1 !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }
          .ubt-exam-left {
            flex: 1.25 !important;
            padding: 10px 18px !important;
            border-right: 1.5px solid #e2e8f0 !important;
            border-bottom: none !important;
            max-height: none !important;
            overflow-y: auto !important;
            height: 100% !important;
            min-height: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
          }
          .ubt-exam-left p {
            font-size: 19px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            margin-bottom: 8px !important;
            line-height: 1.4 !important;
          }
          .ubt-exam-desc {
            font-size: 17px !important;
            font-weight: 600 !important;
            padding: 10px 14px !important;
            margin-bottom: 8px !important;
            line-height: 1.4 !important;
            border-radius: 8px !important;
            border: 1.5px solid #cbd5e1 !important;
            background-color: #f8fafc !important;
          }
          .ubt-exam-q-img {
            max-height: 125px !important;
            object-fit: contain !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            padding: 10px 18px !important;
            overflow-y: auto !important;
            height: 100% !important;
            min-height: 0 !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-evenly !important;
            gap: 8px !important;
          }
          .ubt-opt-row {
            padding: 9px 14px !important;
            border-radius: 10px !important;
            border: 1.5px solid #cbd5e1 !important;
            background-color: #ffffff !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03) !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
          }
          .ubt-opt-row:active {
            transform: scale(0.99) !important;
          }
          .ubt-opt-selected {
            background-color: #eff6ff !important;
            border-color: #0284c7 !important;
            border-width: 2px !important;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.2) !important;
          }
          .ubt-opt-selected .ubt-opt-badge {
            background-color: #0284c7 !important;
            color: #ffffff !important;
            border-color: #0284c7 !important;
          }
          .ubt-opt-selected .ubt-opt-text {
            color: #0369a1 !important;
            font-weight: 700 !important;
          }
          .ubt-opt-badge {
            width: 28px !important;
            height: 28px !important;
            font-size: 14px !important;
            font-weight: 800 !important;
            margin-right: 12px !important;
            border-radius: 50% !important;
            border-width: 2px !important;
            flex-shrink: 0 !important;
          }
          .ubt-opt-text {
            font-size: 18px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            line-height: 1.35 !important;
          }
          .ubt-opt-grid-img {
            max-height: 75px !important;
          }
          .ubt-opt-blind-btn {
            padding: 12px 14px !important;
          }
          .ubt-opt-blind-symbol {
            font-size: 30px !important;
          }
          .ubt-exam-header-bar {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            align-items: center !important;
            padding-top: max(calc(env(safe-area-inset-top, 0px) + 10px), 38px) !important;
            padding-bottom: 7px !important;
            padding-left: calc(env(safe-area-inset-left, 0px) + 18px) !important;
            padding-right: calc(env(safe-area-inset-right, 0px) + 18px) !important;
            font-size: 13.5px !important;
            font-weight: 700 !important;
            border-radius: 0 !important;
            flex-shrink: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .ubt-exam-header-bar > *:nth-child(1) {
            justify-self: start !important;
            text-align: left !important;
          }
          .ubt-exam-header-bar > *:nth-child(2) {
            justify-self: center !important;
            text-align: center !important;
            font-weight: 800 !important;
          }
          .ubt-exam-header-bar > *:nth-child(3) {
            justify-self: end !important;
            text-align: right !important;
          }
          .ubt-exam-nav-bar {
            padding-top: 7px !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px) !important;
            padding-left: calc(env(safe-area-inset-left, 0px) + 18px) !important;
            padding-right: calc(env(safe-area-inset-right, 0px) + 18px) !important;
            border-radius: 0 !important;
            flex-shrink: 0 !important;
            gap: 12px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 7px 22px !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
            min-width: 0 !important;
          }

          /* OVERVIEW GRID: CENTERED, COMPACT QUESTIONS & STATUS BAR CLEARANCE */
          .ubt-overview-box {
            padding: 6px 14px !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px) !important;
            border-radius: 0 !important;
            border: none !important;
            flex: 1 !important;
            min-height: 0 !important;
            height: 100% !important;
            max-height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .ubt-overview-flex {
            flex-direction: row !important;
            gap: 16px !important;
            flex: 1 !important;
            min-height: 0 !important;
            max-width: 960px !important;
            width: 100% !important;
            margin: auto 0 !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          .ubt-overview-col {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            min-height: 0 !important;
            overflow: hidden !important;
            padding: 0 4px !important;
          }
          .ubt-overview-col:first-child {
            border-right: 1.5px solid #e2e8f0 !important;
            padding-right: 12px !important;
          }
          .ubt-overview-col:last-child {
            padding-left: 12px !important;
          }
          .ubt-overview-box h4, .ubt-overview-heading {
            margin: 0 0 4px 0 !important;
            font-size: 12.5px !important;
            font-weight: 800 !important;
            flex-shrink: 0 !important;
            text-align: center !important;
            color: #0284c7 !important;
          }
          .ubt-overview-grid-scroll {
            flex: 1 !important;
            min-height: 0 !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .ubt-overview-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            grid-template-rows: repeat(5, 1fr) !important;
            gap: 5px !important;
            height: 100% !important;
            flex: 1 !important;
            min-height: 0 !important;
            align-content: stretch !important;
            width: 100% !important;
          }
          .ubt-overview-grid button {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 0 !important;
            font-size: 13.5px !important;
            font-weight: 800 !important;
            border-radius: 12px !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
          }
          .ubt-overview-actions {
            margin-top: 4px !important;
            gap: 12px !important;
            flex-shrink: 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            max-width: 960px !important;
            box-sizing: border-box !important;
            padding-left: calc(env(safe-area-inset-left, 0px) + 8px) !important;
            padding-right: calc(env(safe-area-inset-right, 0px) + 8px) !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px) !important;
          }
          .ubt-overview-actions button {
            padding: 5px 16px !important;
            font-size: 12px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
          }
        }

        /* =====================================================
           FORCE LANDSCAPE: rotate entire exam when device is
           held in portrait — works on ALL mobile browsers
        ====================================================== */
        @media (orientation: portrait) {
          .ubt-exam-landscape-enforcer {
            position: fixed !important;
            top: 0; left: 0;
            width: 100vh !important;
            width: 100dvh !important;
            height: 100vw !important;
            height: 100dvw !important;
            transform: rotate(90deg) !important;
            transform-origin: top left !important;
            left: 100vw !important;
            left: 100dvw !important;
            overflow: hidden !important;
            z-index: 2147483640 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            border-radius: 0 !important;
            background-color: #ffffff !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-main {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            flex: 1 !important;
            min-height: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-card {
            flex: 1 !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            overflow: hidden !important;
            justify-content: space-between !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-columns {
            flex-direction: row !important;
            flex: 1 !important;
            min-height: 0 !important;
            overflow: hidden !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-left {
            flex: 1.25 !important;
            border-right: 1.5px solid #e2e8f0 !important;
            border-bottom: none !important;
            height: 100% !important;
            max-height: none !important;
            overflow-y: auto !important;
            padding: 8px 16px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-left p {
            font-size: 18.5px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            margin-bottom: 6px !important;
            line-height: 1.35 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-desc {
            font-size: 16.5px !important;
            font-weight: 600 !important;
            padding: 8px 12px !important;
            margin-bottom: 6px !important;
            border-radius: 8px !important;
            border: 1.5px solid #cbd5e1 !important;
            background-color: #f8fafc !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-q-img {
            max-height: 115px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-right {
            flex: 1 !important;
            height: 100% !important;
            max-height: none !important;
            overflow-y: auto !important;
            padding: 8px 16px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-evenly !important;
            gap: 6px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-row {
            padding: 8px 12px !important;
            border-radius: 10px !important;
            border: 1.5px solid #cbd5e1 !important;
            background-color: #ffffff !important;
            cursor: pointer !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-selected {
            background-color: #eff6ff !important;
            border-color: #0284c7 !important;
            border-width: 2px !important;
            box-shadow: 0 2px 8px rgba(2, 132, 199, 0.2) !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-selected .ubt-opt-badge {
            background-color: #0284c7 !important;
            color: #ffffff !important;
            border-color: #0284c7 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-selected .ubt-opt-text {
            color: #0369a1 !important;
            font-weight: 700 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-badge {
            width: 26px !important;
            height: 26px !important;
            font-size: 13.5px !important;
            font-weight: 800 !important;
            margin-right: 10px !important;
            border-radius: 50% !important;
            border-width: 2px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-text {
            font-size: 18px !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            line-height: 1.35 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-grid-img {
            max-height: 70px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-blind-btn {
            padding: 10px 12px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-opt-blind-symbol {
            font-size: 28px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-header-bar {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
            align-items: center !important;
            padding-top: max(calc(env(safe-area-inset-top, 0px) + 10px), 38px) !important;
            padding-bottom: 7px !important;
            padding-left: calc(env(safe-area-inset-left, 0px) + 16px) !important;
            padding-right: calc(env(safe-area-inset-right, 0px) + 16px) !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            border-radius: 0 !important;
            flex-shrink: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-header-bar > *:nth-child(1) {
            justify-self: start !important;
            text-align: left !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-header-bar > *:nth-child(2) {
            justify-self: center !important;
            text-align: center !important;
            font-weight: 800 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-header-bar > *:nth-child(3) {
            justify-self: end !important;
            text-align: right !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-nav-bar {
            padding-top: 6px !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px) !important;
            padding-left: calc(env(safe-area-inset-left, 0px) + 16px) !important;
            padding-right: calc(env(safe-area-inset-right, 0px) + 16px) !important;
            border-radius: 0 !important;
            flex-shrink: 0 !important;
            gap: 10px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-exam-nav-bar button {
            padding: 6px 18px !important;
            font-size: 12.5px !important;
            font-weight: 800 !important;
            min-width: 0 !important;
            border-radius: 8px !important;
          }

          /* ROTATED OVERVIEW: CENTERED, COMPACT QUESTIONS & ZERO CUT-OFF */
          .ubt-exam-landscape-enforcer .ubt-overview-box {
            padding: 6px 12px !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px) !important;
            border-radius: 0 !important;
            border: none !important;
            flex: 1 !important;
            min-height: 0 !important;
            height: 100% !important;
            max-height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-flex {
            flex-direction: row !important;
            gap: 14px !important;
            flex: 1 !important;
            min-height: 0 !important;
            max-width: 960px !important;
            width: 100% !important;
            margin: auto 0 !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-col {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            min-height: 0 !important;
            overflow: hidden !important;
            padding: 0 4px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-col:first-child {
            border-right: 1.5px solid #e2e8f0 !important;
            padding-right: 10px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-col:last-child {
            padding-left: 10px !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-box h4,
          .ubt-exam-landscape-enforcer .ubt-overview-heading {
            margin: 0 0 5px 0 !important;
            font-size: 12.5px !important;
            font-weight: 800 !important;
            flex-shrink: 0 !important;
            text-align: center !important;
            color: #0284c7 !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-grid-scroll {
            flex: 1 !important;
            min-height: 0 !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-grid {
            display: grid !important;
            grid-template-columns: repeat(5, 1fr) !important;
            grid-template-rows: repeat(4, 1fr) !important;
            gap: 5px !important;
            max-width: 420px !important;
            width: 100% !important;
            margin: 0 auto !important;
            height: 100% !important;
            flex: 1 !important;
            min-height: 0 !important;
            align-content: stretch !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-grid button {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            max-width: 68px !important;
            height: 42px !important;
            min-height: 40px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            font-size: 14px !important;
            font-weight: 800 !important;
            border-radius: 10px !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.06) !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-actions {
            margin-top: 4px !important;
            gap: 10px !important;
            flex-shrink: 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            max-width: 960px !important;
            box-sizing: border-box !important;
            padding-left: calc(env(safe-area-inset-left, 0px) + 8px) !important;
            padding-right: calc(env(safe-area-inset-right, 0px) + 8px) !important;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 6px) !important;
          }
          .ubt-exam-landscape-enforcer .ubt-overview-actions button {
            padding: 5px 16px !important;
            font-size: 12px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
          }
        }
        @media (orientation: landscape) {
          .ubt-exam-landscape-enforcer {
            position: fixed !important;
            top: 0; left: 0;
            width: 100vw !important;
            width: 100dvw !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow: hidden !important;
            z-index: 2147483640 !important;
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

        @media (orientation: landscape) and (max-height: 520px) {
          .ubt-confirm-modal-card {
            padding: 12px 18px !important;
            border-radius: 14px !important;
            max-height: 94dvh !important;
          }
          .ubt-confirm-modal-icon {
            width: 32px !important;
            height: 32px !important;
            margin-bottom: 4px !important;
          }
          .ubt-confirm-modal-icon svg {
            width: 17px !important;
            height: 17px !important;
          }
          .ubt-confirm-modal-title {
            font-size: 15px !important;
            margin-bottom: 4px !important;
          }
          .ubt-confirm-modal-text {
            font-size: 12px !important;
            margin-bottom: 10px !important;
          }
          .ubt-confirm-btn-cancel,
          .ubt-confirm-btn-submit {
            padding: 7px 12px !important;
            font-size: 12px !important;
          }
        }
      `}}),f&&n.jsx("div",{className:"ubt-confirm-modal-overlay",children:(0,n.jsxs)("div",{className:"ubt-confirm-modal-card",children:[n.jsx("div",{className:"ubt-confirm-modal-icon",children:(0,n.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("path",{d:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"}),n.jsx("polyline",{points:"14 2 14 8 20 8"}),n.jsx("line",{x1:"16",y1:"13",x2:"8",y2:"13"}),n.jsx("line",{x1:"16",y1:"17",x2:"8",y2:"17"}),n.jsx("polyline",{points:"10 9 9 9 8 9"})]})}),n.jsx("h3",{className:"ubt-confirm-modal-title",children:"Confirm Submission"}),n.jsx("p",{className:"ubt-confirm-modal-text",children:"Are you sure you want to submit and complete the exam? Your final score and answer breakdown will be calculated."}),(0,n.jsxs)("div",{className:"ubt-confirm-modal-actions",children:[n.jsx("button",{type:"button",className:"ubt-confirm-btn-cancel",onClick:()=>u(!1),children:"CONTINUE TEST"}),n.jsx("button",{type:"button",className:"ubt-confirm-btn-submit",onClick:tr,children:"YES, SUBMIT"})]})]})}),"overview"===c?(0,n.jsxs)("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"100%",width:"100%",height:"100%",margin:"0",justifyContent:"stretch",borderRadius:"0",overflow:"hidden"},children:[(0,n.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"grid",gridTemplateColumns:"1fr auto 1fr",backgroundColor:"#0284c7",color:"white",padding:"8px 18px",paddingTop:"max(calc(env(safe-area-inset-top, 0px) + 10px), 38px)",paddingLeft:"calc(env(safe-area-inset-left, 0px) + 18px)",paddingRight:"calc(env(safe-area-inset-right, 0px) + 18px)",borderRadius:"0",alignItems:"center",fontWeight:"bold",fontSize:"14px"},children:[(0,n.jsxs)("span",{style:{justifySelf:"start"},children:["Remaining Questions: ",tp]}),n.jsx("span",{style:{justifySelf:"center",textAlign:"center",fontWeight:"900"},children:k}),(0,n.jsxs)("div",{style:{justifySelf:"end",display:"flex",alignItems:"center",gap:"10px"},children:[(0,n.jsxs)("span",{style:{textAlign:"right"},children:["Time Remaining: ",K(j)]}),n.jsx("button",{type:"button",onClick:X,title:"Toggle Fullscreen",style:{background:"rgba(255, 255, 255, 0.22)",border:"1px solid rgba(255, 255, 255, 0.45)",color:"#ffffff",borderRadius:"6px",padding:"3px 8px",fontSize:"11.5px",fontWeight:"700",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"4px",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"},children:"⛶ Fullscreen"})]})]}),(0,n.jsxs)("div",{className:"ubt-overview-box",style:{backgroundColor:"#ffffff",border:"none",padding:"6px 14px",paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 6px)",borderRadius:"0",flex:1,minHeight:0,display:"flex",flexDirection:"column",justifyContent:"space-between",alignItems:"center",overflow:"hidden"},children:[(0,n.jsxs)("div",{className:"ubt-overview-flex",style:{display:"flex",justifyContent:"center",alignItems:"center",gap:"16px",flex:1,minHeight:0,maxWidth:"960px",width:"100%",margin:"auto 0",overflow:"hidden"},children:[(0,n.jsxs)("div",{className:"ubt-overview-col",style:{flex:1,borderRight:"2px solid #e2e8f0",paddingRight:"10px",display:"flex",flexDirection:"column",justifyContent:"center",minHeight:0,overflow:"hidden"},children:[n.jsx("h4",{className:"ubt-overview-heading",style:{textAlign:"center",color:"#0284c7",margin:"0 0 6px 0",fontSize:"14px",fontWeight:"800",flexShrink:0},children:"Reading Questions (1 - 20)"}),n.jsx("div",{className:"ubt-overview-grid-scroll",style:{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"},children:n.jsx("div",{className:"ubt-overview-grid",style:{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gridTemplateRows:"repeat(4, 1fr)",gap:"6px",maxWidth:"420px",width:"100%",margin:"0 auto",height:"100%",minHeight:0,alignContent:"stretch"},children:h.slice(0,20).map((t,e)=>{let i=b===e,o=void 0!==w[t.id];return n.jsx("button",{type:"button",onClick:()=>{y(e),m("single")},style:{display:"flex",alignItems:"center",justifyContent:"center",padding:0,width:"100%",maxWidth:"68px",height:"44px",minHeight:"44px",margin:"0 auto",backgroundColor:i?"#0284c7":o?"#dcfce7":"white",border:i?"2.5px solid #0369a1":o?"2px solid #16a34a":"1.5px solid #0284c7",borderRadius:"10px",fontWeight:"800",fontSize:"14.5px",cursor:"pointer",color:i?"#ffffff":o?"#15803d":"#0f172a",boxShadow:i?"0 3px 8px rgba(2, 132, 199, 0.35)":"0 1px 2px rgba(0,0,0,0.05)",transition:"0.15s"},children:e+1},t.id)})})})]}),(0,n.jsxs)("div",{className:"ubt-overview-col",style:{flex:1,paddingLeft:"10px",display:"flex",flexDirection:"column",justifyContent:"center",minHeight:0,overflow:"hidden"},children:[n.jsx("h4",{className:"ubt-overview-heading",style:{textAlign:"center",color:"#0284c7",margin:"0 0 6px 0",fontSize:"14px",fontWeight:"800",flexShrink:0},children:"Listening Questions (21 - 40)"}),n.jsx("div",{className:"ubt-overview-grid-scroll",style:{flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",display:"flex",flexDirection:"column",justifyContent:"center"},children:n.jsx("div",{className:"ubt-overview-grid",style:{display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gridTemplateRows:"repeat(4, 1fr)",gap:"6px",maxWidth:"420px",width:"100%",margin:"0 auto",height:"100%",minHeight:0,alignContent:"stretch"},children:h.slice(20,40).map((t,e)=>{let i=e+20,o=b===i,r=void 0!==w[t.id];return n.jsx("button",{type:"button",onClick:()=>{y(i),m("single")},style:{display:"flex",alignItems:"center",justifyContent:"center",padding:0,width:"100%",maxWidth:"68px",height:"44px",minHeight:"44px",margin:"0 auto",backgroundColor:o?"#0284c7":r?"#dcfce7":"white",border:o?"2.5px solid #0369a1":r?"2px solid #16a34a":"1.5px solid #0284c7",borderRadius:"10px",fontWeight:"800",fontSize:"14.5px",cursor:"pointer",color:o?"#ffffff":r?"#15803d":"#0f172a",boxShadow:o?"0 3px 8px rgba(2, 132, 199, 0.35)":"0 1px 2px rgba(0,0,0,0.05)",transition:"0.15s"},children:i+1},t.id)})})})]})]}),(0,n.jsxs)("div",{className:"ubt-overview-actions",style:{marginTop:"4px",display:"flex",justifyContent:"space-between",gap:"10px",alignItems:"center",flexShrink:0,width:"100%",maxWidth:"960px",paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 6px)",paddingLeft:"calc(env(safe-area-inset-left, 0px) + 8px)",paddingRight:"calc(env(safe-area-inset-right, 0px) + 8px)"},children:[n.jsx("button",{type:"button",onClick:()=>m("single"),style:{backgroundColor:"#64748b",color:"white",border:"none",padding:"5px 16px",fontSize:"12px",fontWeight:"800",borderRadius:"8px",cursor:"pointer",boxShadow:"0 2px 6px rgba(100, 116, 139, 0.35)"},children:"❮ BACK TO QUESTION"}),n.jsx("button",{type:"button",onClick:()=>u(!0),style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"5px 16px",fontSize:"12px",fontWeight:"800",borderRadius:"8px",cursor:"pointer",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)"},children:"SUBMIT AND FINISH EXAM ❯"})]})]})]}):n.jsx("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"100%",width:"100%",height:"100%",margin:"0",justifyContent:"stretch",borderRadius:"0",overflow:"hidden"},children:(()=>{let t=h[b];return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",minHeight:0},children:[(0,n.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"grid",gridTemplateColumns:"1fr auto 1fr",backgroundColor:"#0284c7",color:"white",padding:"8px 18px",paddingTop:"max(calc(env(safe-area-inset-top, 0px) + 10px), 38px)",paddingLeft:"calc(env(safe-area-inset-left, 0px) + 18px)",paddingRight:"calc(env(safe-area-inset-right, 0px) + 18px)",borderRadius:"0",alignItems:"center",fontWeight:"bold",fontSize:"14px"},children:[(0,n.jsxs)("span",{style:{justifySelf:"start"},children:["Remaining Questions: ",tp]}),n.jsx("span",{style:{justifySelf:"center",textAlign:"center",fontWeight:"900"},children:k}),(0,n.jsxs)("div",{style:{justifySelf:"end",display:"flex",alignItems:"center",gap:"10px"},children:[(0,n.jsxs)("span",{style:{textAlign:"right"},children:["Time Remaining: ",K(j)]}),n.jsx("button",{type:"button",onClick:X,title:"Toggle Fullscreen",style:{background:"rgba(255, 255, 255, 0.22)",border:"1px solid rgba(255, 255, 255, 0.45)",color:"#ffffff",borderRadius:"6px",padding:"3px 8px",fontSize:"11.5px",fontWeight:"700",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"4px",boxShadow:"0 1px 3px rgba(0,0,0,0.15)"},children:"⛶ Fullscreen"})]})]}),(0,n.jsxs)("div",{className:"ubt-exam-card",style:{backgroundColor:"#ffffff",border:"none",borderRadius:"0",display:"flex",flexDirection:"column",justifyContent:"space-between",flex:1,minHeight:0,overflow:"hidden"},children:[(0,n.jsxs)("div",{className:"ubt-exam-columns",style:{display:"flex",flex:1,overflow:"hidden"},children:[(0,n.jsxs)("div",{className:"ubt-exam-left",style:{flex:1.25,padding:"14px 18px",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",overflowY:"auto",height:"100%"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"8px",marginBottom:"8px",flexWrap:"wrap",flexShrink:0},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[(0,n.jsxs)("span",{className:"ubt-qnum-pill",style:{backgroundColor:"#0284c7",color:"#ffffff",fontWeight:"900",fontSize:"14px",padding:"4px 12px",borderRadius:"8px",letterSpacing:"0.5px",minWidth:"75px",textAlign:"center",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 4px rgba(2, 132, 199, 0.2)"},children:["Question ",b+1]}),(0,n.jsxs)("span",{style:{backgroundColor:b<20?"#eff6ff":"#fef3c7",color:b<20?"#1d4ed8":"#b45309",fontWeight:"800",fontSize:"12px",padding:"3px 10px",borderRadius:"6px",border:b<20?"1px solid #bfdbfe":"1px solid #fde68a"},children:[b<20?"\uD83D\uDCD6 Reading":"\uD83C\uDFA7 Listening"," • ",b+1," / ",h.length||40]})]}),n.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:void 0!==w[t?.id]?"#16a34a":"#64748b",backgroundColor:void 0!==w[t?.id]?"#dcfce7":"#f1f5f9",padding:"2px 8px",borderRadius:"6px"},children:void 0!==w[t?.id]?"✓ Answered":"Not Answered"})]}),n.jsx("p",{style:{color:"#1e293b",fontSize:"19px",fontWeight:"bold",margin:"0 0 8px 0",lineHeight:"1.4"},children:t.mainHeading||(b<20?"[ 1 - 20 ] 다음을 읽고 알맞은 것을 고르십시오.":"[ 21 - 40 ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.")}),t.questionHeading&&t.questionHeading.trim()!==String(b+1)&&n.jsx("p",{style:{color:"#334155",fontSize:"18px",fontWeight:"bold",margin:"0 0 8px 0",lineHeight:"1.4"},children:t.questionHeading}),t.description&&n.jsx("div",{className:"ubt-exam-desc",style:{border:"1px solid #94a3b8",borderRadius:"6px",padding:"12px 15px",backgroundColor:"white",color:"#1e293b",fontSize:"18px",fontWeight:"bold",lineHeight:"1.4",whiteSpace:"pre-wrap",marginBottom:"10px"},dangerouslySetInnerHTML:{__html:t.description}}),t.image&&n.jsx("div",{style:{margin:"auto",border:"1px solid #cbd5e1",padding:"6px",borderRadius:"6px",backgroundColor:"white",textAlign:"center"},children:n.jsx("img",{className:"ubt-exam-q-img",src:t.image,alt:"Question Visual",style:{display:"block",maxHeight:"180px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",margin:"0 auto",pointerEvents:"none",imageRendering:"high-quality",WebkitImageRendering:"-webkit-optimize-contrast"},draggable:"false"})}),t.audio&&n.jsx("div",{style:{marginTop:"12px",padding:"10px",backgroundColor:"#f8fafc",borderRadius:"6px",border:"1px solid #cbd5e1",textAlign:"center"},children:n.jsx("audio",{ref:L,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:t=>t.preventDefault(),onPlay:te,onEnded:ti,src:t.audio,style:{width:"100%",height:"32px",pointerEvents:P||U?"none":"auto",opacity:P?.5:1,filter:P?"grayscale(80%)":"none"}})})]}),n.jsx("div",{className:"ubt-exam-right",style:{flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",justifyContent:"space-evenly",gap:"8px",overflowY:"auto",height:"100%"},children:(()=>{let e=t.options||[],i=e.some(t=>!!("object"==typeof t&&null!==t&&t.image));return!i&&e.every(t=>{let e="object"==typeof t&&null!==t?(t.text||"").trim():(t||"").toString().trim();return!e||["①","②","③","④","1","2","3","4"].includes(e)})?(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"16px",justifyContent:"center",height:"100%",padding:"10px"},children:[n.jsx("p",{style:{color:"#475569",fontSize:"16px",margin:"0 0 10px 0",fontWeight:"600",textAlign:"center"},children:"\uD83C\uDFA7 다음을 듣고 알맞은 번호를 고르십시오. (Blind Listening)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"},children:e.map((e,i)=>{let o=w[t.id]===i;return(0,n.jsxs)("button",{type:"button",onClick:()=>tt(i),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 15px",borderRadius:"12px",border:o?"3px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:o?"#e0f2fe":"white",cursor:"pointer",boxShadow:o?"0 6px 16px rgba(2, 132, 199, 0.25)":"0 2px 6px rgba(0,0,0,0.04)",transition:"all 0.15s ease"},children:[n.jsx("span",{style:{fontSize:"40px",fontWeight:"bold",color:o?"#0284c7":"#1e293b",lineHeight:1},children:["①","②","③","④"][i]}),(0,n.jsxs)("span",{style:{fontSize:"14px",color:o?"#0369a1":"#64748b",marginTop:"8px",fontWeight:"600"},children:["선택 ",i+1]})]},i)})})]}):i?n.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",width:"100%",padding:"5px 0"},children:e.map((e,i)=>{let o=w[t.id]===i,r="object"==typeof e&&null!==e?e.text:e,a="object"==typeof e&&null!==e?e.image:null;return(0,n.jsxs)("div",{onClick:()=>tt(i),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px",borderRadius:"8px",border:o?"2.5px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:o?"#eff6ff":"white",cursor:"pointer",boxShadow:o?"0 4px 10px rgba(2, 132, 199, 0.2)":"0 1px 3px rgba(0,0,0,0.05)",position:"relative"},children:[n.jsx("div",{style:{alignSelf:"flex-start",width:"28px",height:"28px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"15px",backgroundColor:o?"#0284c7":"white",color:o?"white":"#0284c7",marginBottom:"6px"},children:i+1}),a&&n.jsx("img",{src:a,alt:`Choice ${i+1}`,style:{maxHeight:"110px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",borderRadius:"4px",pointerEvents:"none"},draggable:"false"}),r&&!["①","②","③","④","1","2","3","4"].includes(r.trim())&&n.jsx("span",{style:{fontSize:"14px",fontWeight:"600",color:"#1e293b",marginTop:"6px",textAlign:"center"},dangerouslySetInnerHTML:{__html:r}})]},i)})}):e.map((e,i)=>{let o=w[t.id]===i,r="object"==typeof e&&null!==e?e.text:e,a="object"==typeof e&&null!==e?e.image:null,p="object"==typeof e&&null!==e?e.audio:t.optionAudios?.[i]||null,s=M[i];return(0,n.jsxs)("div",{className:`ubt-opt-row ${o?"ubt-opt-selected":""}`,onClick:()=>tt(i),style:{display:"flex",flexDirection:"column",padding:"10px 14px",borderRadius:"10px",border:o?"2px solid #0284c7":"1.5px solid #cbd5e1",cursor:"pointer",backgroundColor:o?"#eff6ff":"#ffffff",boxShadow:o?"0 2px 8px rgba(2, 132, 199, 0.18)":"0 1px 3px rgba(0,0,0,0.03)",transition:"all 0.15s ease"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[n.jsx("div",{className:"ubt-opt-badge",style:{width:"28px",height:"28px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"14px",marginRight:"12px",backgroundColor:o?"#0284c7":"white",color:o?"white":"#0284c7",flexShrink:0},children:i+1}),n.jsx("span",{className:"ubt-opt-text",style:{fontSize:"18px",fontWeight:"600",color:o?"#0369a1":"#1e293b",flex:1},dangerouslySetInnerHTML:{__html:r}})]}),a&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px"},children:n.jsx("img",{src:a,alt:`Option ${i+1}`,style:{maxHeight:"80px",maxWidth:"100%",width:"auto",height:"auto",borderRadius:"4px",border:"1px solid #cbd5e1"}})}),p&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px",width:"100%"},onClick:t=>t.stopPropagation(),children:n.jsx("audio",{ref:t=>D.current[i]=t,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:t=>t.preventDefault(),onPlay:()=>tn(i),onEnded:()=>to(i),src:p,style:{width:"100%",height:"30px",pointerEvents:s||U?"none":"auto",opacity:s?.5:1,filter:s?"grayscale(80%)":"none"}})})]},i)})})()})]}),(0,n.jsxs)("div",{className:"ubt-exam-nav-bar",style:{display:"flex",padding:"10px 20px",paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 8px)",paddingLeft:"calc(env(safe-area-inset-left, 0px) + 20px)",paddingRight:"calc(env(safe-area-inset-right, 0px) + 20px)",backgroundColor:"#f8fafc",borderTop:"1px solid #cbd5e1",borderRadius:"0",justifyContent:"space-between",alignItems:"center",gap:"12px"},children:[n.jsx("button",{type:"button",onClick:()=>{H.current&&clearTimeout(H.current),Object.values(_.current).forEach(t=>clearTimeout(t)),L.current&&L.current.pause(),Object.values(D.current).forEach(t=>t&&t.pause()),y(t=>Math.max(0,t-1))},disabled:0===b,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 26px",borderRadius:"8px",fontWeight:"800",cursor:0===b?"not-allowed":"pointer",fontSize:"15px",letterSpacing:"0.4px",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)",minWidth:"125px"},children:"❮ PREVIOUS"}),n.jsx("button",{type:"button",onClick:()=>{H.current&&clearTimeout(H.current),Object.values(_.current).forEach(t=>clearTimeout(t)),L.current&&L.current.pause(),Object.values(D.current).forEach(t=>t&&t.pause()),m("overview")},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 28px",borderRadius:"8px",fontWeight:"800",cursor:"pointer",fontSize:"15px",letterSpacing:"0.4px",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)",minWidth:"170px"},children:"TOTAL QUESTIONS"}),n.jsx("button",{type:"button",onClick:()=>{H.current&&clearTimeout(H.current),Object.values(_.current).forEach(t=>clearTimeout(t)),L.current&&L.current.pause(),Object.values(D.current).forEach(t=>t&&t.pause()),b<h.length-1?y(t=>t+1):u(!0)},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 26px",borderRadius:"8px",fontWeight:"800",cursor:"pointer",fontSize:"15px",letterSpacing:"0.4px",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)",minWidth:"125px"},children:b===h.length-1?"SUBMIT ❯":"NEXT ❯"})]})]})]})})()})]})})}},2766:(t,e,i)=>{"use strict";i.d(e,{default:()=>r});var n=i(326),o=i(7577);function r({allowedRoles:t=[],children:e}){let[i,r]=(0,o.useState)(!0),[a,p]=(0,o.useState)(null);return!i&&a?(0,n.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[n.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:a}),n.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):e}},3277:(t,e,i)=>{"use strict";i.r(e),i.d(e,{default:()=>n});let n=(0,i(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx#default`)},8440:(t,e,i)=>{"use strict";i.r(e),i.d(e,{default:()=>l,dynamic:()=>p,metadata:()=>s});var n=i(9510),o=i(8408),r=i(8585),a=i(2858);let p="force-dynamic",s={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function l({children:t}){let e=await (0,o.xn)();return e&&!d.includes(e.role)&&(0,r.redirect)("/?error=unauthorized"),n.jsx(a.Z,{allowedRoles:d,children:t})}},2858:(t,e,i)=>{"use strict";i.d(e,{Z:()=>n});let n=(0,i(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},8408:(t,e,i)=>{"use strict";i.d(e,{Gv:()=>l,WX:()=>c,c_:()=>d,fT:()=>x,xn:()=>m});var n=i(2023),o=i(6091),r=i(6176),a=i(1615);let p=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let s=new TextEncoder().encode(p);async function d(t){return await n.hash(t,10)}async function l(t,e){return await n.compare(t,e)}async function x(t){return await new o.N(t).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("30d").sign(s)}async function c(t){try{let{payload:e}=await (0,r._)(t,s);return e}catch(t){return null}}async function m(t){try{let e=null;if(t){let i=t.cookies.get("sigma_session")?.value||t.cookies.get("sigma_token")?.value;if(i)e=i;else{let i=t.headers.get("authorization");i&&i.startsWith("Bearer ")&&(e=i.split(" ")[1])}}else{let t=(0,a.cookies)();e=t.get("sigma_session")?.value||t.get("sigma_token")?.value}if(!e)return null;return await c(e)}catch(t){return null}}}};var e=require("../../../../webpack-runtime.js");e.C(t);var i=t=>e(e.s=t),n=e.X(0,[8948,3881,4669,7512,847],()=>i(7631));module.exports=n})();