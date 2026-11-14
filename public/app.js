/* bangun-negeri v2 — render + interaction layer.
   Consumes window.BN (data.js). No dependencies. ES5-safe. */
(function () {
  "use strict";

  var doc = document;
  function $(id) { return doc.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /* ---------- theme ---------- */
  var THEME_KEY = "bn:v2:theme";
  function applyTheme(t) {
    var html = doc.documentElement;
    if (t === "dark" || t === "light") html.setAttribute("data-theme", t);
    else html.removeAttribute("data-theme");
    var btn = $("themeToggle");
    if (btn) {
      var dark = t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches);
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.setAttribute("aria-label", dark ? "Mode terang" : "Mode gelap");
      var lbl = btn.querySelector(".theme-label");
      if (lbl) lbl.textContent = dark ? "Terang" : "Gelap";
    }
  }
  try { applyTheme(localStorage.getItem(THEME_KEY)); } catch (e) { applyTheme(null); }
  var tt = $("themeToggle");
  if (tt) tt.addEventListener("click", function () {
    var cur = doc.documentElement.getAttribute("data-theme");
    var isDark = cur === "dark" || (!cur && matchMedia("(prefers-color-scheme: dark)").matches);
    var next = isDark ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next);
  });

  /* ---------- reveal on scroll ---------- */
  var revealables = qsa(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- scrollspy ---------- */
  var navLinks = qsa("nav.tabs a");
  var sections = navLinks.map(function (a) {
    var id = (a.getAttribute("href") || "").replace("#", "");
    return { a: a, el: id ? $(id) : null };
  }).filter(function (s) { return s.el; });

  function spy() {
    var y = window.scrollY + 120, best = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= y) best = s;
    });
    sections.forEach(function (s) { s.a.classList.toggle("active", s === best); });
  }
  var spyT = null;
  window.addEventListener("scroll", function () {
    if (spyT) return;
    spyT = setTimeout(function () { spy(); spyT = null; }, 120);
  }, { passive: true });
  spy();

  /* ---------- number formatting ---------- */
  var nf = new Intl.NumberFormat("id-ID");
  var nf2 = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function fmtUSD(v) {
    if (v == null) return "—";
    if (v >= 1e12) return "$" + nf2.format(v / 1e12) + " T";
    if (v >= 1e9) return "$" + nf2.format(v / 1e9) + " M";
    if (v >= 1e6) return "$" + nf2.format(v / 1e6) + " jt";
    return "$" + nf.format(Math.round(v));
  }
  function fmtPct(v) { return v == null ? "—" : nf2.format(v) + "%"; }
  function fmtRupiah(v) { return v == null ? "—" : "Rp " + nf.format(Math.round(v)); }
  function fmtInt(v) { return v == null ? "—" : nf.format(Math.round(v)); }

  /* ---------- age label ---------- */
  function ageText(ms) {
    if (!ms) return "";
    var d = Date.now() - ms;
    var m = Math.floor(d / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return m + " menit lalu";
    var h = Math.floor(m / 60);
    if (h < 24) return h + " jam lalu";
    var dd = Math.floor(h / 24);
    return dd + " hari lalu";
  }

  /* ---------- record binding ---------- */
  function paint(id, rec) {
    var nodes = qsa('[data-rec="' + id + '"]');
    nodes.forEach(function (n) {
      var f = n.getAttribute("data-fmt");
      var v = rec.value;
      var txt = rec.display;
      if (f === "usd") txt = fmtUSD(v);
      else if (f === "pct") txt = fmtPct(v);
      else if (f === "rp") txt = fmtRupiah(v);
      else if (f === "int") txt = fmtInt(v);
      n.textContent = txt == null ? "—" : txt;
      n.classList.toggle("is-stale", !!rec.stale);
      n.classList.toggle("is-fallback", !!rec.fallback);
    });
    qsa('[data-year="' + id + '"]').forEach(function (n) {
      n.textContent = rec.year || "—";
    });
    qsa('[data-age="' + id + '"]').forEach(function (n) {
      n.textContent = ageText(rec.fetchedAt);
    });
    qsa('[data-src="' + id + '"]').forEach(function (n) {
      n.textContent = rec.source || "";
      if (rec.url) { n.setAttribute("href", rec.url); n.setAttribute("target", "_blank"); n.setAttribute("rel", "noopener"); }
    });
    qsa('[data-flag="' + id + '"]').forEach(function (n) {
      n.classList.toggle("ok", !rec.stale && !rec.fallback);
      n.classList.toggle("warn", !!rec.stale && !rec.fallback);
      n.classList.toggle("err", !!rec.fallback);
      n.textContent = rec.fallback ? "cadangan" : (rec.stale ? "cache" : "live");
    });
    // count-up for headline numbers
    qsa('[data-count="' + id + '"]').forEach(function (n) {
      countUp(n, rec.value, rec);
    });
  }

  function countUp(el, target, rec) {
    if (target == null || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var f = el.getAttribute("data-fmt");
    var start = 0, dur = 900, t0 = null;
    function fmt(v) {
      if (f === "usd") return fmtUSD(v);
      if (f === "pct") return fmtPct(v);
      if (f === "rp") return fmtRupiah(v);
      if (f === "int") return fmtInt(v);
      return rec.display;
    }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(start + (target - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- air quality ---------- */
  var AQ_CITIES = [
    ["aq_palangka", "Palangka Raya", "Kalimantan Tengah"],
    ["aq_pekanbaru", "Pekanbaru", "Riau"],
    ["aq_pontianak", "Pontianak", "Kalimantan Barat"],
    ["aq_jambi", "Jambi", "Jambi"],
    ["aq_banjarmasin", "Banjarmasin", "Kalimantan Selatan"],
    ["aq_jakarta", "Jakarta", "DKI Jakarta"]
  ];
  function lvClass(v) {
    if (v == null) return "lv-mid";
    if (v <= 12) return "lv-good";
    if (v <= 35) return "lv-mid";
    if (v <= 55) return "lv-bad";
    if (v <= 150) return "lv-bad";
    return "lv-verybad";
  }
  function lvText(v) {
    if (v == null) return "tidak tersedia";
    if (v <= 12) return "baik";
    if (v <= 35) return "sedang";
    if (v <= 55) return "tidak sehat (sensitif)";
    if (v <= 150) return "tidak sehat";
    return "berbahaya";
  }
  function paintAir() {
    AQ_CITIES.forEach(function (c) {
      var id = c[0];
      var card = $("card-" + id);
      if (!card) return;
      var rec = BN.records[id];
      var v = rec ? rec.value : null;
      var val = card.querySelector(".aq-val");
      var lab = card.querySelector(".aq-label");
      if (val) val.innerHTML = (v == null ? "—" : nf2.format(v)) + '<span class="aq-unit">µg/m³</span>';
      if (lab) { lab.textContent = lvText(v); lab.className = "aq-label " + lvClass(v); }
      card.className = "aq-card " + lvClass(v);
    });
  }

  /* ---------- province table ---------- */
  var PROV = [
    ["Kalimantan Barat", 38310.86],
    ["Papua Selatan", 25838.53],
    ["Nusa Tenggara Timur", 19565.16],
    ["Nusa Tenggara Barat", 17406.46],
    ["Riau", 15738.92],
    ["Maluku", 14677.00],
    ["Jawa Timur", 10835.28],
    ["Kalimantan Timur", 8019.63],
    ["Kalimantan Selatan", 7634.46],
    ["Kepulauan Riau", 5760.90],
    ["Kalimantan Tengah", 3657.00]
  ];
  var provSort = { key: 1, dir: -1 };
  function renderProv() {
    var tb = $("provBody");
    if (!tb) return;
    var rows = PROV.slice();
    rows.sort(function (a, b) {
      return provSort.key === 0
        ? a[0].localeCompare(b[0], "id") * provSort.dir
        : (a[1] - b[1]) * provSort.dir;
    });
    var max = Math.max.apply(null, PROV.map(function (r) { return r[1]; }));
    var total = PROV.reduce(function (s, r) { return s + r[1]; }, 0);
    tb.textContent = "";
    rows.forEach(function (row, i) {
      var pct = Math.max(2, (row[1] / max) * 100);
      var tr = doc.createElement("tr");
      tr.innerHTML =
        "<td class='num'>" + (i + 1) + "</td>" +
        "<td>" + row[0] + "</td>" +
        "<td class='num'>" + nf2.format(row[1]) + "</td>" +
        "<td class='num'>" + nf2.format((row[1] / total) * 100) + "%</td>" +
        "<td class='bar-cell'><div class='bar-track'><div class='bar-fill' style='width:" + pct.toFixed(1) + "%'></div></div></td>";
      tb.appendChild(tr);
    });
    var sum = $("provSum");
    if (sum) sum.textContent = nf2.format(total) + " ha";
  }
  qsa("[data-sort-prov]").forEach(function (th) {
    th.addEventListener("click", function () {
      var k = th.getAttribute("data-sort-prov") === "name" ? 0 : 1;
      if (provSort.key === k) provSort.dir *= -1; else { provSort.key = k; provSort.dir = -1; }
      qsa("[data-sort-prov]").forEach(function (o) { o.removeAttribute("aria-sort"); });
      th.setAttribute("aria-sort", provSort.dir === 1 ? "ascending" : "descending");
      renderProv();
    });
  });

  /* ---------- full table ---------- */
  var TABLE_IDS = [
    "fx_usdidr", "gdp", "gdp_pc", "gdp_growth", "inflation", "population",
    "unemployment", "poverty", "manufacturing", "exports", "fdi",
    "life_exp", "urban", "electricity", "internet", "forest", "renewable"
  ];
  var tblSort = { key: "label", dir: 1 };
  function renderTable() {
    var tb = $("tableBody");
    if (!tb) return;
    var rows = TABLE_IDS.map(function (id) {
      var r = BN.records[id];
      return r || { id: id, label: id, display: "—", year: "—", source: "—", stale: true };
    });
    rows.sort(function (a, b) {
      if (tblSort.key === "year") return ((a.year || 0) - (b.year || 0)) * tblSort.dir;
      if (tblSort.key === "value") return ((a.value || 0) - (b.value || 0)) * tblSort.dir;
      return String(a.label).localeCompare(String(b.label), "id") * tblSort.dir;
    });
    tb.textContent = "";
    rows.forEach(function (r) {
      var tr = doc.createElement("tr");
      var flag = r.fallback ? "cadangan" : (r.stale ? "cache" : "live");
      var cls = r.fallback ? "err" : (r.stale ? "warn" : "ok");
      tr.innerHTML =
        "<td>" + r.label + "</td>" +
        "<td class='num'>" + (r.display == null ? "—" : r.display) + "</td>" +
        "<td class='num'>" + (r.year || "—") + "</td>" +
        "<td><a href='" + (r.url || "#sumber") + "' target='_blank' rel='noopener'>" + (r.source || "—") + "</a></td>" +
        "<td><span class='chip " + cls + "'>" + flag + "</span></td>";
      tb.appendChild(tr);
    });
  }
  qsa("[data-sort-table]").forEach(function (th) {
    th.addEventListener("click", function () {
      var k = th.getAttribute("data-sort-table");
      if (tblSort.key === k) tblSort.dir *= -1; else { tblSort.key = k; tblSort.dir = 1; }
      qsa("[data-sort-table]").forEach(function (o) { o.removeAttribute("aria-sort"); });
      th.setAttribute("aria-sort", tblSort.dir === 1 ? "ascending" : "descending");
      renderTable();
    });
  });

  /* ---------- CSV ---------- */
  var csvBtn = $("csvBtn");
  if (csvBtn) csvBtn.addEventListener("click", function () {
    var csv = BN.toCSV();
    var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    var a = doc.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bangun-negeri-" + new Date().toISOString().slice(0, 10) + ".csv";
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  /* ---------- refresh ---------- */
  var refreshBtn = $("refreshBtn");
  if (refreshBtn) refreshBtn.addEventListener("click", function () {
    refreshBtn.disabled = true;
    refreshBtn.classList.add("is-busy");
    BN.refresh().then(function () {
      refreshBtn.disabled = false;
      refreshBtn.classList.remove("is-busy");
      paintStatus();
    });
  });

  /* ---------- status ---------- */
  function paintStatus() {
    var s = BN.status();
    var el = $("globalStatus");
    if (el) {
      el.className = "chip " + (s.failed ? "err" : (s.stale ? "warn" : "ok"));
      el.textContent = s.failed
        ? s.failed + " gagal"
        : (s.stale ? s.stale + " dari cache" : "semua live");
    }
    var lr = $("lastRefresh");
    if (lr) lr.textContent = s.lastFetch
      ? new Date(s.lastFetch).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
      : "—";
  }

  /* ---------- boot ---------- */
  function repaintAll() {
    Object.keys(BN.records).forEach(function (id) { paint(id, BN.records[id]); });
    paintAir(); renderTable(); paintStatus();
  }

  function boot() {
    renderProv();
    if (!window.BN) {
      qsa(".skeleton").forEach(function (n) { n.classList.remove("skeleton"); });
      return;
    }
    BN.onAny(function (rec) {
      paint(rec.id, rec);
      if (rec.id.indexOf("aq_") === 0) paintAir();
      paintStatus();
    });
    BN.ready.then(function () { repaintAll(); });
    // repaint ages every minute
    setInterval(function () {
      Object.keys(BN.records).forEach(function (id) {
        qsa('[data-age="' + id + '"]').forEach(function (n) {
          n.textContent = ageText(BN.records[id].fetchedAt);
        });
      });
    }, 60000);
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
