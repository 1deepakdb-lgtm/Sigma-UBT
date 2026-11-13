(()=>{var e={};e.id=4663,e.ids=[4663],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4770:e=>{"use strict";e.exports=require("crypto")},2254:e=>{"use strict";e.exports=require("node:buffer")},6005:e=>{"use strict";e.exports=require("node:crypto")},7261:e=>{"use strict";e.exports=require("node:util")},7631:(e,t,i)=>{"use strict";i.r(t),i.d(t,{GlobalError:()=>a.a,__next_app__:()=>c,originalPathname:()=>x,pages:()=>p,routeModule:()=>u,tree:()=>d}),i(3277),i(8440),i(5009),i(1837);var n=i(3191),o=i(8716),r=i(7922),a=i.n(r),s=i(5231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);i.d(t,l);let d=["",{children:["student",{children:["exam",{children:["[examId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(i.bind(i,3277)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(i.bind(i,8440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(i.bind(i,5009)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(i.bind(i,1837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],p=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"],x="/student/exam/[examId]/page",c={require:i,loadChunk:()=>Promise.resolve()},u=new n.AppPageRouteModule({definition:{kind:o.x.APP_PAGE,page:"/student/exam/[examId]/page",pathname:"/student/exam/[examId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4108:(e,t,i)=>{Promise.resolve().then(i.t.bind(i,2994,23)),Promise.resolve().then(i.t.bind(i,6114,23)),Promise.resolve().then(i.t.bind(i,9727,23)),Promise.resolve().then(i.t.bind(i,9671,23)),Promise.resolve().then(i.t.bind(i,1868,23)),Promise.resolve().then(i.t.bind(i,4759,23))},4696:(e,t,i)=>{Promise.resolve().then(i.bind(i,9180))},6473:(e,t,i)=>{Promise.resolve().then(i.bind(i,4387))},5359:(e,t,i)=>{Promise.resolve().then(i.bind(i,2766))},5303:()=>{},4387:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>a});var n=i(326),o=i(7577);i(434);var r=i(5047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let a=()=>{let e=(0,r.useRouter)(),t=(0,r.useParams)(),i=t?.examId,[a,s]=(0,o.useState)(""),[l,d]=(0,o.useState)(""),[p,x]=(0,o.useState)(!1),[c,u]=(0,o.useState)("overview"),[m,h]=(0,o.useState)(!1),[f,g]=(0,o.useState)([]),[b,y]=(0,o.useState)(0),[w,j]=(0,o.useState)({}),[v,S]=(0,o.useState)(3e3),[C,k]=(0,o.useState)(`Chapterwise 0${i}`),[I,W]=(0,o.useState)(!1),[N,R]=(0,o.useState)(null),[z,T]=(0,o.useState)(!1),[E,A]=(0,o.useState)(null);(0,o.useEffect)(()=>{try{e.prefetch("/student/result"),e.prefetch("/student")}catch(e){}},[e]),(0,o.useEffect)(()=>{try{let e=localStorage.getItem("currentUser")||"Student";s(e);let t=JSON.parse(localStorage.getItem("institutes")||"[]");t[0]?.logoUrl&&d(t[0].logoUrl)}catch(e){}},[]),(0,o.useEffect)(()=>()=>{},[]);let L=(0,o.useRef)(null),O=(0,o.useRef)({}),D=(0,o.useRef)(0),P=(0,o.useRef)({}),q=(0,o.useRef)(null),_=(0,o.useRef)({}),[B,H]=(0,o.useState)(!1),[M,F]=(0,o.useState)({}),[U,J]=(0,o.useState)(!1),[$,Q]=(0,o.useState)(null),[K,G]=(0,o.useState)({});(0,o.useEffect)(()=>{(async function(){try{let t=await fetch(`/api/student/exams/${i||"set-1-demo"}/start`,{method:"POST"});if(t.ok){let e=await t.json();if(e.questions&&e.questions.length>=40){g(e.questions),e.answerSheet&&G(e.answerSheet),Q(e.sessionId),e.examName&&k(e.examName);try{localStorage.setItem(`offline_ubt_exam_${i||"set-1-demo"}`,JSON.stringify({questions:e.questions,answerSheet:e.answerSheet||{},sessionId:e.sessionId,examName:e.examName,duration:e.duration,expiresAt:e.expiresAt,cachedAt:Date.now()}))}catch(e){console.warn("Could not write offline exam cache:",e)}return}}else{let i=await t.json().catch(()=>({}));alert(i.error||"Access Denied: You do not have authorization to access this exam."),e.push("/student");return}}catch(e){console.warn("Backend start API network error (attempting offline cache):",e);try{let e=localStorage.getItem(`offline_ubt_exam_${i||"set-1-demo"}`);if(e){let t=JSON.parse(e);if(t.questions&&t.questions.length>=40){g(t.questions),t.answerSheet&&G(t.answerSheet),Q(t.sessionId||`offline_${Date.now()}`),t.examName&&k(t.examName);return}}}catch(e){console.warn("Offline restore error:",e)}}let t=JSON.parse(localStorage.getItem("examSets"))||[],n=JSON.parse(localStorage.getItem("questionBank"))||[],o=t.find(e=>e.id.toString()===i?.toString()||e.name===i),r=o?o.name:`Chapterwise 0${i}`;k(r);let a={},s=a[""]||a[""],l=[].some(e=>e?.toString()===i?.toString()||e?.toString()===o?.id?.toString()||e?.toString()===o?.name?.toString()||e?.toString()===r?.toString()||"string"==typeof i&&e?.toString()===decodeURIComponent(i));if(o?.isFree===!0||o?.isFree==="true"||o?.isFree===1||o?.isFree==="1"||o?.setType==="FREE"||o?.distributionMode==="free"||o?.isFreeForInstituteStudents===!0||o?.price===0||o?.price==="0"||o?.price==="Rs. 0"||"string"==typeof o?.price&&o.price.toLowerCase().includes("free")||o?.name&&o.name.toLowerCase().includes("free")||o?.title&&o.title.toLowerCase().includes("free")||o?.packageName&&o.packageName.toLowerCase().includes("free")||o?.packageName&&o.packageName.toLowerCase().includes("model")||o?.source==="model_question_bank"||o?.folder==="Model Question Bank"||r&&r.toLowerCase().includes("free")||r&&r.toLowerCase().includes("model")||l||s?.isBuyer||s?.hasPurchased,o&&o.creatorInstituteName&&!o.isPublished){let t={},i=("".toString().replace(/[^0-9]/g,"").slice(-10),e=>!1),n=null;for(let e in t)if((t[e]||[]).some(e=>i(e.phone))){n=e;break}if(!n||n.toLowerCase()!==o.creatorInstituteName.toLowerCase()){alert(`Access Restricted: This exam set is in the private bucket of "${o.creatorInstituteName}". Students from other institutes cannot access it.`),e.push("/student");return}}let d=o?o.packageName:"",p=n.filter(e=>e&&(e.setId?.toString()===i?.toString()||e.set===r||e.package===d&&e.set===r)),x=p.filter(e=>"Reading"===e.type),c=p.filter(e=>"Listening"===e.type),u=[];for(let e=1;e<=20;e++)x[e-1]?u.push({...x[e-1],id:x[e-1].id||e,type:"Reading"}):u.push({id:e,type:"Reading",mainHeading:`[ ${e} ] 다음을 읽고 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["가방","지갑","우산","이불"],answer:0});for(let e=1;e<=20;e++){let t=20+e;c[e-1]?u.push({...c[e-1],id:c[e-1].id||t,type:"Listening"}):u.push({id:t,type:"Listening",mainHeading:`[ ${t} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["듣기 1","듣기 2","듣기 3","듣기 4"],answer:0})}g(u);let m={};u.forEach(e=>{void 0!==e.answer&&null!==e.answer&&(m[e.id]=Number(e.answer),void 0!==e.qIndex&&(m[e.qIndex]=Number(e.answer)))}),G(e=>({...m,...e}))})()},[i]),(0,o.useEffect)(()=>{q.current&&clearTimeout(q.current),Object.values(_.current).forEach(e=>clearTimeout(e)),_.current={},L.current&&(L.current.pause(),L.current.currentTime=0),Object.values(O.current).forEach(e=>{e&&(e.pause(),e.currentTime=0)}),D.current=0,P.current={},H(!1),F({}),J(!1)},[b]),(0,o.useEffect)(()=>{if(p){let e=setInterval(()=>{S(t=>t<=1?(clearInterval(e),en(),0):t-1)},1e3);return()=>clearInterval(e)}},[p]);let Y=async()=>{x(!0)},V=e=>{let t=Math.floor(e/60).toString().padStart(2,"0"),i=(e%60).toString().padStart(2,"0");return`${t}:${i}`},X=e=>{let t=f[b];j({...w,[t.id]:e})},Z=()=>{0===D.current&&(D.current=1,H(!0),J(!0))},ee=()=>{1===D.current?(q.current&&clearTimeout(q.current),q.current=setTimeout(()=>{L.current&&1===D.current&&(D.current=2,L.current.currentTime=0,L.current.play().catch(e=>console.log("Audio 2nd play error:",e)))},3e3)):D.current>=2&&J(!1)},et=e=>{0===(P.current[e]||0)&&(P.current[e]=1,F(t=>({...t,[e]:!0})),J(!0))},ei=e=>{let t=P.current[e]||1;1===t?(_.current[e]&&clearTimeout(_.current[e]),_.current[e]=setTimeout(()=>{let t=O.current[e];t&&1===P.current[e]&&(P.current[e]=2,t.currentTime=0,t.play().catch(e=>console.log("Opt audio 2nd play error:",e)))},3e3)):t>=2&&J(!1)},en=async()=>{try{q.current&&clearTimeout(q.current),Object.values(_.current).forEach(e=>clearTimeout(e)),L.current&&L.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause());let t=f.map((e,t)=>{let i=K[e.id]??K[String(e.id)]??K[e.qIndex]??K[String(e.qIndex)]??K[t+1]??e.answer,n=null!=i?Number(i):0;return{...e,answer:n}}),n=0,o=0,r=0,a=0,s={};t.forEach((e,t)=>{let i=void 0!==e.id?e.id:t+1,l=void 0!==e.qIndex?e.qIndex:t+1,d=void 0!==w[e.id]?w[e.id]:void 0!==w[String(e.id)]?w[String(e.id)]:void 0!==w[l]?w[l]:void 0!==w[String(l)]?w[String(l)]:w[t];if(null!=d&&""!==d){let p=Number(d);s[i]=p,s[String(i)]=p,s[l]=p,s[String(l)]=p,s[t]=p,a+=1;let x=void 0!==e.answer&&null!==e.answer?Number(e.answer):void 0,c=!1;void 0!==x&&(p===x||p+1===x)&&(c=!0),c&&(n+=1,e.type&&"reading"===e.type.toLowerCase()||l<=20||t<20?o+=1:r+=1)}});let l=t.length>0?t.length:40,d=5*o,p=5*r,x=d+p,c=Math.round(n/l*100),u=c>=40||x>=96,m="Student",g={examName:C,score:n,total:l,attempted:a,readingCorrect:o,listeningCorrect:r,readingScore:d,listeningScore:p,totalScore:x,percentage:c,passed:u,questions:t,selectedAnswers:s,isOfflineSubmitted:!1,studentName:m,createdAt:new Date().toISOString()},b=!1;if("undefined"!=typeof navigator&&navigator.onLine)try{let e=new AbortController,o=setTimeout(()=>e.abort(),4500),r=await fetch(`/api/student/exams/${i||"set-1-demo"}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:$||`offline_${Date.now()}`,selectedAnswers:s,studentName:m,studentPhone:""}),signal:e.signal});if(clearTimeout(o),r.ok){b=!0;let e=await r.json();if(e.result){let i=e.result;g.score=void 0!==i.correctAnswers?i.correctAnswers:n,g.total=i.totalQuestions||l,g.readingScore=i.readingScore??d,g.listeningScore=i.listeningScore??p,g.totalScore=i.totalScore??x,g.passed=!!i.passed,g.percentage=Math.round(g.score/g.total*100),Array.isArray(i.breakdown)&&(g.questions=t.map((e,t)=>{let n=i.breakdown.find(i=>i.qIndex===e.qIndex||i.qIndex===t+1);return n?{...e,answer:n.correctAnswer}:e}))}}}catch(e){console.warn("Submit API network notice (enqueuing for offline sync):",e)}if(!b){g.isOfflineSubmitted=!0;try{let e=JSON.parse(localStorage.getItem("offlineExamSyncQueue")||"[]");e.push({examId:i||"set-1-demo",sessionId:$||`offline_${Date.now()}`,selectedAnswers:s,score:n,total:l,readingScore:d,listeningScore:p,totalScore:x,studentName:m,studentPhone:"",submittedAt:new Date().toISOString()}),localStorage.setItem("offlineExamSyncQueue",JSON.stringify(e))}catch(e){console.warn("Could not save to offline sync queue:",e)}}localStorage.setItem("lastExamResult",JSON.stringify(g));let y=JSON.parse(localStorage.getItem("examResults"))||[];localStorage.setItem("examResults",JSON.stringify([g,...y])),R(g),W(!0),h(!1);try{e.push("/student/result")}catch(e){console.warn("Offline router navigation notice (active in-page review fallback):",e)}}catch(t){console.error("Submission error:",t);try{e.push("/student/result")}catch(e){}}};Object.keys(w).length,f.length;let eo={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"};if(!p)return(0,n.jsxs)("div",{className:"ubt-pre-exam-screen",style:{width:"100vw",minHeight:"100dvh",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"12px 14px",overflowY:"auto",...eo},onContextMenu:e=>e.preventDefault(),children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
          .ubt-pre-exam-dialog {
            background-color: #ffffff;
            padding: 20px 24px;
            border-radius: 16px;
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
              padding: 18px 16px !important;
              gap: 14px !important;
            }
            .ubt-pre-exam-buttons {
              margin-top: 8px !important;
            }
          }
        `}}),(0,n.jsxs)("div",{className:"ubt-pre-exam-dialog",children:[(0,n.jsxs)("div",{className:"ubt-pre-exam-col-info",children:[n.jsx("div",{className:"ubt-pre-exam-icon",children:(0,n.jsxs)("svg",{width:"28",height:"28",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("path",{d:"M22 10v6M2 10l10-5 10 5-10 5z"}),n.jsx("path",{d:"M6 12v5c3 3 9 3 12 0v-5"})]})}),n.jsx("h2",{className:"ubt-pre-exam-title",children:"EPS-TOPIK UBT Exam"}),n.jsx("p",{className:"ubt-pre-exam-subtitle",children:"Please verify your details before starting"}),(0,n.jsxs)("div",{className:"ubt-pre-exam-buttons",children:[n.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:()=>e.push("/student"),style:{backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1"},children:"CANCEL"}),n.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:Y,style:{backgroundColor:"#0284c7",color:"white",border:"none",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"GET START"})]})]}),n.jsx("div",{className:"ubt-pre-exam-col-details",children:(0,n.jsxs)("div",{className:"ubt-pre-exam-table",children:[(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Exam ID"}),n.jsx("span",{style:{color:"#0f172a",fontWeight:"bold"},children:"287378RM"})]}),(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Student Name"}),n.jsx("span",{suppressHydrationWarning:!0,style:{color:"#0f172a",fontWeight:"bold"},children:a})]}),(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Exam Title"}),n.jsx("span",{style:{color:"#0f172a",fontWeight:"bold"},children:C})]}),(0,n.jsxs)("div",{className:"ubt-pre-exam-row",children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Total Questions"}),n.jsx("span",{style:{color:"#2563eb",fontWeight:"bold"},children:"40 (20 Reading + 20 Listening)"})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"13px"},children:[n.jsx("span",{style:{color:"#64748b",fontWeight:"600"},children:"Time Limit"}),n.jsx("span",{style:{color:"#d97706",fontWeight:"bold"},children:"50 Minutes"})]})]})})]})]});if(I&&N){let t=N.questions||[],i=t.filter(e=>e.type&&"reading"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex<=20).slice(0,20),o=t.filter(e=>e.type&&"listening"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex>20).slice(0,20),r=[...i,...o].length>0?[...i,...o]:t.slice(0,40),s=N.selectedAnswers||{},l=(e,t)=>{if(e){if(void 0!==s[e.id])return s[e.id];if(void 0!==e.qIndex&&void 0!==s[e.qIndex])return s[e.qIndex];if(void 0!==s[t])return s[t]}};if(z&&null!==E){let e=r[E],t=l(e,E),i=null!=t&&""!==t,o=i&&e?.answer!==void 0&&Number(t)===Number(e.answer);return n.jsx("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",padding:"16px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",overflowY:"auto"},children:(0,n.jsxs)("div",{style:{maxWidth:"980px",margin:"0 auto"},children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"10px"},children:[n.jsx("button",{type:"button",onClick:()=>A(null),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 16px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Grid"}),(0,n.jsxs)("h3",{style:{margin:0,color:"#0f172a",fontSize:"18px",fontWeight:"800"},children:["Question ",E+1," Review (",e?.type||(E<20?"Reading":"Listening"),")"]})]}),(0,n.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[n.jsx("span",{style:{backgroundColor:o?"#dcfce7":i?"#fee2e2":"#f1f5f9",color:o?"#15803d":i?"#b91c1c":"#64748b",padding:"6px 14px",borderRadius:"20px",fontWeight:"800",fontSize:"12px"},children:o?"✓ Correct":i?"✗ Incorrect":"○ Not Attempted"}),n.jsx("button",{type:"button",onClick:()=>{T(!1),A(null)},style:{backgroundColor:"#f1f5f9",color:"#334155",border:"1px solid #cbd5e1",padding:"6px 14px",borderRadius:"6px",fontWeight:"700",cursor:"pointer",fontSize:"12px"},children:"Summary"})]})]}),(0,n.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"10px",padding:"24px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},children:[n.jsx("p",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold",margin:"0 0 10px 0"},children:e?.mainHeading||(E<20?`[ ${E+1} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${E+1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}),e?.questionHeading&&n.jsx("p",{style:{color:"#334155",fontSize:"14px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),(0,n.jsxs)("p",{style:{color:"#0f172a",fontSize:"17px",fontWeight:"bold",margin:"0 0 15px 0"},children:[E+1,". ",e?.description||""]}),e?.image&&n.jsx("div",{style:{margin:"15px 0",textAlign:"center"},children:n.jsx("img",{src:e.image,alt:"Question",style:{maxHeight:"180px",maxWidth:"260px",objectFit:"contain",borderRadius:"6px",border:"1px solid #cbd5e1"}})}),e?.audio&&n.jsx("div",{style:{margin:"15px 0"},children:n.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:e=>e.preventDefault(),src:e.audio,style:{width:"100%",height:"35px"}})}),n.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"10px",marginTop:"20px"},children:Array.isArray(e?.options)&&e.options.map((i,r)=>{let a="object"==typeof i&&null!==i?i.text:i,s="object"==typeof i&&null!==i?i.image:null,l="object"==typeof i&&null!==i?i.audio:null,d=Number(r)===Number(e.answer),p=Number(r)===Number(t),x="#f8fafc",c="1px solid #cbd5e1",u="#1e293b",m="white",h="2px solid #0284c7",f="#0284c7";return d?(x="#f0fdf4",c="1.5px solid #16a34a",u="#15803d",m="#16a34a",h="2px solid #16a34a",f="white"):p&&!o&&(x="#fef2f2",c="1.5px solid #ef4444",u="#b91c1c",m="#ef4444",h="2px solid #ef4444",f="white"),(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",padding:"10px 14px",backgroundColor:x,border:c,borderRadius:"8px"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[n.jsx("div",{style:{width:"28px",height:"28px",borderRadius:"50%",backgroundColor:m,color:f,border:h,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"13px",marginRight:"12px",flexShrink:0},children:r+1}),n.jsx("span",{style:{fontSize:"15px",flex:1,color:u},children:a}),d&&n.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:"#16a34a",marginLeft:"8px"},children:"✓ Correct Answer"}),p&&!d&&n.jsx("span",{style:{fontSize:"12px",fontWeight:"800",color:"#ef4444",marginLeft:"8px"},children:"✗ Your Answer"})]}),s&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:n.jsx("img",{src:s,alt:`Opt ${r+1}`,style:{maxHeight:"60px",borderRadius:"4px"}})}),l&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:n.jsx("audio",{controls:!0,controlsList:"nodownload",src:l,style:{width:"100%",height:"26px"}})})]},r)})}),(0,n.jsxs)("div",{style:{marginTop:"24px",display:"flex",justifyContent:"space-between"},children:[n.jsx("button",{type:"button",onClick:()=>A(e=>Math.max(0,e-1)),disabled:0===E,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"6px",fontWeight:"bold",cursor:0===E?"not-allowed":"pointer",opacity:0===E?.5:1},children:"❮ Previous"}),n.jsx("button",{type:"button",onClick:()=>A(e=>Math.min(r.length-1,e+1)),disabled:E===r.length-1,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"6px",fontWeight:"bold",cursor:E===r.length-1?"not-allowed":"pointer",opacity:E===r.length-1?.5:1},children:"Next ❯"})]})]})]})})}return z&&null===E?n.jsx("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",padding:"16px",boxSizing:"border-box",fontFamily:"Arial, sans-serif",overflowY:"auto"},children:(0,n.jsxs)("div",{style:{maxWidth:"980px",margin:"0 auto"},children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"},children:[n.jsx("button",{type:"button",onClick:()=>T(!1),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 16px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Summary"}),(0,n.jsxs)("div",{style:{display:"flex",gap:"12px",alignItems:"center"},children:[(0,n.jsxs)("span",{style:{fontSize:"13px",fontWeight:"700",color:"#16a34a"},children:["● Correct (",N.score,")"]}),(0,n.jsxs)("span",{style:{fontSize:"13px",fontWeight:"700",color:"#ef4444"},children:["● Incorrect (",N.attempted-N.score,")"]}),(0,n.jsxs)("span",{style:{fontSize:"13px",fontWeight:"700",color:"#64748b"},children:["● Unanswered (",N.total-N.attempted,")"]})]})]}),(0,n.jsxs)("div",{style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"10px",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},children:[(0,n.jsxs)("div",{style:{backgroundColor:"#0284c7",color:"white",padding:"12px 20px",display:"flex",justifyContent:"space-between",fontWeight:"bold",fontSize:"14px",flexWrap:"wrap",gap:"8px"},children:[(0,n.jsxs)("span",{children:["Exam: ",N.examName]}),(0,n.jsxs)("span",{children:["Score: ",N.score," / ",N.total," (",N.percentage,"%)"]}),n.jsx("span",{children:"Click any question number to review"})]}),n.jsx("div",{style:{padding:"20px"},children:(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",gap:"20px",flexWrap:"wrap"},children:[(0,n.jsxs)("div",{style:{flex:1,minWidth:"280px"},children:[n.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 12px 0",fontSize:"15px"},children:"Reading Questions (1 - 20)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"8px"},children:r.slice(0,20).map((e,t)=>{let i=l(e,t),o=null!=i&&""!==i,r=o&&void 0!==e.answer&&Number(i)===Number(e.answer),a="white",s="#cbd5e1",d="#1e293b";return o&&(r?(a="#16a34a",s="#15803d"):(a="#ef4444",s="#dc2626"),d="white"),n.jsx("button",{type:"button",onClick:()=>A(t),style:{padding:"10px 0",backgroundColor:a,border:`1.5px solid ${s}`,borderRadius:"6px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:d},children:t+1},t)})})]}),(0,n.jsxs)("div",{style:{flex:1,minWidth:"280px"},children:[n.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 12px 0",fontSize:"15px"},children:"Listening Questions (21 - 40)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"8px"},children:r.slice(20,40).map((e,t)=>{let i=t+20,o=l(e,i),r=null!=o&&""!==o,a=r&&void 0!==e.answer&&Number(o)===Number(e.answer),s="white",d="#cbd5e1",p="#1e293b";return r&&(a?(s="#16a34a",d="#15803d"):(s="#ef4444",d="#dc2626"),p="white"),n.jsx("button",{type:"button",onClick:()=>A(i),style:{padding:"10px 0",backgroundColor:s,border:`1.5px solid ${d}`,borderRadius:"6px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:p},children:i+1},i)})})]})]})})]})]})}):(0,n.jsxs)("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"},children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
            border-radius: 16px;
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
            fontWeight: 800;
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
            border-radius: 12px;
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
          @media (orientation: landscape) and (max-height: 650px) {
            .exam-finish-top-bar {
              display: none !important;
            }
            .exam-finish-wrap {
              padding: 6px 12px !important;
              height: 100vh !important;
              min-height: 100vh !important;
              overflow: hidden !important;
            }
            .exam-finish-card {
              max-width: 650px !important;
              padding: 10px 16px !important;
              max-height: 96vh !important;
              border-radius: 12px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
            }
            .exam-finish-header {
              margin-bottom: 6px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 10px !important;
              text-align: left !important;
            }
            .exam-finish-trophy {
              width: 32px !important;
              height: 32px !important;
              font-size: 18px !important;
              margin: 0 !important;
              flex-shrink: 0 !important;
            }
            .exam-finish-title {
              font-size: 15.5px !important;
              margin: 0 !important;
            }
            .exam-finish-badge {
              font-size: 11.5px !important;
              padding: 2px 8px !important;
            }
            .exam-finish-grid {
              flex-direction: row !important;
              align-items: stretch !important;
              gap: 12px !important;
            }
            .exam-finish-stats {
              flex: 1.25 !important;
              padding: 8px 12px !important;
              gap: 4px !important;
              margin-bottom: 0 !important;
            }
            .exam-finish-stats > div {
              padding-bottom: 3px !important;
              max-width: 100% !important;
            }
            .exam-finish-stats span {
              font-size: 12.5px !important;
            }
            .exam-finish-actions {
              flex: 1 !important;
              flex-direction: column !important;
              justify-content: center !important;
              gap: 8px !important;
            }
            .exam-finish-actions button {
              width: 100% !important;
              max-width: none !important;
              min-width: 0 !important;
              padding: 9px 12px !important;
              font-size: 13px !important;
            }
          }
        `}}),n.jsx("div",{className:"exam-finish-top-bar",children:n.jsx("span",{children:"Exam Summary"})}),n.jsx("div",{className:"exam-finish-wrap",children:(0,n.jsxs)("div",{className:"exam-finish-card",children:[(0,n.jsxs)("div",{className:"exam-finish-header",children:[n.jsx("div",{className:"exam-finish-trophy",children:"\uD83C\uDFC6"}),(0,n.jsxs)("div",{children:[n.jsx("h2",{className:"exam-finish-title",children:"Congratulations, Exam Ended!"}),(0,n.jsxs)("div",{className:"exam-finish-badge",children:[n.jsx("span",{style:{color:"#0284c7"},children:"\uD83D\uDC64 Name:"})," ",a," \xa0 | \xa0 ",n.jsx("span",{style:{color:"#0284c7"},children:"Exam:"})," ",N.examName]})]})]}),(0,n.jsxs)("div",{className:"exam-finish-grid",children:[(0,n.jsxs)("div",{className:"exam-finish-stats",children:[(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Total Questions"}),n.jsx("span",{style:{color:"#0f172a",fontSize:"14px",fontWeight:"bold"},children:N.total||40})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Total Attempted"}),n.jsx("span",{style:{color:"#0f172a",fontSize:"14px",fontWeight:"bold"},children:N.attempted})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Total Correct"}),(0,n.jsxs)("span",{style:{color:"#16a34a",fontSize:"16px",fontWeight:"900"},children:[N.score," / ",N.total||40]})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Reading Score"}),(0,n.jsxs)("span",{style:{color:"#0284c7",fontSize:"13.5px",fontWeight:"700"},children:[N.readingScore??5*(N.readingCorrect||0)," / 100"]})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"5px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Listening Score"}),(0,n.jsxs)("span",{style:{color:"#0284c7",fontSize:"13.5px",fontWeight:"700"},children:[N.listeningScore??5*(N.listeningCorrect||0)," / 100"]})]}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"260px",paddingTop:"3px"},children:[n.jsx("span",{style:{color:"#64748b",fontSize:"13px",fontWeight:"600"},children:"Percentage & Status"}),(0,n.jsxs)("span",{style:{color:N.passed?"#16a34a":"#ef4444",fontSize:"14px",fontWeight:"900"},children:[N.percentage,"% \xa0 (",N.passed?"PASSED":"FAILED",")"]})]})]}),(0,n.jsxs)("div",{className:"exam-finish-actions",children:[n.jsx("button",{type:"button",onClick:()=>T(!0),style:{flex:1,minWidth:"160px",backgroundColor:"#0284c7",color:"white",border:"none",padding:"12px 18px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"VIEW REVIEW (1-40)"}),n.jsx("button",{type:"button",onClick:()=>e.push("/student"),style:{flex:1,minWidth:"160px",backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",padding:"12px 18px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer"},children:"CLOSE"})]})]})]})})]})}if(0===f.length)return n.jsx("div",{style:{padding:"50px",textAlign:"center"},children:"Loading exam questions..."});let er={width:"100vw",minHeight:"100dvh",height:"100vh",display:"flex",flexDirection:"column",backgroundColor:"rgba(241, 245, 249, 0.92)",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"12px",overflow:"hidden",position:"relative",backgroundImage:"none",...eo};return(0,n.jsxs)("div",{className:"ubt-exam-wrapper",style:er,onContextMenu:e=>e.preventDefault(),children:[n.jsx("style",{dangerouslySetInnerHTML:{__html:`
        .ubt-exam-wrapper {
          width: 100vw;
          min-height: 100dvh;
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          padding: 12px;
          overflow: hidden;
          position: relative;
        }
        .ubt-exam-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 1050px;
          width: 100%;
          height: 100%;
          margin: auto;
          justify-content: center;
          min-height: 0;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
        }
        .ubt-exam-card {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          border-radius: 0 0 24px 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 550px;
          min-height: 550px;
        }
        .ubt-exam-columns {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .ubt-exam-left {
          flex: 1.2;
          padding: 20px 25px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          height: 100%;
        }
        .ubt-exam-right {
          flex: 1;
          padding: 20px 25px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 10px;
          overflow-y: auto;
          height: 100%;
        }
        .ubt-exam-header-bar {
          display: flex;
          background-color: #0284c7;
          color: white;
          padding: 14px 22px;
          border-radius: 24px 24px 0 0;
          justify-content: space-between;
          font-weight: bold;
          font-size: 15.5px;
          gap: 8px;
        }
        .ubt-exam-nav-bar {
          display: flex;
          padding: 14px 24px;
          background-color: #f8fafc;
          border-top: 1px solid #cbd5e1;
          border-radius: 0 0 24px 24px;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .ubt-exam-nav-bar button {
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 15px;
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
          padding: 25px 30px;
          border-radius: 0 0 24px 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          overflow-y: auto;
          max-height: 80vh;
        }
        .ubt-overview-flex {
          display: flex;
          justify-content: space-between;
          gap: 25px;
        }

        /* LANDSCAPE OPTIMIZED EXAM STYLING FOR ALL MOBILE & TABLET DEVICES */
        @media (orientation: landscape) and (max-height: 600px) {
          .ubt-exam-wrapper {
            padding: 4px 8px !important;
            height: 100vh !important;
            height: 100dvh !important;
            overflow: hidden !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            max-width: 100% !important;
            justify-content: center !important;
            border-radius: 22px !important;
          }
          .ubt-exam-card {
            height: calc(100dvh - 8px) !important;
            min-height: 0 !important;
            max-height: calc(100dvh - 8px) !important;
            border-radius: 0 0 22px 22px !important;
          }
          .ubt-exam-columns {
            flex-direction: row !important;
            flex: 1 !important;
            overflow: hidden !important;
            min-height: 0 !important;
          }
          .ubt-exam-left {
            flex: 1.25 !important;
            padding: 8px 14px !important;
            border-right: 1.5px solid #e2e8f0 !important;
            border-bottom: none !important;
            max-height: none !important;
            overflow-y: auto !important;
            height: 100% !important;
          }
          .ubt-exam-left p {
            font-size: 15.5px !important;
            margin-bottom: 6px !important;
            line-height: 1.35 !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            padding: 8px 14px !important;
            overflow-y: auto !important;
            height: 100% !important;
            max-height: none !important;
            gap: 6px !important;
          }
          .ubt-exam-header-bar {
            padding: 7px 16px !important;
            font-size: 13px !important;
            border-radius: 22px 22px 0 0 !important;
          }
          .ubt-exam-nav-bar {
            padding: 7px 16px !important;
            border-radius: 0 0 22px 22px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 9px 20px !important;
            font-size: 13.5px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
          }
          .ubt-overview-box {
            padding: 10px 14px !important;
            border-radius: 0 0 22px 22px !important;
            max-height: calc(100dvh - 45px) !important;
          }
          .ubt-overview-flex {
            flex-direction: row !important;
            gap: 12px !important;
          }
          .ubt-overview-flex button {
            padding: 6px 0 !important;
            font-size: 11.5px !important;
          }
        }

        /* FALLBACK FOR PORTRAIT MOBILE BEFORE ROTATION */
        @media (orientation: portrait) and (max-width: 768px) {
          .ubt-exam-wrapper {
            padding: 6px !important;
            height: 100dvh !important;
            overflow-y: auto !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            justify-content: flex-start !important;
            border-radius: 20px !important;
          }
          .ubt-exam-header-bar {
            padding: 10px 14px !important;
            font-size: 13px !important;
            border-radius: 20px 20px 0 0 !important;
            flex-wrap: wrap !important;
          }
          .ubt-exam-card {
            height: auto !important;
            min-height: 0 !important;
            flex: 1 !important;
            max-height: calc(100dvh - 75px) !important;
            border-radius: 0 0 20px 20px !important;
          }
          .ubt-exam-columns {
            flex-direction: column !important;
            overflow-y: auto !important;
            flex: 1 !important;
          }
          .ubt-exam-left {
            flex: none !important;
            max-height: 42vh !important;
            border-right: none !important;
            border-bottom: 1.5px solid #cbd5e1 !important;
            padding: 12px 14px !important;
            height: auto !important;
          }
          .ubt-exam-left p {
            font-size: 17px !important;
          }
          .ubt-exam-right {
            flex: 1 !important;
            max-height: 46vh !important;
            padding: 12px 14px !important;
            height: auto !important;
          }
          .ubt-exam-nav-bar {
            padding: 10px 14px !important;
            border-radius: 0 0 20px 20px !important;
            gap: 8px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 10px 18px !important;
            font-size: 13px !important;
            font-weight: 800 !important;
            border-radius: 8px !important;
          }
          .ubt-overview-box {
            padding: 16px 14px !important;
            border-radius: 0 0 20px 20px !important;
            max-height: calc(100dvh - 75px) !important;
          }
          .ubt-overview-flex {
            flex-direction: column !important;
            gap: 16px !important;
          }
          .ubt-overview-flex > div:first-child {
            border-right: none !important;
            border-bottom: 1.5px solid #e2e8f0 !important;
            padding-right: 0 !important;
            padding-bottom: 16px !important;
          }
          .ubt-overview-flex > div:last-child {
            padding-left: 0 !important;
          }
        }
      `}}),m&&n.jsx("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",backgroundColor:"rgba(0, 0, 0, 0.6)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:99999999,padding:"16px",boxSizing:"border-box"},children:(0,n.jsxs)("div",{style:{backgroundColor:"white",padding:"24px 20px",borderRadius:"12px",maxWidth:"420px",width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",boxSizing:"border-box"},children:[n.jsx("h3",{style:{margin:"0 0 12px 0",color:"#1e293b",fontSize:"18px",fontWeight:"700"},children:"Confirm Submission"}),n.jsx("p",{style:{color:"#475569",fontSize:"14px",marginBottom:"20px",lineHeight:"1.4"},children:"Are you sure you want to submit and end the exam?"}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"flex-end",gap:"10px"},children:[n.jsx("button",{type:"button",onClick:()=>h(!1),style:{backgroundColor:"transparent",color:"#0284c7",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer",padding:"8px 14px",borderRadius:"4px"},children:"CANCEL"}),n.jsx("button",{type:"button",onClick:en,style:{backgroundColor:"#0284c7",color:"white",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer",padding:"8px 18px",borderRadius:"4px"},children:"AGREE"})]})]})}),"overview"===c?(0,n.jsxs)("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"850px",width:"100%",height:"100%",margin:"auto",justifyContent:"center",borderRadius:"24px",overflow:"hidden",boxShadow:"0 10px 30px rgba(0, 0, 0, 0.12)"},children:[(0,n.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"14px 22px",borderRadius:"24px 24px 0 0",justifyContent:"space-between",fontWeight:"bold",fontSize:"15.5px"},children:[n.jsx("span",{children:"Remaining Questions: 40"}),n.jsx("span",{children:C}),(0,n.jsxs)("span",{children:["Time Remaining: ",V(v)]})]}),(0,n.jsxs)("div",{className:"ubt-overview-box",style:{backgroundColor:"rgba(255, 255, 255, 0.95)",border:"1px solid #cbd5e1",borderTop:"none",padding:"25px 30px",borderRadius:"0 0 24px 24px",boxShadow:"0 4px 15px rgba(0,0,0,0.06)"},children:[(0,n.jsxs)("div",{className:"ubt-overview-flex",style:{display:"flex",justifyContent:"space-between",gap:"25px"},children:[(0,n.jsxs)("div",{style:{flex:1,borderRight:"2px solid #e2e8f0",paddingRight:"15px"},children:[n.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 15px 0",fontSize:"15px"},children:"Reading Questions (1 - 20)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:f.slice(0,20).map((e,t)=>n.jsx("button",{type:"button",onClick:()=>{y(t),u("single")},style:{padding:"12px 0",backgroundColor:void 0!==w[e.id]?"#dcfce7":"white",border:"1px solid #0284c7",borderRadius:"5px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:"#1e293b",transition:"0.15s"},children:t+1},e.id))})]}),(0,n.jsxs)("div",{style:{flex:1,paddingLeft:"15px"},children:[n.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 15px 0",fontSize:"15px"},children:"Listening Questions (21 - 40)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:f.slice(20,40).map((e,t)=>{let i=t+20;return n.jsx("button",{type:"button",onClick:()=>{y(i),u("single")},style:{padding:"12px 0",backgroundColor:void 0!==w[e.id]?"#dcfce7":"white",border:"1px solid #0284c7",borderRadius:"5px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:"#1e293b",transition:"0.15s"},children:i+1},e.id)})})]})]}),(0,n.jsxs)("div",{style:{marginTop:"25px",display:"flex",justifyContent:"space-between",gap:"12px",alignItems:"center"},children:[n.jsx("button",{type:"button",onClick:()=>u("single"),style:{backgroundColor:"#64748b",color:"white",border:"none",padding:"12px 24px",fontSize:"15px",fontWeight:"800",borderRadius:"8px",cursor:"pointer",boxShadow:"0 2px 6px rgba(100, 116, 139, 0.35)"},children:"❮ BACK TO QUESTION"}),n.jsx("button",{type:"button",onClick:()=>h(!0),style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 28px",fontSize:"15px",fontWeight:"800",borderRadius:"8px",cursor:"pointer",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)"},children:"SUBMIT AND FINISH EXAM ❯"})]})]})]}):n.jsx("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"1050px",width:"100%",height:"100%",margin:"auto",justifyContent:"center",borderRadius:"24px",overflow:"hidden",boxShadow:"0 10px 30px rgba(0, 0, 0, 0.12)"},children:(()=>{let e=f[b];return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",minHeight:0},children:[(0,n.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"14px 22px",borderRadius:"24px 24px 0 0",justifyContent:"space-between",fontWeight:"bold",fontSize:"15.5px"},children:[n.jsx("span",{children:"Remaining Questions: 40"}),n.jsx("span",{children:C}),(0,n.jsxs)("span",{children:["Time Remaining: ",V(v)]})]}),(0,n.jsxs)("div",{className:"ubt-exam-card",style:{backgroundColor:"rgba(255, 255, 255, 0.95)",border:"1px solid #cbd5e1",borderTop:"none",borderRadius:"0 0 24px 24px",boxShadow:"0 4px 15px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",justifyContent:"space-between",height:"550px",minHeight:"550px"},children:[(0,n.jsxs)("div",{className:"ubt-exam-columns",style:{display:"flex",flex:1,overflow:"hidden"},children:[(0,n.jsxs)("div",{className:"ubt-exam-left",style:{flex:1.2,padding:"20px 25px",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",overflowY:"auto",height:"100%"},children:[n.jsx("p",{style:{color:"#1e293b",fontSize:"20px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.mainHeading||(b<20?"[ 1 - 20 ] 다음을 읽고 알맞은 것을 고르십시오.":"[ 21 - 40 ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.")}),e.questionHeading&&n.jsx("p",{style:{color:"#334155",fontSize:"20px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),e.description&&n.jsx("div",{style:{border:"1px solid #94a3b8",borderRadius:"6px",padding:"12px 15px",backgroundColor:"white",color:"#1e293b",fontSize:"20px",fontWeight:"bold",lineHeight:"1.5",whiteSpace:"pre-wrap",marginBottom:"12px"},children:e.description}),e.image&&n.jsx("div",{style:{margin:"auto",border:"1px solid #cbd5e1",padding:"10px",borderRadius:"6px",backgroundColor:"white",textAlign:"center"},children:n.jsx("img",{src:e.image,alt:"Question Visual",style:{display:"block",maxHeight:"250px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",margin:"0 auto",pointerEvents:"none",imageRendering:"high-quality",WebkitImageRendering:"-webkit-optimize-contrast"},draggable:"false"})}),e.audio&&n.jsx("div",{style:{marginTop:"12px",padding:"10px",backgroundColor:"#f8fafc",borderRadius:"6px",border:"1px solid #cbd5e1",textAlign:"center"},children:n.jsx("audio",{ref:L,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:e=>e.preventDefault(),onPlay:Z,onEnded:ee,src:e.audio,style:{width:"100%",height:"32px",pointerEvents:B||U?"none":"auto",opacity:B?.5:1,filter:B?"grayscale(80%)":"none"}})})]}),n.jsx("div",{className:"ubt-exam-right",style:{flex:1,padding:"20px 25px",display:"flex",flexDirection:"column",justifyContent:"flex-start",gap:"10px",overflowY:"auto",height:"100%"},children:(()=>{let t=e.options||[],i=t.some(e=>!!("object"==typeof e&&null!==e&&e.image));return!i&&t.every(e=>{let t="object"==typeof e&&null!==e?(e.text||"").trim():(e||"").toString().trim();return!t||["①","②","③","④","1","2","3","4"].includes(t)})?(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"16px",justifyContent:"center",height:"100%",padding:"10px"},children:[n.jsx("p",{style:{color:"#475569",fontSize:"16px",margin:"0 0 10px 0",fontWeight:"600",textAlign:"center"},children:"\uD83C\uDFA7 다음을 듣고 알맞은 번호를 고르십시오. (Blind Listening)"}),n.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"},children:t.map((t,i)=>{let o=w[e.id]===i;return(0,n.jsxs)("button",{type:"button",onClick:()=>X(i),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 15px",borderRadius:"12px",border:o?"3px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:o?"#e0f2fe":"white",cursor:"pointer",boxShadow:o?"0 6px 16px rgba(2, 132, 199, 0.25)":"0 2px 6px rgba(0,0,0,0.04)",transition:"all 0.15s ease"},children:[n.jsx("span",{style:{fontSize:"40px",fontWeight:"bold",color:o?"#0284c7":"#1e293b",lineHeight:1},children:["①","②","③","④"][i]}),(0,n.jsxs)("span",{style:{fontSize:"14px",color:o?"#0369a1":"#64748b",marginTop:"8px",fontWeight:"600"},children:["선택 ",i+1]})]},i)})})]}):i?n.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",width:"100%",padding:"5px 0"},children:t.map((t,i)=>{let o=w[e.id]===i,r="object"==typeof t&&null!==t?t.text:t,a="object"==typeof t&&null!==t?t.image:null;return(0,n.jsxs)("div",{onClick:()=>X(i),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px",borderRadius:"8px",border:o?"2.5px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:o?"#eff6ff":"white",cursor:"pointer",boxShadow:o?"0 4px 10px rgba(2, 132, 199, 0.2)":"0 1px 3px rgba(0,0,0,0.05)",position:"relative"},children:[n.jsx("div",{style:{alignSelf:"flex-start",width:"28px",height:"28px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"15px",backgroundColor:o?"#0284c7":"white",color:o?"white":"#0284c7",marginBottom:"6px"},children:i+1}),a&&n.jsx("img",{src:a,alt:`Choice ${i+1}`,style:{maxHeight:"110px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",borderRadius:"4px",pointerEvents:"none"},draggable:"false"}),r&&!["①","②","③","④","1","2","3","4"].includes(r.trim())&&n.jsx("span",{style:{fontSize:"14px",fontWeight:"600",color:"#1e293b",marginTop:"6px",textAlign:"center"},children:r})]},i)})}):t.map((t,i)=>{let o=w[e.id]===i,r="object"==typeof t&&null!==t?t.text:t,a="object"==typeof t&&null!==t?t.image:null,s="object"==typeof t&&null!==t?t.audio:e.optionAudios?.[i]||null,l=M[i];return(0,n.jsxs)("div",{onClick:()=>X(i),style:{display:"flex",flexDirection:"column",padding:"10px 12px",borderBottom:"1px solid #e2e8f0",cursor:"pointer",backgroundColor:o?"#eff6ff":"transparent"},children:[(0,n.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[n.jsx("div",{style:{width:"32px",height:"32px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"16px",marginRight:"15px",backgroundColor:o?"#0284c7":"white",color:o?"white":"#0284c7",flexShrink:0},children:i+1}),n.jsx("span",{style:{fontSize:"20px",fontWeight:"normal",color:"#1e293b",flex:1},dangerouslySetInnerHTML:{__html:r}})]}),a&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px"},children:n.jsx("img",{src:a,alt:`Option ${i+1}`,style:{maxHeight:"80px",maxWidth:"100%",width:"auto",height:"auto",borderRadius:"4px",border:"1px solid #cbd5e1"}})}),s&&n.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px",width:"100%"},onClick:e=>e.stopPropagation(),children:n.jsx("audio",{ref:e=>O.current[i]=e,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:e=>e.preventDefault(),onPlay:()=>et(i),onEnded:()=>ei(i),src:s,style:{width:"100%",height:"30px",pointerEvents:l||U?"none":"auto",opacity:l?.5:1,filter:l?"grayscale(80%)":"none"}})})]},i)})})()})]}),(0,n.jsxs)("div",{className:"ubt-exam-nav-bar",style:{display:"flex",padding:"14px 24px",backgroundColor:"#f8fafc",borderTop:"1px solid #cbd5e1",borderRadius:"0 0 24px 24px",justifyContent:"space-between",alignItems:"center",gap:"12px"},children:[n.jsx("button",{type:"button",onClick:()=>{q.current&&clearTimeout(q.current),Object.values(_.current).forEach(e=>clearTimeout(e)),L.current&&L.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause()),y(e=>Math.max(0,e-1))},disabled:0===b,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 26px",borderRadius:"8px",fontWeight:"800",cursor:0===b?"not-allowed":"pointer",fontSize:"15px",letterSpacing:"0.4px",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)",minWidth:"125px"},children:"❮ PREVIOUS"}),n.jsx("button",{type:"button",onClick:()=>{q.current&&clearTimeout(q.current),Object.values(_.current).forEach(e=>clearTimeout(e)),L.current&&L.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause()),u("overview")},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 28px",borderRadius:"8px",fontWeight:"800",cursor:"pointer",fontSize:"15px",letterSpacing:"0.4px",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)",minWidth:"170px"},children:"TOTAL QUESTIONS"}),n.jsx("button",{type:"button",onClick:()=>{q.current&&clearTimeout(q.current),Object.values(_.current).forEach(e=>clearTimeout(e)),L.current&&L.current.pause(),Object.values(O.current).forEach(e=>e&&e.pause()),b<f.length-1?y(e=>e+1):h(!0)},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 26px",borderRadius:"8px",fontWeight:"800",cursor:"pointer",fontSize:"15px",letterSpacing:"0.4px",boxShadow:"0 2px 6px rgba(14, 165, 233, 0.35)",minWidth:"125px"},children:b===f.length-1?"SUBMIT ❯":"NEXT ❯"})]})]})]})})()})]})}},2766:(e,t,i)=>{"use strict";i.d(t,{default:()=>r});var n=i(326),o=i(7577);function r({allowedRoles:e=[],children:t}){let[i,r]=(0,o.useState)(!0),[a,s]=(0,o.useState)(null);return!i&&a?(0,n.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[n.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:a}),n.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):t}},9180:(e,t,i)=>{"use strict";function n(){return null}i.d(t,{default:()=>n}),i(7577)},5009:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>s,metadata:()=>a,viewport:()=>r});var n=i(9510);i(3346),i(3093);let o=(0,i(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/PwaDesktopInstaller.jsx#default`),r={themeColor:"#003b73",width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover"},a={title:"ExamJK — Exam Japanese and Korean",description:"ExamJK: Japanese and Korean CBT & UBT Examination and Learning System",manifest:"/manifest.json",icons:{icon:"/icon-192.png",shortcut:"/icon-192.png",apple:"/apple-touch-icon.png"},appleWebApp:{capable:!0,statusBarStyle:"black-translucent",title:"ExamJK"}};function s({children:e}){return(0,n.jsxs)("html",{lang:"en",children:[(0,n.jsxs)("head",{children:[n.jsx("meta",{charSet:"utf-8"}),n.jsx("meta",{name:"application-name",content:"ExamJK"}),n.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),n.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"black-translucent"}),n.jsx("meta",{name:"apple-mobile-web-app-title",content:"ExamJK"}),n.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),n.jsx("meta",{name:"theme-color",content:"#003b73"}),n.jsx("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),n.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),n.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),n.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap",rel:"stylesheet"})]}),(0,n.jsxs)("body",{children:[e,n.jsx(o,{})]})]})}},1837:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>o});var n=i(9510);function o(){return(0,n.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",padding:"20px"},children:[n.jsx("h2",{style:{fontSize:"24px",fontWeight:"bold",color:"#1e3a8a",marginBottom:"10px"},children:"404 - Page Not Found"}),n.jsx("p",{style:{color:"#64748b",marginBottom:"20px"},children:"The page you are looking for does not exist."}),n.jsx("a",{href:"/",style:{backgroundColor:"#2563eb",color:"white",padding:"10px 20px",borderRadius:"6px",textDecoration:"none",fontWeight:"bold"},children:"Return Home"})]})}},3277:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>n});let n=(0,i(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx#default`)},8440:(e,t,i)=>{"use strict";i.r(t),i.d(t,{default:()=>p,dynamic:()=>s,metadata:()=>l});var n=i(9510),o=i(8408),r=i(8585),a=i(2858);let s="force-dynamic",l={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function p({children:e}){let t=await (0,o.xn)();return t&&d.includes(t.role)||(0,r.redirect)("/?error=unauthorized"),n.jsx(a.Z,{allowedRoles:d,children:e})}},2858:(e,t,i)=>{"use strict";i.d(t,{Z:()=>n});let n=(0,i(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},3346:()=>{},3093:()=>{},8408:(e,t,i)=>{"use strict";i.d(t,{Gv:()=>p,WX:()=>c,c_:()=>d,fT:()=>x,xn:()=>u});var n=i(2023),o=i(6091),r=i(6176),a=i(1615);let s=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let l=new TextEncoder().encode(s);async function d(e){return await n.hash(e,10)}async function p(e,t){return await n.compare(e,t)}async function x(e){return await new o.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(l)}async function c(e){try{let{payload:t}=await (0,r._)(e,l);return t}catch(e){return null}}async function u(e){try{let t=null;if(e){let i=e.cookies.get("sigma_session")?.value;if(i)t=i;else{let i=e.headers.get("authorization");i&&i.startsWith("Bearer ")&&(t=i.split(" ")[1])}}else{let e=(0,a.cookies)();t=e.get("sigma_session")?.value}if(!t)return null;return await c(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var i=e=>t(t.s=e),n=t.X(0,[8948,3881,4669,7512],()=>i(7631));module.exports=n})();