/* LoadCash landing — phone page fitting, PeraSure's rule (shared/ps-ui/phone-fit.js, mode "cap", web page).
   Load in <head>, before the page renders.
   The 360 px design is enlarged with the phone's screen, but at most MAX times (1.15): a 390 px phone shows it at 1.08×,
   a 430 px one at 1.15× (full zoom would be 1.19×); the layout fills what is left. It works by setting the viewport width,
   so the browser enlarges the whole page — every px grows with it. A phone narrower than 360 px is never shrunk (the layout
   takes its width). Desktop (no touch) is left at 1:1.
   Re-fits on rotation; a toolbar showing / hiding (a few % of height) is settled first so the page never re-lays out under
   the finger. ?debug=1 shows the numbers. */
(function () {
  var MAX = 1.15, DESIGN = 360;
  var meta = document.querySelector('meta[name="viewport"]');
  var touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  var root = document.documentElement, lastR = 0, timer = 0, G = (window.__LC_FIT = {});
  root.setAttribute('data-fit', touch ? 'cap' : 'desktop');
  if (!touch || !meta) return;

  function fit(force) {
    var r = window.innerHeight / window.innerWidth;
    if (!(r > 0)) return;
    if (!force && lastR && Math.abs(r - lastR) / lastR < 0.01) return;
    if (!force && lastR && Math.abs(r - lastR) / lastR < 0.2) { clearTimeout(timer); timer = setTimeout(function () { fit(true); }, 200); return; }
    lastR = r;
    var land = window.innerWidth > window.innerHeight;
    var sw = land ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);   /* device width, points */
    var zoom = Math.max(1, Math.min(MAX, sw / DESIGN));
    var W = Math.round(sw / zoom);                                                                  /* layout width, CSS px */
    var ms = Math.max(0.1, Math.ceil(sw / W * 1000) / 1000);
    meta.setAttribute('content', (W === sw ? 'width=device-width, initial-scale=1' : 'width=' + W) +
      ', user-scalable=no, maximum-scale=' + ms + ', viewport-fit=cover');
    G.sw = sw; G.W = W; G.zoom = sw / W;
  }

  window.__LC_REFIT = fit;
  fit(true);
  window.addEventListener('resize', function () { fit(false); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { fit(true); }, 250); });
  window.addEventListener('load', function () { fit(true); });

  if (/[?&]debug=1/.test(location.search)) setInterval(function () {
    var d = document.getElementById('lc-debug');
    if (!d) { d = document.createElement('pre'); d.id = 'lc-debug'; d.style.cssText = 'position:fixed;left:8px;top:64px;z-index:99999;margin:0;padding:6px 8px;font:10px/1.35 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.72);border-radius:6px;pointer-events:none'; document.body.appendChild(d); }
    d.textContent = 'screen ' + G.sw + ' → layout ' + G.W + ' (×' + (G.zoom || 1).toFixed(3) + ')\ninner ' + innerWidth + 'x' + innerHeight;
  }, 500);
})();
