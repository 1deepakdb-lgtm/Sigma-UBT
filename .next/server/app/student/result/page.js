(()=>{var e={};e.id=2596,e.ids=[2596],e.modules={2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4770:e=>{"use strict";e.exports=require("crypto")},2254:e=>{"use strict";e.exports=require("node:buffer")},6005:e=>{"use strict";e.exports=require("node:crypto")},7261:e=>{"use strict";e.exports=require("node:util")},290:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>a.a,__next_app__:()=>m,originalPathname:()=>x,pages:()=>p,routeModule:()=>c,tree:()=>d}),r(5774),r(8440),r(5009),r(1837);var i=r(3191),n=r(8716),o=r(7922),a=r.n(o),s=r(5231),l={};for(let e in s)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>s[e]);r.d(t,l);let d=["",{children:["student",{children:["result",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,5774)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/result/page.jsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,8440)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/layout.jsx"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,5009)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/layout.jsx"],"not-found":[()=>Promise.resolve().then(r.bind(r,1837)),"/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/not-found.jsx"]}],p=["/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/result/page.jsx"],x="/student/result/page",m={require:r,loadChunk:()=>Promise.resolve()},c=new i.AppPageRouteModule({definition:{kind:n.x.APP_PAGE,page:"/student/result/page",pathname:"/student/result",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},4108:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,2994,23)),Promise.resolve().then(r.t.bind(r,6114,23)),Promise.resolve().then(r.t.bind(r,9727,23)),Promise.resolve().then(r.t.bind(r,9671,23)),Promise.resolve().then(r.t.bind(r,1868,23)),Promise.resolve().then(r.t.bind(r,4759,23))},4696:(e,t,r)=>{Promise.resolve().then(r.bind(r,9180))},329:(e,t,r)=>{Promise.resolve().then(r.bind(r,5773))},5359:(e,t,r)=>{Promise.resolve().then(r.bind(r,2766))},5303:()=>{},5773:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});var i=r(326),n=r(7577),o=r.n(n);r(434);var a=r(5047);"undefined"==typeof globalThis||globalThis.localStorage||(globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{},clear:()=>{},key:()=>null,length:0});let s=()=>{let e=(0,a.useRouter)(),[t,r]=(0,n.useState)(!1),[s,l]=(0,n.useState)("Student"),[d,p]=(0,n.useState)({examName:"EPS-TOPIK Exam",score:0,total:40,attempted:0,questions:[],selectedAnswers:{}}),[x,m]=(0,n.useState)(!1),[c,u]=(0,n.useState)(null);o().useEffect(()=>{try{let e=localStorage.getItem("currentUser")||"Student";l(e);let t=localStorage.getItem("lastExamResult");t&&p(JSON.parse(t))}catch(e){}r(!0)},[]),o().useEffect(()=>{let e=async()=>{};return e(),window.addEventListener("online",e),()=>window.removeEventListener("online",e)},[]);let{examName:h,questions:g=[],selectedAnswers:f={}}=d,b=[...g.filter(e=>e.type&&"reading"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex<=20).slice(0,20),...g.filter(e=>e.type&&"listening"===e.type.toLowerCase()||void 0!==e.qIndex&&e.qIndex>20).slice(0,20)];0===b.length&&g.length>0&&(b=g.slice(0,40));let y=b.length>0?b.length:40,w=0,v=0,j=(e,t)=>{if(e){if(void 0!==f[e.id])return f[e.id];if(void 0!==e.qIndex&&void 0!==f[e.qIndex])return f[e.qIndex];if(void 0!==f[t])return f[t]}};b.forEach((e,t)=>{let r=j(e,t);null!=r&&""!==r&&(w+=1,void 0!==e.answer&&Number(r)===Number(e.answer)&&(v+=1))});let k=y>0?(v/y*100).toFixed(2):"0.00",S=y-w;if(!t)return null;if(x){if(null!==c){let e=b[c],t=j(e,c),r=null!=t&&""!==t&&void 0!==e.answer&&Number(t)===Number(e.answer);return(0,i.jsxs)("div",{className:"result-review-outer",style:{maxWidth:"1050px",margin:"20px auto",padding:"16px",fontFamily:"Arial, sans-serif",boxSizing:"border-box"},children:[i.jsx("style",{dangerouslySetInnerHTML:{__html:`
            @media (orientation: landscape), (max-height: 650px) {
              .result-review-outer {
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 4px 10px !important;
                height: 100vh !important;
                height: 100dvh !important;
                max-height: 100dvh !important;
                box-sizing: border-box !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
              }
              .result-review-header {
                margin-bottom: 4px !important;
              }
              .result-review-header h2 {
                font-size: 14px !important;
              }
              .result-review-header button {
                padding: 4px 14px !important;
                font-size: 12px !important;
              }
              .result-review-card {
                padding: 10px 14px !important;
                flex: 1 !important;
                min-height: 0 !important;
                overflow-y: auto !important;
                border-radius: 12px !important;
              }
              .result-review-card p {
                font-size: 13.5px !important;
                margin-bottom: 3px !important;
              }
              .result-review-card img {
                max-height: 85px !important;
              }
              .result-review-opt-list {
                gap: 5px !important;
                margin-top: 8px !important;
              }
              .result-review-opt-item {
                padding: 5px 10px !important;
              }
              .result-review-opt-badge {
                width: 22px !important;
                height: 22px !important;
                font-size: 11.5px !important;
                margin-right: 8px !important;
              }
              .result-review-opt-text {
                font-size: 13px !important;
              }
            }
          `}}),(0,i.jsxs)("div",{className:"result-review-header",style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"},children:[(0,i.jsxs)("h2",{style:{color:"#1e293b",margin:0,fontSize:"18px"},children:["Question ",c+1," Review (",e.type,")"]}),i.jsx("button",{onClick:()=>u(null),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 18px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Grid"})]}),(0,i.jsxs)("div",{className:"result-review-card",style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"12px",padding:"24px",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"},children:[i.jsx("p",{style:{color:"#1e293b",fontSize:"15px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.mainHeading||(c<20?`[ ${c+1} ] 다음을 읽고 알맞은 것을 고르십시오.`:`[ ${c+1} ] 이야기를 듣고 질문에 알맞은 것을 고르십시오.`)}),e.questionHeading&&i.jsx("p",{style:{color:"#334155",fontSize:"14px",fontWeight:"bold",margin:"0 0 10px 0"},children:e.questionHeading}),(0,i.jsxs)("p",{style:{color:"#1e293b",fontSize:"17px",fontWeight:"bold",margin:"0 0 12px 0"},children:[c+1,". ",e.description||""]}),e.image&&i.jsx("div",{style:{margin:"10px 0",textAlign:"center"},children:i.jsx("img",{src:e.image,alt:"Question Visual",style:{maxHeight:"160px",maxWidth:"240px",objectFit:"contain",borderRadius:"6px",border:"1px solid #cbd5e1"}})}),e.audio&&i.jsx("div",{style:{margin:"10px 0"},children:i.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:e=>e.preventDefault(),src:e.audio,style:{width:"100%",height:"32px"}})}),i.jsx("div",{className:"result-review-opt-list",style:{display:"flex",flexDirection:"column",gap:"10px",marginTop:"18px"},children:Array.isArray(e.options)&&e.options.map((n,o)=>{let a="object"==typeof n&&null!==n?n.text:n,s="object"==typeof n&&null!==n?n.image:null,l="object"==typeof n&&null!==n?n.audio:null,d="#f8fafc",p="#1e293b",x="1px solid #cbd5e1",m="white",c="#0284c7",u="2px solid #0284c7";return Number(o)===Number(e.answer)&&(d="#f0fdf4",p="#166534",x="1px solid #16a34a",m="#16a34a",c="white",u="2px solid #16a34a"),Number(o)!==Number(t)||r||(d="#fef2f2",p="#991b1b",x="1px solid #ef4444",m="#ef4444",c="white",u="2px solid #ef4444"),(0,i.jsxs)("div",{className:"result-review-opt-item",style:{display:"flex",flexDirection:"column",padding:"10px 14px",backgroundColor:d,color:p,border:x,borderRadius:"6px"},children:[(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",width:"100%"},children:[i.jsx("div",{className:"result-review-opt-badge",style:{width:"28px",height:"28px",borderRadius:"50%",backgroundColor:m,color:c,border:u,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:"13px",marginRight:"12px",flexShrink:0},children:o+1}),i.jsx("span",{className:"result-review-opt-text",style:{fontSize:"15px",flex:1},children:a}),Number(o)===Number(e.answer)&&(0,i.jsxs)("span",{style:{fontSize:"12px",fontWeight:"700",color:"#16a34a",marginLeft:"8px",display:"inline-flex",alignItems:"center",gap:"4px"},children:[i.jsx("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"#16a34a",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:i.jsx("polyline",{points:"20 6 9 17 4 12"})}),"Correct"]}),Number(o)===Number(t)&&Number(o)!==Number(e.answer)&&(0,i.jsxs)("span",{style:{fontSize:"12px",fontWeight:"700",color:"#ef4444",marginLeft:"8px",display:"inline-flex",alignItems:"center",gap:"4px"},children:[(0,i.jsxs)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"#ef4444",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),i.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]}),"Your Answer"]})]}),s&&i.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:i.jsx("img",{src:s,alt:`Opt ${o+1}`,style:{maxHeight:"50px",borderRadius:"4px"}})}),l&&i.jsx("div",{style:{marginTop:"6px",paddingLeft:"40px"},children:i.jsx("audio",{controls:!0,controlsList:"nodownload",onContextMenu:e=>e.preventDefault(),src:l,style:{width:"100%",height:"25px"}})})]},o)})}),(0,i.jsxs)("div",{style:{marginTop:"25px",display:"flex",justifyContent:"space-between"},children:[i.jsx("button",{onClick:()=>u(e=>Math.max(0,e-1)),disabled:0===c,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"10px 20px",borderRadius:"4px",fontWeight:"bold",cursor:0===c?"not-allowed":"pointer"},children:"❮ Previous Question"}),i.jsx("button",{onClick:()=>u(e=>Math.min(b.length-1,e+1)),disabled:c===b.length-1,style:{backgroundColor:"#0ea5e9",color:"white",border:"none",padding:"10px 20px",borderRadius:"4px",fontWeight:"bold",cursor:c===b.length-1?"not-allowed":"pointer"},children:"Next Question ❯"})]})]})]})}return(0,i.jsxs)("div",{className:"result-grid-outer",style:{maxWidth:"1000px",margin:"20px auto",padding:"16px",fontFamily:"Arial, sans-serif",boxSizing:"border-box"},children:[i.jsx("style",{dangerouslySetInnerHTML:{__html:`
          @media (orientation: landscape), (max-height: 650px) {
            .result-grid-outer {
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 3px 8px !important;
              height: 100vh !important;
              height: 100dvh !important;
              max-height: 100dvh !important;
              box-sizing: border-box !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
            }
            .result-grid-top-bar {
              margin-bottom: 3px !important;
            }
            .result-grid-back-btn {
              padding: 4px 14px !important;
              font-size: 12px !important;
            }
            .result-grid-card {
              flex: 1 !important;
              min-height: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              overflow: hidden !important;
              border-radius: 10px !important;
            }
            .result-grid-header {
              padding: 5px 12px !important;
              font-size: 12px !important;
              gap: 8px !important;
              flex-shrink: 0 !important;
            }
            .result-grid-body {
              padding: 5px 10px !important;
              flex: 1 !important;
              min-height: 0 !important;
              overflow-y: auto !important;
            }
            .result-grid-columns {
              gap: 10px !important;
              flex-wrap: nowrap !important;
            }
            .result-grid-column {
              min-width: 0 !important;
              padding-right: 6px !important;
            }
            .result-grid-heading {
              margin: 0 0 3px 0 !important;
              font-size: 12.5px !important;
            }
            .result-grid-buttons {
              gap: 3px !important;
            }
            .result-grid-btn {
              padding: 4px 0 !important;
              font-size: 11.5px !important;
              min-height: 25px !important;
              border-radius: 4px !important;
            }
          }
        `}}),i.jsx("div",{className:"result-grid-top-bar",style:{marginBottom:"12px"},children:i.jsx("button",{className:"result-grid-back-btn",onClick:()=>m(!1),style:{backgroundColor:"#0284c7",color:"white",border:"none",padding:"8px 18px",borderRadius:"6px",fontWeight:"bold",cursor:"pointer",fontSize:"13px"},children:"❮ Back to Summary"})}),(0,i.jsxs)("div",{className:"result-grid-card",style:{backgroundColor:"white",border:"1px solid #cbd5e1",borderRadius:"10px",overflow:"hidden",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"},children:[(0,i.jsxs)("div",{className:"result-grid-header",style:{display:"flex",backgroundColor:"#0284c7",color:"white",padding:"12px 18px",justifyContent:"space-between",fontWeight:"bold",fontSize:"14px",flexWrap:"wrap",gap:"10px"},children:[(0,i.jsxs)("span",{children:["Total Questions: ",y]}),(0,i.jsxs)("span",{children:["Exam: ",h]}),(0,i.jsxs)("span",{children:["Solved: ",w]}),(0,i.jsxs)("span",{children:["UnSolved: ",S]})]}),i.jsx("div",{className:"result-grid-body",style:{padding:"18px"},children:(0,i.jsxs)("div",{className:"result-grid-columns",style:{display:"flex",justifyContent:"space-between",gap:"16px",flexWrap:"wrap"},children:[(0,i.jsxs)("div",{className:"result-grid-column",style:{flex:1,minWidth:"260px",borderRight:"2px solid #e2e8f0",paddingRight:"12px"},children:[i.jsx("h3",{className:"result-grid-heading",style:{textAlign:"center",color:"#0284c7",marginBottom:"10px",fontSize:"15px"},children:"Reading Questions"}),i.jsx("div",{className:"result-grid-buttons",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"6px"},children:b.slice(0,20).map((e,t)=>{let r=j(e,t),n=null!=r&&""!==r,o=n&&void 0!==e.answer&&Number(r)===Number(e.answer),a="white",s="#cbd5e1",l="#1e293b";return n&&(o?(a="#16a34a",s="#15803d"):(a="#ef4444",s="#dc2626"),l="white"),i.jsx("button",{className:"result-grid-btn",onClick:()=>u(t),style:{padding:"10px 0",backgroundColor:a,border:`1px solid ${s}`,borderRadius:"4px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:l},children:t+1},e.id||t)})})]}),(0,i.jsxs)("div",{className:"result-grid-column",style:{flex:1,minWidth:"260px",paddingLeft:"4px"},children:[i.jsx("h3",{className:"result-grid-heading",style:{textAlign:"center",color:"#0284c7",marginBottom:"10px",fontSize:"15px"},children:"Listening Questions"}),i.jsx("div",{className:"result-grid-buttons",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"6px"},children:b.slice(20,40).map((e,t)=>{let r=t+20,n=j(e,r),o=null!=n&&""!==n,a=o&&void 0!==e.answer&&Number(n)===Number(e.answer),s="white",l="#cbd5e1",d="#1e293b";return o&&(a?(s="#16a34a",l="#15803d"):(s="#ef4444",l="#dc2626"),d="white"),i.jsx("button",{className:"result-grid-btn",onClick:()=>u(r),style:{padding:"10px 0",backgroundColor:s,border:`1px solid ${l}`,borderRadius:"4px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",color:d},children:r+1},e.id||r)})})]})]})})]})]})}return(0,i.jsxs)("div",{style:{minHeight:"100vh",backgroundColor:"#f8fafc",fontFamily:"Arial, sans-serif",display:"flex",flexDirection:"column"},children:[i.jsx("style",{dangerouslySetInnerHTML:{__html:`
        .result-summary-top-bar {
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
        .result-summary-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          box-sizing: border-box;
        }
        .result-summary-card {
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
        .result-summary-header {
          text-align: center;
          margin-bottom: 18px;
        }
        .result-summary-trophy {
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
        .result-summary-title {
          color: #0f172a;
          font-size: 22px;
          margin: 0 0 8px 0;
          font-weight: 800;
        }
        .result-summary-badge {
          display: inline-block;
          background-color: #f1f5f9;
          padding: 6px 16px;
          border-radius: 20px;
          color: #475569;
          font-weight: 600;
          font-size: 13.5px;
        }
        .result-summary-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .result-summary-stats {
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          border: 1px solid #e2e8f0;
        }
        .result-summary-actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* LANDSCAPE MODE: FIT ON SCREEN CLEANLY WITHOUT SCROLL OR OVERFLOW */
        @media (orientation: landscape), (max-height: 650px) {
          .result-summary-top-bar {
            display: none !important;
          }
          .result-summary-wrap {
            padding: 6px 12px !important;
            height: 100vh !important;
            height: 100dvh !important;
            min-height: 0 !important;
            overflow: hidden !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .result-summary-card {
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
          .result-summary-header {
            margin-bottom: 8px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            text-align: left !important;
          }
          .result-summary-trophy {
            width: 38px !important;
            height: 38px !important;
            font-size: 20px !important;
            margin: 0 !important;
            flex-shrink: 0 !important;
          }
          .result-summary-title {
            font-size: 16px !important;
            margin: 0 !important;
          }
          .result-summary-badge {
            font-size: 12px !important;
            padding: 2px 10px !important;
            border-radius: 14px !important;
          }
          .result-summary-grid {
            flex-direction: row !important;
            align-items: stretch !important;
            gap: 14px !important;
          }
          .result-summary-stats {
            flex: 1.3 !important;
            padding: 8px 14px !important;
            gap: 4px !important;
            margin-bottom: 0 !important;
            border-radius: 16px !important;
          }
          .result-summary-stats > div {
            padding-bottom: 4px !important;
            max-width: 100% !important;
          }
          .result-summary-stats span {
            font-size: 13px !important;
          }
          .result-summary-actions {
            flex: 1 !important;
            flex-direction: column !important;
            justify-content: center !important;
            gap: 10px !important;
          }
          .result-summary-actions button {
            width: 100% !important;
            max-width: none !important;
            min-width: 0 !important;
            padding: 10px 14px !important;
            font-size: 13.5px !important;
            border-radius: 12px !important;
          }
        }
      `}}),i.jsx("div",{className:"result-summary-top-bar",children:i.jsx("span",{children:"Exam Summary"})}),i.jsx("div",{className:"result-summary-wrap",children:(0,i.jsxs)("div",{className:"result-summary-card",children:[(0,i.jsxs)("div",{className:"result-summary-header",children:[i.jsx("div",{className:"result-summary-trophy",children:"\uD83C\uDFC6"}),(0,i.jsxs)("div",{children:[i.jsx("h2",{className:"result-summary-title",children:"Congratulations, Exam Ended!"}),(0,i.jsxs)("div",{className:"result-summary-badge",children:[i.jsx("span",{style:{color:"#0284c7"},children:"\uD83D\uDC64 Name:"})," ",s," \xa0 | \xa0 ",i.jsx("span",{style:{color:"#0284c7"},children:"Exam:"})," ",h]})]})]}),(0,i.jsxs)("div",{className:"result-summary-grid",children:[(0,i.jsxs)("div",{className:"result-summary-stats",children:[(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[i.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Total Questions"}),i.jsx("span",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold"},children:y})]}),(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[i.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Total Attempted"}),i.jsx("span",{style:{color:"#0f172a",fontSize:"15px",fontWeight:"bold"},children:w})]}),(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",borderBottom:"1px dashed #cbd5e1",paddingBottom:"6px"},children:[i.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Total Correct"}),i.jsx("span",{style:{color:"#16a34a",fontSize:"17px",fontWeight:"900"},children:v})]}),(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"280px",paddingTop:"4px"},children:[i.jsx("span",{style:{color:"#64748b",fontSize:"14.5px",fontWeight:"600"},children:"Your Percentage"}),(0,i.jsxs)("span",{style:{color:k>=40?"#0284c7":"#ef4444",fontSize:"17px",fontWeight:"900"},children:[k,"%"]})]})]}),(0,i.jsxs)("div",{className:"result-summary-actions",children:[i.jsx("button",{type:"button",onClick:()=>m(!0),style:{flex:1,minWidth:"160px",maxWidth:"220px",backgroundColor:"#0284c7",color:"white",border:"none",padding:"12px 20px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",transition:"transform 0.2s",boxShadow:"0 4px 6px rgba(2, 132, 199, 0.2)"},onMouseOver:e=>e.target.style.transform="translateY(-2px)",onMouseOut:e=>e.target.style.transform="translateY(0)",children:"VIEW RESULT"}),i.jsx("button",{type:"button",onClick:()=>e.push("/student"),style:{flex:1,minWidth:"160px",maxWidth:"220px",backgroundColor:"#f1f5f9",color:"#475569",border:"1px solid #cbd5e1",padding:"12px 20px",borderRadius:"8px",fontWeight:"bold",fontSize:"14px",cursor:"pointer",transition:"all 0.2s"},onMouseOver:e=>{e.target.style.backgroundColor="#e2e8f0",e.target.style.transform="translateY(-2px)"},onMouseOut:e=>{e.target.style.backgroundColor="#f1f5f9",e.target.style.transform="translateY(0)"},children:"CLOSE"})]})]})]})})]})}},2766:(e,t,r)=>{"use strict";r.d(t,{default:()=>o});var i=r(326),n=r(7577);function o({allowedRoles:e=[],children:t}){let[r,o]=(0,n.useState)(!0),[a,s]=(0,n.useState)(null);return!r&&a?(0,i.jsxs)("div",{style:{minHeight:"100vh",width:"100vw",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:"#0f172a",color:"#f8fafc",fontFamily:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',padding:"20px"},children:[i.jsx("p",{style:{fontSize:"15px",color:"#f87171",marginBottom:"16px"},children:a}),i.jsx("button",{onClick:()=>{window.location.href="/"},style:{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"8px",padding:"10px 20px",cursor:"pointer"},children:"Return to Login"})]}):t}},9180:(e,t,r)=>{"use strict";function i(){return null}r.d(t,{default:()=>i}),r(7577)},5009:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s,metadata:()=>a,viewport:()=>o});var i=r(9510);r(3346),r(3093);let n=(0,r(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/PwaDesktopInstaller.jsx#default`),o={themeColor:"#003b73",width:"device-width",initialScale:1,maximumScale:5,viewportFit:"cover"},a={title:"ExamJK — Exam Japanese and Korean",description:"ExamJK: Japanese and Korean CBT & UBT Examination and Learning System",manifest:"/manifest.json",icons:{icon:"/icon-192.png",shortcut:"/icon-192.png",apple:"/apple-touch-icon.png"},appleWebApp:{capable:!0,statusBarStyle:"black-translucent",title:"ExamJK"}};function s({children:e}){return(0,i.jsxs)("html",{lang:"en",children:[(0,i.jsxs)("head",{children:[i.jsx("meta",{charSet:"utf-8"}),i.jsx("meta",{name:"application-name",content:"ExamJK"}),i.jsx("meta",{name:"apple-mobile-web-app-capable",content:"yes"}),i.jsx("meta",{name:"apple-mobile-web-app-status-bar-style",content:"black-translucent"}),i.jsx("meta",{name:"apple-mobile-web-app-title",content:"ExamJK"}),i.jsx("meta",{name:"mobile-web-app-capable",content:"yes"}),i.jsx("meta",{name:"theme-color",content:"#003b73"}),i.jsx("link",{rel:"apple-touch-icon",href:"/apple-touch-icon.png"}),i.jsx("link",{rel:"preconnect",href:"https://fonts.googleapis.com"}),i.jsx("link",{rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"}),i.jsx("link",{href:"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap",rel:"stylesheet"})]}),(0,i.jsxs)("body",{children:[e,i.jsx(n,{})]})]})}},1837:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>n});var i=r(9510);function n(){return(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",padding:"20px"},children:[i.jsx("h2",{style:{fontSize:"24px",fontWeight:"bold",color:"#1e3a8a",marginBottom:"10px"},children:"404 - Page Not Found"}),i.jsx("p",{style:{color:"#64748b",marginBottom:"20px"},children:"The page you are looking for does not exist."}),i.jsx("a",{href:"/",style:{backgroundColor:"#2563eb",color:"white",padding:"10px 20px",borderRadius:"6px",textDecoration:"none",fontWeight:"bold"},children:"Return Home"})]})}},8440:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>p,dynamic:()=>s,metadata:()=>l});var i=r(9510),n=r(8408),o=r(8585),a=r(2858);let s="force-dynamic",l={title:"Student Portal — ExamJK",description:"Student Exam Center and Dashboard"},d=["student","admin","institute"];async function p({children:e}){let t=await (0,n.xn)();return t&&d.includes(t.role)||(0,o.redirect)("/?error=unauthorized"),i.jsx(a.Z,{allowedRoles:d,children:e})}},5774:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>i});let i=(0,r(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/app/student/result/page.jsx#default`)},2858:(e,t,r)=>{"use strict";r.d(t,{Z:()=>i});let i=(0,r(8570).createProxy)(String.raw`/Users/deepakbhatt/Desktop/untitled folder 2/sigma-ubt/src/components/ClientAuthGuard.jsx#default`)},3346:()=>{},3093:()=>{},8408:(e,t,r)=>{"use strict";r.d(t,{Gv:()=>p,WX:()=>m,c_:()=>d,fT:()=>x,xn:()=>c});var i=r(2023),n=r(6091),o=r(6176),a=r(1615);let s=(process.env.JWT_SECRET||"sigma-ubt-production-secret-key-2026").trim();process.env.JWT_SECRET&&"sigma-ubt-production-secret-key-2026"!==process.env.JWT_SECRET||console.warn("[SECURITY CRITICAL] JWT_SECRET is not configured with a secure random key. Generate one with `openssl rand -hex 32` and set it in your production .env file.");let l=new TextEncoder().encode(s);async function d(e){return await i.hash(e,10)}async function p(e,t){return await i.compare(e,t)}async function x(e){return await new n.N(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("7d").sign(l)}async function m(e){try{let{payload:t}=await (0,o._)(e,l);return t}catch(e){return null}}async function c(e){try{let t=null;if(e){let r=e.cookies.get("sigma_session")?.value;if(r)t=r;else{let r=e.headers.get("authorization");r&&r.startsWith("Bearer ")&&(t=r.split(" ")[1])}}else{let e=(0,a.cookies)();t=e.get("sigma_session")?.value}if(!t)return null;return await m(t)}catch(e){return null}}}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[8948,3881,4669,7512],()=>r(290));module.exports=i})();