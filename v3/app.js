/* bangun-negeri v3: render + interaction.
   Consumes window.BN (data.js). No dependencies. ES5-safe.
   MOTION 1: no entrance animation, no count-up. The page is read, not watched. */
(function () {
  "use strict";

  var doc = document;
  function $(id) { return doc.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /* ---------- theme ---------- */
  var THEME_KEY = "bn:v3:theme";

  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function applyTheme(t) {
    var html = doc.documentElement;
    if (t === "dark" || t === "light") html.setAttribute("data-theme", t);
    else html.removeAttribute("data-theme");

    var dark = (t === "dark") || (t !== "light" && systemPrefersDark());
    var btn = $("themeToggle");
    if (btn) {
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.setAttribute("aria-label", dark ? "Mode terang" : "Mode gelap");
      var lbl = btn.querySelector(".theme-label");
      if (lbl) lbl.textContent = dark ? "Terang" : "Gelap";
    }
    var meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#141310" : "#FAF8F3");
  }

  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) { stored = null; }
  applyTheme(stored);

  var tt = $("themeToggle");
  if (tt) tt.addEventListener("click", function () {
    var cur = doc.documentElement.getAttribute("data-theme");
    var isDark = (cur === "dark") || (cur !== "light" && systemPrefersDark());
    var next = isDark ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme(next);
  });

  /* ---------- sticky header shadow ---------- */
  var header = doc.querySelector("header.site");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- scrollspy ---------- */
  var navLinks = qsa("nav.tabs a");
  var targets = navLinks.map(function (a) {
    var id = (a.getAttribute("href") || "").replace("#", "");
    return { a: a, el: id ? $(id) : null };
  }).filter(function (s) { return s.el; });

  function spy() {
    var y = window.scrollY + 140;
    var best = null;
    targets.forEach(function (s) { if (s.el.offsetTop <= y) best = s; });
    targets.forEach(function (s) { s.a.classList.toggle("active", s === best); });
  }
  if (targets.length) {
    var spyTimer = null;
    window.addEventListener("scroll", function () {
      if (spyTimer) return;
      spyTimer = setTimeout(function () { spy(); spyTimer = null; }, 120);
    }, { passive: true });
    spy();
  }

  /* ---------- formatting: one source of truth, BN.fmt ---------- */
  function fmtFor(key, rec) {
    var f = window.BN && BN.fmt;
    if (f && f[key]) return f[key](rec.value);
    return rec.display == null ? "tidak ada" : rec.display;
  }

  /* ---------- age label ---------- */
  function ageText(ms) {
    if (!ms) return "";
    var d = Date.now() - ms;
    var m = Math.floor(d / 60000);
    if (m < 1) return "baru saja";
    if (m < 60) return m + " menit lalu";
    var h = Math.floor(m / 60);
    if (h < 24) return h + " jam lalu";
    return Math.floor(h / 24) + " hari lalu";
  }

  /* ---------- record painting ---------- */
  function paint(id, rec) {
    qsa('[data-rec="' + id + '"]').forEach(function (n) {
      var key = n.getAttribute("data-fmt");
      var txt = key ? fmtFor(key, rec) : rec.display;
      n.textContent = (txt == null || txt === "") ? "tidak ada" : txt;
      n.classList.toggle("is-stale", !!rec.stale && !rec.fallback);
      n.classList.toggle("is-fallback", !!rec.fallback);
    });

    qsa('[data-year="' + id + '"]').forEach(function (n) {
      n.textContent = rec.year == null ? "tidak ada" : String(rec.year);
    });

    qsa('[data-age="' + id + '"]').forEach(function (n) {
      n.textContent = ageText(rec.fetchedAt);
    });

    qsa('[data-src="' + id + '"]').forEach(function (n) {
      n.textContent = rec.source || "";
      if (rec.url) {
        n.setAttribute("href", rec.url);
        n.setAttribute("target", "_blank");
        n.setAttribute("rel", "noopener");
      }
    });

    qsa('[data-flag="' + id + '"]').forEach(function (n) {
      var state = rec.fallback ? "err" : (rec.stale ? "warn" : "ok");
      n.className = "chip " + state;
      n.textContent = rec.fallback ? "cadangan" : (rec.stale ? "cache" : "live");
    });
  }

  /* ---------- air quality ---------- */
  function lvClass(v) {
    if (v == null) return "lv-mid";
    if (v <= 12) return "lv-good";
    if (v <= 35) return "lv-mid";
    if (v <= 150) return "lv-bad";
    return "lv-verybad";
  }

  function lvText(v) {
    if (v == null) return "tidak tersedia";
    if (v <= 12) return "baik";
    if (v <= 35) return "sedang";
    if (v <= 55) return "tidak sehat bagi kelompok sensitif";
    if (v <= 150) return "tidak sehat";
    return "berbahaya";
  }

  function paintAir() {
    var cities = (window.BN && BN.cities) || [];
    cities.forEach(function (c) {
      var id = c[0];
      var card = $("card-" + id);
      if (!card) return;
      var rec = BN.records[id];
      var v = rec ? rec.value : null;
      var cls = lvClass(v);

      var val = card.querySelector(".aq-val");
      if (val) {
        val.textContent = (v == null ? "tidak ada" : (BN.fmt.num1(v))) ;
        var unit = doc.createElement("span");
        unit.className = "aq-unit";
        unit.textContent = "µg/m³";
        val.appendChild(unit);
      }
      var lab = card.querySelector(".aq-label");
      if (lab) {
        lab.textContent = lvText(v);
        lab.className = "aq-label " + cls;
      }
      card.className = "aq-card " + cls;
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

      var c1 = doc.createElement("td"); c1.className = "num"; c1.textContent = String(i + 1);
      var c2 = doc.createElement("td"); c2.textContent = row[0];
      var c3 = doc.createElement("td"); c3.className = "num"; c3.textContent = BN.fmt.num1(row[1]);
      var c4 = doc.createElement("td"); c4.className = "num"; c4.textContent = BN.fmt.num1((row[1] / total) * 100) + "%";
      var c5 = doc.createElement("td"); c5.className = "bar-cell";
      var track = doc.createElement("div"); track.className = "bar-track";
      var fill = doc.createElement("div"); fill.className = "bar-fill";
      fill.style.width = pct.toFixed(1) + "%";
      track.appendChild(fill); c5.appendChild(track);

      tr.appendChild(c1); tr.appendChild(c2); tr.appendChild(c3); tr.appendChild(c4); tr.appendChild(c5);
      tb.appendChild(tr);
    });

    var sum = $("provSum");
    if (sum) sum.textContent = BN.fmt.num1(total) + " ha";
  }

  qsa("[data-sort-prov]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var k = btn.getAttribute("data-sort-prov") === "name" ? 0 : 1;
      if (provSort.key === k) provSort.dir *= -1;
      else { provSort.key = k; provSort.dir = -1; }
      var th = btn.closest ? btn.closest("th") : null;
      qsa("[data-sort-prov]").forEach(function (o) {
        var t = o.closest ? o.closest("th") : null;
        if (t) t.removeAttribute("aria-sort");
      });
      if (th) th.setAttribute("aria-sort", provSort.dir === 1 ? "ascending" : "descending");
      renderProv();
    });
  });

  /* ---------- full indicator table ---------- */
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
      return BN.records[id] || {
        id: id, label: id, display: "tidak ada", year: null, source: "tidak ada",
        url: "", stale: true, fallback: true, value: null
      };
    });

    rows.sort(function (a, b) {
      if (tblSort.key === "year") return ((a.year || 0) - (b.year || 0)) * tblSort.dir;
      if (tblSort.key === "value") return ((a.value || 0) - (b.value || 0)) * tblSort.dir;
      return String(a.label).localeCompare(String(b.label), "id") * tblSort.dir;
    });

    tb.textContent = "";
    rows.forEach(function (r) {
      var state = r.fallback ? "err" : (r.stale ? "warn" : "ok");
      var label = r.fallback ? "cadangan" : (r.stale ? "cache" : "live");

      var tr = doc.createElement("tr");
      var c1 = doc.createElement("td"); c1.textContent = r.label;
      var c2 = doc.createElement("td"); c2.className = "num";
      c2.textContent = (r.display == null || r.display === "") ? "tidak ada" : r.display;
      var c3 = doc.createElement("td"); c3.className = "num";
      c3.textContent = r.year == null ? "tidak ada" : String(r.year);
      var c4 = doc.createElement("td");
      if (r.url) {
        var a = doc.createElement("a");
        a.href = r.url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = r.source || "tidak ada";
        c4.appendChild(a);
      } else {
        c4.textContent = r.source || "tidak ada";
      }
      var c5 = doc.createElement("td");
      var chip = doc.createElement("span");
      chip.className = "chip " + state;
      chip.textContent = label;
      c5.appendChild(chip);

      tr.appendChild(c1); tr.appendChild(c2); tr.appendChild(c3); tr.appendChild(c4); tr.appendChild(c5);
      tb.appendChild(tr);
    });
  }

  qsa("[data-sort-table]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var k = btn.getAttribute("data-sort-table");
      if (tblSort.key === k) tblSort.dir *= -1;
      else { tblSort.key = k; tblSort.dir = 1; }
      var th = btn.closest ? btn.closest("th") : null;
      qsa("[data-sort-table]").forEach(function (o) {
        var t = o.closest ? o.closest("th") : null;
        if (t) t.removeAttribute("aria-sort");
      });
      if (th) th.setAttribute("aria-sort", tblSort.dir === 1 ? "ascending" : "descending");
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
    doc.body.appendChild(a);
    a.click();
    doc.body.removeChild(a);
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

  /* ---------- global status ---------- */
  function paintStatus() {
    var s = BN.status();
    var el = $("globalStatus");
    if (el) {
      var state = s.failed ? "err" : (s.stale ? "warn" : "ok");
      el.className = "chip " + state;
      el.textContent = s.failed
        ? s.failed + " gagal"
        : (s.stale ? s.stale + " dari cache" : "semua live");
    }
    var lr = $("lastRefresh");
    if (lr) {
      lr.textContent = s.lastFetch
        ? new Date(s.lastFetch).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
        : "tidak ada";
    }
  }

  /* ---------- boot ---------- */
  function repaintAll() {
    Object.keys(BN.records).forEach(function (id) { paint(id, BN.records[id]); });
    paintAir();
    renderTable();
    paintStatus();
  }

  function boot() {
    if (!window.BN) {
      qsa(".skeleton").forEach(function (n) { n.classList.remove("skeleton"); });
      return;
    }

    renderProv();

    BN.onAny(function (rec) {
      paint(rec.id, rec);
      if (rec.id.indexOf("aq_") === 0) paintAir();
      paintStatus();
    });

    BN.ready.then(function () { repaintAll(); });

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
