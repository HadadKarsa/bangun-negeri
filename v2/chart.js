
/* bangun-negeri v2 — FX sparkline history (localStorage-backed) */
(function () {
  "use strict";
  var KEY = "bn:v2:fx_history";
  var MAX = 60;

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var a = raw ? JSON.parse(raw) : [];
      return Array.isArray(a) ? a : [];
    } catch (e) { return []; }
  }
  function save(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a.slice(-MAX))); } catch (e) {}
  }

  function record(rate) {
    if (!rate || !isFinite(rate)) return load();
    var a = load();
    var now = Date.now();
    var last = a[a.length - 1];
    if (last && Math.abs(last.v - rate) < 0.5 && now - last.t < 3600000) return a;
    a.push({ t: now, v: rate });
    save(a);
    return a;
  }

  var SVGNS = "http://www.w3.org/2000/svg";
  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  function draw(history) {
    var host = document.getElementById("fxChart");
    var legend = document.getElementById("fxLegend");
    if (!host) return;
    host.textContent = "";

    if (history.length < 2) {
      var p = document.createElement("div");
      p.className = "empty";
      p.textContent = "Riwayat kurs akan muncul setelah halaman ini dibuka beberapa kali — data disimpan di browser Anda, bukan di server.";
      host.appendChild(p);
      if (legend) legend.textContent = "";
      return;
    }

    var W = 720, H = 180, PADL = 52, PADR = 12, PADT = 12, PADB = 26;
    var vals = history.map(function (d) { return d.v; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (max - min < 1) { max += 0.5; min -= 0.5; }
    var span = max - min;
    var t0 = history[0].t, t1 = history[history.length - 1].t;
    var tspan = Math.max(1, t1 - t0);

    function x(t) { return PADL + ((t - t0) / tspan) * (W - PADL - PADR); }
    function y(v) { return PADT + (1 - (v - min) / span) * (H - PADT - PADB); }

    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "presentation", "aria-hidden": "true" });

    // horizontal grid + labels
    for (var g = 0; g <= 3; g++) {
      var gv = min + (span * g) / 3;
      var gy = y(gv);
      svg.appendChild(el("line", { x1: PADL, x2: W - PADR, y1: gy, y2: gy, "class": "grid-line" }));
      var tx = el("text", { x: PADL - 8, y: gy + 3.5, "class": "tick", "text-anchor": "end" });
      tx.textContent = Math.round(gv).toLocaleString("id-ID");
      svg.appendChild(tx);
    }

    var d = "", area = "";
    history.forEach(function (pt, i) {
      var px = x(pt.t), py = y(pt.v);
      d += (i ? " L" : "M") + px.toFixed(1) + " " + py.toFixed(1);
    });
    area = d + " L" + x(t1).toFixed(1) + " " + (H - PADB) + " L" + x(t0).toFixed(1) + " " + (H - PADB) + " Z";

    svg.appendChild(el("path", { d: area, "class": "area" }));
    svg.appendChild(el("path", { d: d, "class": "line" }));

    var lastPt = history[history.length - 1];
    svg.appendChild(el("circle", { cx: x(lastPt.t).toFixed(1), cy: y(lastPt.v).toFixed(1), r: 4, "class": "dot" }));

    // x labels: first and last date
    [history[0], lastPt].forEach(function (pt, i) {
      var t = el("text", {
        x: x(pt.t).toFixed(1),
        y: H - 6,
        "class": "tick",
        "text-anchor": i === 0 ? "start" : "end"
      });
      t.textContent = new Date(pt.t).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      svg.appendChild(t);
    });

    host.appendChild(svg);

    if (legend) {
      var first = history[0].v, last = lastPt.v;
      var delta = last - first;
      var pct = (delta / first) * 100;
      var sign = delta > 0 ? "+" : "";
      legend.textContent = history.length + " titik · " + new Date(first).toLocaleDateString("id-ID") +
        " → " + new Date(lastPt.t).toLocaleDateString("id-ID") +
        " · perubahan " + sign + delta.toFixed(0).replace("-", "−") + " (" + sign + pct.toFixed(2) + "%)";
    }
  }

  function boot() {
    if (!window.BN) return;
    BN.on("fx_usdidr", function (rec) {
      if (!rec || rec.value == null) return;
      draw(record(rec.value));
    });
    draw(load());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
