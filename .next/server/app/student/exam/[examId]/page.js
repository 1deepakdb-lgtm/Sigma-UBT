(()=>{var e={};e.id=4663,e.ids=[4663],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4770:e=>{"use strict";e.exports=require("crypto")},2254:e=>{"use strict";e.exports=require("node:buffer")},6005:e=>{"use strict";e.exports=require("node:crypto")},7261:e=>{"use strict";e.exports=require("node:util")},7631:(e,t,n)=>{"use strict";n.r(t),n.d(t,{GlobalError:()=>a.a,__next_app__:()=>x,originalPathname:()=>c,pages:()=>p,routeModule:()=>u,tree:()=>d}),n(3277),n(8440),n(5009),n(1837);var o=n(3191),r=n(8716),i=n(7922),a=n.n(i),s=n(5231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);n.d(t,l);let d=["",{children:["student",{children:["exam",{children:["[examId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.bind(n,3277)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"]}]},{}]},{}]},{layout:[()=>Promise.resolve().then(n.bind(n,8440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(n.bind(n,5009)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(n.bind(n,1837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],p=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx"],c="/student/exam/[examId]/page",x={require:n,loadChunk:()=>Promise.resolve()},u=new o.AppPageRouteModule({definition:{kind:r.x.APP_PAGE,page:"/student/exam/[examId]/page",pathname:"/student/exam/[examId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4108:(e,t,n)=>{Promise.resolve().then(n.t.bind(n,2994,23)),Promise.resolve().then(n.t.bind(n,6114,23)),Promise.resolve().then(n.t.bind(n,9727,23)),Promise.resolve().then(n.t.bind(n,9671,23)),Promise.resolve().then(n.t.bind(n,1868,23)),Promise.resolve().then(n.t.bind(n,4759,23))},4696:(e,t,n)=>{Promise.resolve().then(n.bind(n,9180))},6473:(e,t,n)=>{Promise.resolve().then(n.bind(n,4387))},5359:(e,t,n)=>{Promise.resolve().then(n.bind(n,2766))},5303:()=>{},4387:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>a});var o=n(326),r=n(7577);n(434);var i=n(5047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let a=()=>{let e=(0,i.useRouter)(),t=(0,i.useParams)(),n=t?.examId,[a,s]=(0,r.useState)(""),[l,d]=(0,r.useState)(""),[p,c]=(0,r.useState)(!1),[x,u]=(0,r.useState)("overview"),[m,g]=(0,r.useState)(!1),[h,f]=(0,r.useState)([]),[b,y]=(0,r.useState)(0),[j,v]=(0,r.useState)({}),[w,S]=(0,r.useState)(3e3),[k,C]=(0,r.useState)(`Chapterwise 0${n}`);(0,r.useEffect)(()=>{try{let e=localStorage.getItem("currentUser")||"Student";s(e);let t=JSON.parse(localStorage.getItem("institutes")||"[]");t[0]?.logoUrl&&d(t[0].logoUrl)}catch(e){}},[]),(0,r.useEffect)(()=>()=>{},[]);let T=(0,r.useRef)(null),R=(0,r.useRef)({}),E=(0,r.useRef)(0),I=(0,r.useRef)({}),z=(0,r.useRef)(null),N=(0,r.useRef)({}),[W,P]=(0,r.useState)(!1),[A,D]=(0,r.useState)({}),[B,O]=(0,r.useState)(!1),[L,q]=(0,r.useState)(null);(0,r.useEffect)(()=>{(async function(){try{let t=await fetch(`/api/student/exams/${n||"set-1-demo"}/start`,{method:"POST"});if(t.ok){let e=await t.json();if(e.questions&&e.questions.length>=40){f(e.questions),q(e.sessionId),e.examName&&C(e.examName);return}}else{let n=await t.json().catch(()=>({}));alert(n.error||"Access Denied: You do not have authorization to access this exam."),e.push("/student");return}}catch(e){console.warn("Backend start API network error:",e)}let t=JSON.parse(localStorage.getItem("examSets"))||[],o=JSON.parse(localStorage.getItem("questionBank"))||[],r=t.find(e=>e.id.toString()===n?.toString()||e.name===n),i=r?r.name:`Chapterwise 0${n}`;C(i);let a={},s=a[""]||a[""],l=[].some(e=>e?.toString()===n?.toString()||e?.toString()===r?.id?.toString()||e?.toString()===r?.name?.toString()||e?.toString()===i?.toString()||"string"==typeof n&&e?.toString()===decodeURIComponent(n));if(r?.isFree||r?.setType==="FREE"||r?.name&&r.name.toLowerCase().includes("free demo")||i&&i.toLowerCase().includes("free demo")||l||s?.isBuyer||s?.hasPurchased,r&&r.creatorInstituteName&&!r.isPublished){let t={},n=("".toString().replace(/[^0-9]/g,"").slice(-10),e=>!1),o=null;for(let e in t)if((t[e]||[]).some(e=>n(e.phone))){o=e;break}if(!o||o.toLowerCase()!==r.creatorInstituteName.toLowerCase()){alert(`Access Restricted: This exam set is in the private bucket of "${r.creatorInstituteName}". Students from other institutes cannot access it.`),e.push("/student");return}}let d=r?r.packageName:"",p=o.filter(e=>e&&(e.setId?.toString()===n?.toString()||e.set===i||e.package===d&&e.set===i)),c=p.filter(e=>"Reading"===e.type),x=p.filter(e=>"Listening"===e.type),u=[];for(let e=1;e<=20;e++)c[e-1]?u.push({...c[e-1],id:c[e-1].id||e,type:"Reading"}):u.push({id:e,type:"Reading",mainHeading:`[ ${e} ] 다음을 읽고 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["가방","지갑","우산","이불"],answer:0});for(let e=1;e<=20;e++){let t=20+e;x[e-1]?u.push({...x[e-1],id:x[e-1].id||t,type:"Listening"}):u.push({id:t,type:"Listening",mainHeading:`[ ${t} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`,questionHeading:"",description:"",image:"",audio:"",options:["듣기 1","듣기 2","듣기 3","듣기 4"],answer:0})}f(u)})()},[n]),(0,r.useEffect)(()=>{z.current&&clearTimeout(z.current),Object.values(N.current).forEach(e=>clearTimeout(e)),N.current={},T.current&&(T.current.pause(),T.current.currentTime=0),Object.values(R.current).forEach(e=>{e&&(e.pause(),e.currentTime=0)}),E.current=0,I.current={},P(!1),D({}),O(!1)},[b]),(0,r.useEffect)(()=>{if(p){let e=setInterval(()=>{S(t=>t<=1?(clearInterval(e),$(),0):t-1)},1e3);return()=>clearInterval(e)}},[p]);let M=e=>{let t=Math.floor(e/60).toString().padStart(2,"0"),n=(e%60).toString().padStart(2,"0");return`${t}:${n}`},_=e=>{let t=h[b];v({...j,[t.id]:e})},H=()=>{0===E.current&&(E.current=1,P(!0),O(!0))},U=()=>{1===E.current?(z.current&&clearTimeout(z.current),z.current=setTimeout(()=>{T.current&&1===E.current&&(E.current=2,T.current.currentTime=0,T.current.play().catch(e=>console.log("Audio 2nd play error:",e)))},3e3)):E.current>=2&&O(!1)},J=e=>{0===(I.current[e]||0)&&(I.current[e]=1,D(t=>({...t,[e]:!0})),O(!0))},F=e=>{let t=I.current[e]||1;1===t?(N.current[e]&&clearTimeout(N.current[e]),N.current[e]=setTimeout(()=>{let t=R.current[e];t&&1===I.current[e]&&(I.current[e]=2,t.currentTime=0,t.play().catch(e=>console.log("Opt audio 2nd play error:",e)))},3e3)):t>=2&&O(!1)},$=async()=>{try{document.fullscreenElement&&document.exitFullscreen().catch(()=>{}),z.current&&clearTimeout(z.current),Object.values(N.current).forEach(e=>clearTimeout(e)),T.current&&T.current.pause(),Object.values(R.current).forEach(e=>e&&e.pause());let t=0,o=0,r={};h.forEach((e,n)=>{let i=void 0!==j[e.id]?j[e.id]:j[n];null!=i&&""!==i&&(r[e.id]=i,void 0!==e.qIndex&&(r[e.qIndex]=i),o+=1,void 0!==e.answer&&Number(i)===Number(e.answer)&&(t+=1))});let i=h.length>0?h.length:40,a={examName:k,score:t,total:i,attempted:o,percentage:Math.round(t/i*100),passed:Math.round(t/i*100)>=40,questions:h,selectedAnswers:r};if(L)try{let e=await fetch(`/api/student/exams/${n||"set-1-demo"}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:L,selectedAnswers:r})});if(e.ok){let n=await e.json();if(n.result){let e=n.result;a.score=void 0!==e.correctAnswers?e.correctAnswers:t,a.total=e.totalQuestions||i,a.passed=!!e.passed,a.percentage=Math.round(a.score/a.total*100),Array.isArray(e.breakdown)&&(a.questions=h.map((t,n)=>{let o=e.breakdown.find(e=>e.qIndex===t.qIndex||e.qIndex===n+1);return o?{...t,answer:o.correctAnswer}:t}))}}}catch(e){console.warn("Submit API network notice:",e)}localStorage.setItem("lastExamResult",JSON.stringify(a));let s=JSON.parse(localStorage.getItem("examResults"))||[];localStorage.setItem("examResults",JSON.stringify([a,...s])),g(!1),e.push("/student/result")}catch(t){console.error("Submission error:",t),e.push("/student/result")}};Object.keys(j).length,h.length;let G={userSelect:"none",WebkitUserSelect:"none",MozUserSelect:"none",msUserSelect:"none"};if(!p)return(0,o.jsxs)("div",{className:"ubt-pre-exam-screen",style:{width:"100vw",minHeight:"100dvh",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"16px 14px",overflowY:"auto",...G},onContextMenu:e=>e.preventDefault(),children:[o.jsx("style",{dangerouslySetInnerHTML:{__html:`
          .ubt-pre-exam-dialog {
            background-color: #ffffff;
            padding: 28px 24px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            text-align: center;
            border: 1px solid #e2e8f0;
            max-width: 480px;
            width: 100%;
            max-height: 94vh;
            overflow-y: auto;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            margin: auto;
          }
          @media (max-width: 480px) {
            .ubt-pre-exam-dialog {
              padding: 20px 16px !important;
              max-height: 96vh !important;
            }
            .ubt-pre-exam-icon {
              width: 58px !important;
              height: 58px !important;
              margin-bottom: 12px !important;
            }
            .ubt-pre-exam-title {
              font-size: 22px !important;
              margin-bottom: 4px !important;
            }
            .ubt-pre-exam-subtitle {
              font-size: 13px !important;
              margin-bottom: 16px !important;
            }
            .ubt-pre-exam-table {
              padding: 12px 14px !important;
              margin-bottom: 20px !important;
            }
            .ubt-pre-exam-row {
              padding-bottom: 8px !important;
              margin-bottom: 8px !important;
            }
            .ubt-pre-exam-btn {
              padding: 12px !important;
              font-size: 14px !important;
            }
          }
        `}}),(0,o.jsxs)("div",{className:"ubt-pre-exam-dialog",children:[o.jsx("div",{className:"ubt-pre-exam-icon",style:{width:"70px",height:"70px",backgroundColor:"#0284c7",borderRadius:"50%",margin:"0 auto 16px auto",display:"flex",alignItems:"center",justifyContent:"center",color:"white",boxShadow:"0 4px 10px rgba(2,132,199,0.3)",flexShrink:0},children:(0,o.jsxs)("svg",{width:"34",height:"34",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[o.jsx("path",{d:"M22 10v6M2 10l10-5 10 5-10 5z"}),o.jsx("path",{d:"M6 12v5c3 3 9 3 12 0v-5"})]})}),o.jsx("h2",{className:"ubt-pre-exam-title",style:{color:"#0f172a",fontSize:"26px",marginTop:0,marginBottom:"6px",fontWeight:"800"},children:"EPS-TOPIK UBT Exam"}),o.jsx("p",{className:"ubt-pre-exam-subtitle",style:{color:"#64748b",margin:"0 0 20px 0",fontSize:"14px"},children:"Please verify your details before starting"}),(0,o.jsxs)("div",{className:"ubt-pre-exam-table",style:{backgroundColor:"#f8fafc",borderRadius:"12px",padding:"16px 18px",marginBottom:"24px",border:"1px solid #e2e8f0",textAlign:"left"},children:[(0,o.jsxs)("div",{className:"ubt-pre-exam-row",style:{display:"flex",justifyContent:"space-between",borderBottom:"1px dashed #cbd5e1",paddingBottom:"10px",marginBottom:"10px"},children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600",fontSize:"13px"},children:"Exam ID"}),o.jsx("span",{style:{color:"#0f172a",fontWeight:"bold",fontSize:"14px"},children:"287378RM"})]}),(0,o.jsxs)("div",{className:"ubt-pre-exam-row",style:{display:"flex",justifyContent:"space-between",borderBottom:"1px dashed #cbd5e1",paddingBottom:"10px",marginBottom:"10px"},children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600",fontSize:"13px"},children:"Student Name"}),o.jsx("span",{suppressHydrationWarning:!0,style:{color:"#0f172a",fontWeight:"bold",fontSize:"14px"},children:a})]}),(0,o.jsxs)("div",{className:"ubt-pre-exam-row",style:{display:"flex",justifyContent:"space-between",borderBottom:"1px dashed #cbd5e1",paddingBottom:"10px",marginBottom:"10px"},children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600",fontSize:"13px"},children:"Exam Title"}),o.jsx("span",{style:{color:"#0f172a",fontWeight:"bold",fontSize:"14px"},children:k})]}),(0,o.jsxs)("div",{className:"ubt-pre-exam-row",style:{display:"flex",justifyContent:"space-between",borderBottom:"1px dashed #cbd5e1",paddingBottom:"10px",marginBottom:"10px"},children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600",fontSize:"13px"},children:"Total Questions"}),o.jsx("span",{style:{color:"#2563eb",fontWeight:"bold",fontSize:"14px"},children:"40 (20 Reading + 20 Listening)"})]}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between"},children:[o.jsx("span",{style:{color:"#64748b",fontWeight:"600",fontSize:"13px"},children:"Time Limit"}),o.jsx("span",{style:{color:"#d97706",fontWeight:"bold",fontSize:"14px"},children:"50 Minutes"})]})]}),(0,o.jsxs)("div",{style:{display:"flex",gap:"12px",justifyContent:"center",marginTop:"auto",flexShrink:0},children:[o.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:()=>e.push("/student"),style:{flex:1,backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",padding:"13px",fontSize:"14px",fontWeight:"bold",borderRadius:"8px",cursor:"pointer",transition:"all 0.2s"},onMouseOver:e=>{e.target.style.backgroundColor="#e2e8f0"},onMouseOut:e=>{e.target.style.backgroundColor="#f1f5f9"},children:"CANCEL"}),o.jsx("button",{type:"button",className:"ubt-pre-exam-btn",onClick:()=>{document.documentElement.requestFullscreen&&!document.fullscreenElement&&document.documentElement.requestFullscreen().then(()=>{try{screen.orientation&&"function"==typeof screen.orientation.lock&&screen.orientation.lock("portrait").catch(()=>{})}catch(e){}}).catch(e=>console.log(e)),c(!0)},style:{flex:1,backgroundColor:"#0284c7",color:"white",border:"none",padding:"13px",fontSize:"14px",fontWeight:"bold",borderRadius:"8px",cursor:"pointer",transition:"all 0.2s",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},children:"GET STARTED"})]})]})]});if(0===h.length)return o.jsx("div",{style:{padding:"50px",textAlign:"center"},children:"Loading exam questions..."});let K={width:"100vw",minHeight:"100dvh",height:"100vh",display:"flex",flexDirection:"column",backgroundColor:"rgba(241, 245, 249, 0.92)",fontFamily:"Arial, sans-serif",boxSizing:"border-box",padding:"12px",overflow:"hidden",position:"relative",backgroundImage:"none",...G};return(0,o.jsxs)("div",{className:"ubt-exam-wrapper",style:K,onContextMenu:e=>e.preventDefault(),children:[o.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
        }
        .ubt-exam-card {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          border-radius: 0 0 8px 8px;
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
          padding: 12px 20px;
          border-radius: 8px 8px 0 0;
          justify-content: space-between;
          font-weight: bold;
          font-size: 15px;
          gap: 8px;
        }
        .ubt-exam-nav-bar {
          display: flex;
          padding: 12px 25px;
          background-color: #f8fafc;
          border-top: 1px solid #cbd5e1;
          border-radius: 0 0 8px 8px;
          justify-content: space-between;
          gap: 8px;
          flex-shrink: 0;
        }
        .ubt-overview-box {
          background-color: rgba(255, 255, 255, 0.95);
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 25px 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          overflow-y: auto;
          max-height: 80vh;
        }
        .ubt-overview-flex {
          display: flex;
          justify-content: space-between;
          gap: 25px;
        }

        /* PORTRAIT & MOBILE ADAPTIVE STYLING FOR EXAM */
        @media (max-width: 768px), (orientation: portrait) and (max-width: 900px) {
          .ubt-exam-wrapper {
            padding: 6px !important;
            height: 100dvh !important;
            overflow-y: auto !important;
          }
          .ubt-exam-main {
            height: 100% !important;
            justify-content: flex-start !important;
          }
          .ubt-exam-header-bar {
            padding: 10px 12px !important;
            font-size: 12.5px !important;
            flex-wrap: wrap !important;
          }
          .ubt-exam-card {
            height: auto !important;
            min-height: 0 !important;
            flex: 1 !important;
            max-height: calc(100dvh - 75px) !important;
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
            padding: 9px 12px !important;
            gap: 6px !important;
          }
          .ubt-exam-nav-bar button {
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          .ubt-overview-box {
            padding: 16px 14px !important;
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
      `}}),m&&o.jsx("div",{style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",backgroundColor:"rgba(0, 0, 0, 0.6)",display:"flex",justifyContent:"center",alignItems:"center",zIndex:99999999,padding:"16px",boxSizing:"border-box"},children:(0,o.jsxs)("div",{style:{backgroundColor:"white",padding:"24px 20px",borderRadius:"12px",maxWidth:"420px",width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",boxSizing:"border-box"},children:[o.jsx("h3",{style:{margin:"0 0 12px 0",color:"#1e293b",fontSize:"18px",fontWeight:"700"},children:"Confirm Submission"}),o.jsx("p",{style:{color:"#475569",fontSize:"14px",marginBottom:"20px",lineHeight:"1.4"},children:"Are you sure you want to submit and end the exam?"}),(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"flex-end",gap:"10px"},children:[o.jsx("button",{type:"button",onClick:()=>g(!1),style:{backgroundColor:"transparent",color:"#0284c7",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer",padding:"8px 14px",borderRadius:"4px"},children:"CANCEL"}),o.jsx("button",{type:"button",onClick:$,style:{backgroundColor:"#0284c7",color:"white",border:"none",fontWeight:"bold",fontSize:"13px",cursor:"pointer",padding:"8px 18px",borderRadius:"4px"},children:"AGREE"})]})]})}),"overview"===x?(0,o.jsxs)("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"850px",width:"100%",height:"100%",margin:"auto",justifyContent:"center"},children:[(0,o.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"14px 20px",borderRadius:"8px 8px 0 0",justifyContent:"space-between",fontWeight:"bold",fontSize:"15px"},children:[o.jsx("span",{children:"Remaining Questions: 40"}),o.jsx("span",{children:k}),(0,o.jsxs)("span",{children:["Time Remaining: ",M(w)]})]}),(0,o.jsxs)("div",{className:"ubt-overview-box",style:{backgroundColor:"rgba(255, 255, 255, 0.95)",border:"1px solid #cbd5e1",borderTop:"none",padding:"25px 30px",borderRadius:"0 0 8px 8px",boxShadow:"0 4px 15px rgba(0,0,0,0.06)"},children:[(0,o.jsxs)("div",{className:"ubt-overview-flex",style:{display:"flex",justifyContent:"space-between",gap:"25px"},children:[(0,o.jsxs)("div",{style:{flex:1,borderRight:"2px solid #e2e8f0",paddingRight:"15px"},children:[o.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 15px 0",fontSize:"15px"},children:"Reading Questions (1 - 20)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:h.slice(0,20).map((e,t)=>o.jsx("button",{type:"button",onClick:()=>{y(t),u("single")},style:{padding:"12px 0",backgroundColor:void 0!==j[e.id]?"#dcfce7":"white",border:"1px solid #0284c7",borderRadius:"5px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:"#1e293b",transition:"0.15s"},children:t+1},e.id))})]}),(0,o.jsxs)("div",{style:{flex:1,paddingLeft:"15px"},children:[o.jsx("h4",{style:{textAlign:"center",color:"#0284c7",margin:"0 0 15px 0",fontSize:"15px"},children:"Listening Questions (21 - 40)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"10px"},children:h.slice(20,40).map((e,t)=>{let n=t+20;return o.jsx("button",{type:"button",onClick:()=>{y(n),u("single")},style:{padding:"12px 0",backgroundColor:void 0!==j[e.id]?"#dcfce7":"white",border:"1px solid #0284c7",borderRadius:"5px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:"#1e293b",transition:"0.15s"},children:n+1},e.id)})})]})]}),o.jsx("div",{style:{marginTop:"25px",textAlign:"right"},children:o.jsx("button",{type:"button",onClick:()=>g(!0),style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"12px 24px",fontSize:"15px",fontWeight:"bold",borderRadius:"5px",cursor:"pointer"},children:"SUBMIT AND FINISH EXAM"})})]})]}):o.jsx("div",{className:"ubt-exam-main",style:{flex:1,display:"flex",flexDirection:"column",maxWidth:"1050px",width:"100%",height:"100%",margin:"auto",justifyContent:"center"},children:(()=>{let e=h[b];return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%",minHeight:0},children:[(0,o.jsxs)("div",{className:"ubt-exam-header-bar",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"12px 20px",borderRadius:"8px 8px 0 0",justifyContent:"space-between",fontWeight:"bold",fontSize:"15px"},children:[o.jsx("span",{children:"Remaining Questions: 40"}),o.jsx("span",{children:k}),(0,o.jsxs)("span",{children:["Time Remaining: ",M(w)]})]}),(0,o.jsxs)("div",{className:"ubt-exam-card",style:{backgroundColor:"rgba(255, 255, 255, 0.95)",border:"1px solid #cbd5e1",borderTop:"none",borderRadius:"0 0 8px 8px",boxShadow:"0 4px 15px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",justifyContent:"space-between",height:"550px",minHeight:"550px"},children:[(0,o.jsxs)("div",{className:"ubt-exam-columns",style:{display:"flex",flex:1,overflow:"hidden"},children:[(0,o.jsxs)("div",{className:"ubt-exam-left",style:{flex:1.2,padding:"20px 25px",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",overflowY:"auto",height:"100%"},children:[o.jsx("p",{style:{color:"#1e293b",fontSize:"20px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.mainHeading||(b<20?"[ 1 - 20 ] 다음을 읽고 알맞은 것을 고르십시오.":"[ 21 - 40 ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.")}),e.questionHeading&&o.jsx("p",{style:{color:"#334155",fontSize:"20px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),e.description&&o.jsx("div",{style:{border:"1px solid #94a3b8",borderRadius:"6px",padding:"12px 15px",backgroundColor:"white",color:"#1e293b",fontSize:"20px",fontWeight:"bold",lineHeight:"1.5",whiteSpace:"pre-wrap",marginBottom:"12px"},children:e.description}),e.image&&o.jsx("div",{style:{margin:"auto",border:"1px solid #cbd5e1",padding:"10px",borderRadius:"6px",backgroundColor:"white",textAlign:"center"},children:o.jsx("img",{src:e.image,alt:"Question Visual",style:{display:"block",maxHeight:"250px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",margin:"0 auto",pointerEvents:"none",imageRendering:"high-quality",WebkitImageRendering:"-webkit-optimize-contrast"},draggable:"false"})}),e.audio&&o.jsx("div",{style:{marginTop:"12px",padding:"10px",backgroundColor:"#f8fafc",borderRadius:"6px",border:"1px solid #cbd5e1",textAlign:"center"},children:o.jsx("audio",{ref:T,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:e=>e.preventDefault(),onPlay:H,onEnded:U,src:e.audio,style:{width:"100%",height:"32px",pointerEvents:W||B?"none":"auto",opacity:W?.5:1,filter:W?"grayscale(80%)":"none"}})})]}),o.jsx("div",{className:"ubt-exam-right",style:{flex:1,padding:"20px 25px",display:"flex",flexDirection:"column",justifyContent:"flex-start",gap:"10px",overflowY:"auto",height:"100%"},children:(()=>{let t=e.options||[],n=t.some(e=>!!("object"==typeof e&&null!==e&&e.image));return!n&&t.every(e=>{let t="object"==typeof e&&null!==e?(e.text||"").trim():(e||"").toString().trim();return!t||["①","②","③","④","1","2","3","4"].includes(t)})?(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"16px",justifyContent:"center",height:"100%",padding:"10px"},children:[o.jsx("p",{style:{color:"#475569",fontSize:"16px",margin:"0 0 10px 0",fontWeight:"600",textAlign:"center"},children:"\uD83C\uDFA7 다음을 듣고 알맞은 번호를 고르십시오. (Blind Listening)"}),o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"},children:t.map((t,n)=>{let r=j[e.id]===n;return(0,o.jsxs)("button",{type:"button",onClick:()=>_(n),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 15px",borderRadius:"12px",border:r?"3px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:r?"#e0f2fe":"white",cursor:"pointer",boxShadow:r?"0 6px 16px rgba(2, 132, 199, 0.25)":"0 2px 6px rgba(0,0,0,0.04)",transition:"all 0.15s ease"},children:[o.jsx("span",{style:{fontSize:"40px",fontWeight:"bold",color:r?"#0284c7":"#1e293b",lineHeight:1},children:["①","②","③","④"][n]}),(0,o.jsxs)("span",{style:{fontSize:"14px",color:r?"#0369a1":"#64748b",marginTop:"8px",fontWeight:"600"},children:["선택 ",n+1]})]},n)})})]}):n?o.jsx("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",width:"100%",padding:"5px 0"},children:t.map((t,n)=>{let r=j[e.id]===n,i="object"==typeof t&&null!==t?t.text:t,a="object"==typeof t&&null!==t?t.image:null;return(0,o.jsxs)("div",{onClick:()=>_(n),style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px",borderRadius:"8px",border:r?"2.5px solid #0284c7":"1.5px solid #cbd5e1",backgroundColor:r?"#eff6ff":"white",cursor:"pointer",boxShadow:r?"0 4px 10px rgba(2, 132, 199, 0.2)":"0 1px 3px rgba(0,0,0,0.05)",position:"relative"},children:[o.jsx("div",{style:{alignSelf:"flex-start",width:"28px",height:"28px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"15px",backgroundColor:r?"#0284c7":"white",color:r?"white":"#0284c7",marginBottom:"6px"},children:n+1}),a&&o.jsx("img",{src:a,alt:`Choice ${n+1}`,style:{maxHeight:"110px",maxWidth:"100%",width:"auto",height:"auto",objectFit:"contain",borderRadius:"4px",pointerEvents:"none"},draggable:"false"}),i&&!["①","②","③","④","1","2","3","4"].includes(i.trim())&&o.jsx("span",{style:{fontSize:"14px",fontWeight:"600",color:"#1e293b",marginTop:"6px",textAlign:"center"},children:i})]},n)})}):t.map((t,n)=>{let r=j[e.id]===n,i="object"==typeof t&&null!==t?t.text:t,a="object"==typeof t&&null!==t?t.image:null,s="object"==typeof t&&null!==t?t.audio:e.optionAudios?.[n]||null,l=A[n];return(0,o.jsxs)("div",{onClick:()=>_(n),style:{display:"flex",flexDirection:"column",padding:"10px 12px",borderBottom:"1px solid #e2e8f0",cursor:"pointer",backgroundColor:r?"#eff6ff":"transparent"},children:[(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[o.jsx("div",{style:{width:"32px",height:"32px",borderRadius:"50%",border:"2px solid #0284c7",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"16px",marginRight:"15px",backgroundColor:r?"#0284c7":"white",color:r?"white":"#0284c7",flexShrink:0},children:n+1}),o.jsx("span",{style:{fontSize:"20px",fontWeight:"normal",color:"#1e293b",flex:1},dangerouslySetInnerHTML:{__html:i}})]}),a&&o.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px"},children:o.jsx("img",{src:a,alt:`Option ${n+1}`,style:{maxHeight:"80px",maxWidth:"100%",width:"auto",height:"auto",borderRadius:"4px",border:"1px solid #cbd5e1"}})}),s&&o.jsx("div",{style:{marginTop:"6px",paddingLeft:"47px",width:"100%"},onClick:e=>e.stopPropagation(),children:o.jsx("audio",{ref:e=>R.current[n]=e,controls:!0,controlsList:"nodownload noremoteplayback noplaybackrate",onContextMenu:e=>e.preventDefault(),onPlay:()=>J(n),onEnded:()=>F(n),src:s,style:{width:"100%",height:"30px",pointerEvents:l||B?"none":"auto",opacity:l?.5:1,filter:l?"grayscale(80%)":"none"}})})]},n)})})()})]}),(0,o.jsxs)("div",{className:"ubt-exam-nav-bar",style:{display:"flex",padding:"12px 25px",backgroundColor:"#f8fafc",borderTop:"1px solid #cbd5e1",borderRadius:"0 0 8px 8px",justifyContent:"space-between"},children:[o.jsx("button",{type:"button",onClick:()=>{z.current&&clearTimeout(z.current),Object.values(N.current).forEach(e=>clearTimeout(e)),T.current&&T.current.pause(),Object.values(R.current).forEach(e=>e&&e.pause()),y(e=>Math.max(0,e-1))},disabled:0===b,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"4px",fontWeight:"bold",cursor:0===b?"not-allowed":"pointer",fontSize:"13px"},children:"❮ PREVIOUS"}),o.jsx("button",{type:"button",onClick:()=>{z.current&&clearTimeout(z.current),Object.values(N.current).forEach(e=>clearTimeout(e)),T.current&&T.current.pause(),Object.values(R.current).forEach(e=>e&&e.pause()),u("overview")},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"4px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"TOTAL QUESTIONS"}),o.jsx("button",{type:"button",onClick:()=>{z.current&&clearTimeout(z.current),Object.values(N.current).forEach(e=>clearTimeout(e)),T.current&&T.current.pause(),Object.values(R.current).forEach(e=>e&&e.pause()),b<h.length-1?y(e=>e+1):g(!0)},style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"9px 18px",borderRadius:"4px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:b===h.length-1?"SUBMIT ❯":"NEXT ❯"})]})]})]})})()})]})}},2766:(e,t,n)=>{"use strict";n.d(t,{default:()=>i});var o=n(326),r=n(7577);function i({allowedRoles:e=[],children:t}){let[n,i]=(0,r.useState)(!0),[a,s]=(0,r.useState)(null);return!n&&a?(0,o.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[o.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:a}),o.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):t}},9180:(e,t,n)=>{"use strict";function o(){return null}n.d(t,{default:()=>o}),n(7577)},5009:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>s,metadata:()=>a,viewport:()=>i});var o=n(9510);n(3346),n(3093);let r=(0,n(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/PwaDesktopInstaller.jsx#default`),i={themeColor:"#003b73",width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover"},a={title:"ExamJK — Exam Japanese and Korean",description:"ExamJK: Japanese and Korean CBT & UBT Examination and Learning System",manifest:"/manifest.json",icons:{icon:"/icon-192.png",shortcut:"/icon-192.png",apple:"/apple-touch-icon.png"},appleWebApp:{capable:!0,statusBarStyle:"black-translucent",title:"ExamJK"}};function s({children:e}){return(0,o.jsxs)("html",{lang:"en",children:[(0,o.jsxs)("head",{children:[o.jsx("meta",{charSet:"utf-8"}),o.jsx("meta",{name:"application-name",content:"ExamJK"}),o.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),o.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"black-translucent"}),o.jsx("meta",{name:"apple-mobile-web-app-title",content:"ExamJK"}),o.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),o.jsx("meta",{name:"theme-color",content:"#003b73"}),o.jsx("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),o.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),o.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),o.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap",rel:"stylesheet"})]}),(0,o.jsxs)("body",{children:[e,o.jsx(r,{})]})]})}},1837:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>r});var o=n(9510);function r(){return(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",padding:"20px"},children:[o.jsx("h2",{style:{fontSize:"24px",fontWeight:"bold",color:"#1e3a8a",marginBottom:"10px"},children:"404 - Page Not Found"}),o.jsx("p",{style:{color:"#64748b",marginBottom:"20px"},children:"The page you are looking for does not exist."}),o.jsx("a",{href:"/",style:{backgroundColor:"#2563eb",color:"white",padding:"10px 20px",borderRadius:"6px",textDecoration:"none",fontWeight:"bold"},children:"Return Home"})]})}},3277:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>o});let o=(0,n(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/exam/[examId]/page.jsx#default`)},8440:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>p,dynamic:()=>s,metadata:()=>l});var o=n(9510),r=n(8408),i=n(8585),a=n(2858);let s="force-dynamic",l={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function p({children:e}){let t=await (0,r.xn)();return t&&d.includes(t.role)||(0,i.redirect)("/?error=unauthorized"),o.jsx(a.Z,{allowedRoles:d,children:e})}},2858:(e,t,n)=>{"use strict";n.d(t,{Z:()=>o});let o=(0,n(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},3346:()=>{},3093:()=>{},8408:(e,t,n)=>{"use strict";n.d(t,{Gv:()=>p,WX:()=>x,c_:()=>d,fT:()=>c,xn:()=>u});var o=n(2023),r=n(6091),i=n(6176),a=n(1615);let s=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let l=new TextEncoder().encode(s);async function d(e){return await o.hash(e,10)}async function p(e,t){return await o.compare(e,t)}async function c(e){return await new r.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(l)}async function x(e){try{let{payload:t}=await (0,i._)(e,l);return t}catch(e){return null}}async function u(e){try{let t=null;if(e){let n=e.cookies.get("sigma_session")?.value;if(n)t=n;else{let n=e.headers.get("authorization");n&&n.startsWith("Bearer ")&&(t=n.split(" ")[1])}}else{let e=(0,a.cookies)();t=e.get("sigma_session")?.value}if(!t)return null;return await x(t)}catch(e){return null}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),o=t.X(0,[8948,3881,4669,7512],()=>n(7631));module.exports=o})();