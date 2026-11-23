2:I[4707,[],""]
3:I[6423,[],""]
6:I[8362,["6081","static/chunks/6081-faecd51d26612018.js","3185","static/chunks/app/layout-f1babd4f93cc33d7.js"],"default"]
7:I[1029,["6081","static/chunks/6081-faecd51d26612018.js","3185","static/chunks/app/layout-f1babd4f93cc33d7.js"],"default"]
8:I[8124,["6081","static/chunks/6081-faecd51d26612018.js","3185","static/chunks/app/layout-f1babd4f93cc33d7.js"],"default"]
4:T401,
              (function() {
                try {
                  var isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
                  var isiOSStandalone = window.navigator && window.navigator.standalone === true;
                  var isNativeApp = !!window.AndroidApp || !!window.Capacitor || !!window._isNativeApp || (document.referrer && document.referrer.indexOf('android-app://') !== -1) || /ExamJK-Android-App|ExamJKApp|Android.*Version\/[0-9.]+\s+Chrome\/[0-9.]+|wv/i.test(navigator.userAgent);
                  var isMobileWidth = window.innerWidth <= 1024;
                  if (isStandalone || isiOSStandalone) {
                    document.documentElement.classList.add('is-pwa-standalone');
                  }
                  if (isNativeApp || isStandalone || isiOSStandalone || isMobileWidth) {
                    document.documentElement.classList.add('is-mobile-app');
                  }
                } catch (e) {}
              })();
            5:Td0a,
              (function() {
                try {
                  var startY = 0;
                  var startX = 0;
                  var isTracking = false;
                  var cachedScrollContainer = null;

                  function findScrollParent(node) {
                    var cur = node;
                    while (cur && cur !== document.body && cur !== document.documentElement) {
                      try {
                        var oy = window.getComputedStyle(cur).overflowY;
                        if ((oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight) {
                          return cur;
                        }
                      } catch (e) {}
                      cur = cur.parentElement;
                    }
                    return null;
                  }

                  function onTouchStart(e) {
                    if (e.touches && e.touches.length === 1) {
                      startY = e.touches[0].clientY;
                      startX = e.touches[0].clientX;
                      isTracking = true;
                      cachedScrollContainer = findScrollParent(e.target);
                    } else {
                      isTracking = false;
                      cachedScrollContainer = null;
                    }
                  }

                  function onTouchMove(e) {
                    if (!isTracking || !e.touches || e.touches.length !== 1) return;
                    var cy = e.touches[0].clientY;
                    var cx = e.touches[0].clientX;
                    var dy = cy - startY;
                    var dx = cx - startX;
                    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
                      var isAtTop = false;
                      if (cachedScrollContainer) {
                        isAtTop = cachedScrollContainer.scrollTop <= 0;
                      } else {
                        var winScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                        isAtTop = winScroll <= 0;
                      }
                      if (isAtTop && e.cancelable) {
                        e.preventDefault();
                      }
                    }
                  }

                  function onTouchEnd() {
                    isTracking = false;
                    cachedScrollContainer = null;
                  }

                  window.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
                  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
                  window.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
                  window.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });

                  document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
                  document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
                  document.addEventListener('touchend', onTouchEnd, { passive: true, capture: true });
                  document.addEventListener('touchcancel', onTouchEnd, { passive: true, capture: true });
                } catch (e) {}
              })();
            0:["1luHXBMD1UkJiMiJ4if3i",[[["",{"children":["/_not-found",{"children":["__PAGE__",{}]}]},"$undefined","$undefined",true],["",{"children":["/_not-found",{"children":["__PAGE__",{},[["$L1",["$","div",null,{"style":{"display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","minHeight":"60vh","textAlign":"center","padding":"20px"},"children":[["$","h2",null,{"style":{"fontSize":"24px","fontWeight":"bold","color":"#1e3a8a","marginBottom":"10px"},"children":"404 - Page Not Found"}],["$","p",null,{"style":{"color":"#64748b","marginBottom":"20px"},"children":"The page you are looking for does not exist."}],["$","a",null,{"href":"/","style":{"backgroundColor":"#2563eb","color":"white","padding":"10px 20px","borderRadius":"6px","textDecoration":"none","fontWeight":"bold"},"children":"Return Home"}]]}],null],null],null]},[null,["$","$L2",null,{"parallelRouterKey":"children","segmentPath":["children","/_not-found","children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","notFoundStyles":"$undefined"}]],null]},[[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/f2187bd76b226da1.css","precedence":"next","crossOrigin":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":[["$","head",null,{"children":[["$","meta",null,{"charSet":"utf-8"}],["$","meta",null,{"name":"application-name","content":"ExamJK"}],["$","meta",null,{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"#003b73"}],["$","meta",null,{"name":"apple-mobile-web-app-title","content":"ExamJK"}],["$","meta",null,{"name":"mobile-web-app-capable","content":"yes"}],["$","meta",null,{"name":"theme-color","content":"#003b73"}],["$","meta",null,{"name":"msapplication-navbutton-color","content":"#003b73"}],["$","meta",null,{"name":"apple-mobile-web-app-status-bar-style","content":"#003b73"}],["$","link",null,{"rel":"apple-touch-icon","href":"/apple-touch-icon.png"}],["$","link",null,{"rel":"preconnect","href":"https://fonts.googleapis.com"}],["$","link",null,{"rel":"preconnect","href":"https://fonts.gstatic.com","crossOrigin":"anonymous"}],["$","link",null,{"href":"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap","rel":"stylesheet"}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$4"}}],["$","script",null,{"dangerouslySetInnerHTML":{"__html":"$5"}}]]}],["$","body",null,{"suppressHydrationWarning":true,"children":[["$","$L6",null,{}],["$","$L2",null,{"parallelRouterKey":"children","segmentPath":["children"],"error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L3",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":["$","div",null,{"style":{"display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","minHeight":"60vh","textAlign":"center","padding":"20px"},"children":[["$","h2",null,{"style":{"fontSize":"24px","fontWeight":"bold","color":"#1e3a8a","marginBottom":"10px"},"children":"404 - Page Not Found"}],["$","p",null,{"style":{"color":"#64748b","marginBottom":"20px"},"children":"The page you are looking for does not exist."}],["$","a",null,{"href":"/","style":{"backgroundColor":"#2563eb","color":"white","padding":"10px 20px","borderRadius":"6px","textDecoration":"none","fontWeight":"bold"},"children":"Return Home"}]]}],"notFoundStyles":[]}],["$","$L7",null,{}],["$","$L8",null,{}]]}]]}]],null],null],["$L9",["$","meta",null,{"name":"robots","content":"noindex"}]]]]]
9:[["$","meta","0",{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover"}],["$","meta","1",{"name":"theme-color","media":"(prefers-color-scheme: light)","content":"#003b73"}],["$","meta","2",{"name":"theme-color","media":"(prefers-color-scheme: dark)","content":"#003b73"}],["$","meta","3",{"charSet":"utf-8"}],["$","title","4",{"children":"ExamJK — Exam Japanese and Korean"}],["$","meta","5",{"name":"description","content":"ExamJK: Japanese and Korean CBT & UBT Examination and Learning System"}],["$","link","6",{"rel":"manifest","href":"/manifest.json","crossOrigin":"use-credentials"}],["$","meta","7",{"name":"apple-mobile-web-app-capable","content":"yes"}],["$","meta","8",{"name":"apple-mobile-web-app-title","content":"ExamJK"}],["$","meta","9",{"name":"apple-mobile-web-app-status-bar-style","content":"default"}],["$","link","10",{"rel":"shortcut icon","href":"/icon-192.png"}],["$","link","11",{"rel":"icon","href":"/icon-192.png"}],["$","link","12",{"rel":"apple-touch-icon","href":"/apple-touch-icon.png"}]]
1:null
