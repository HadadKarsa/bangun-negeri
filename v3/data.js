/* bangun-negeri v3: data layer. Owner: wowo. Contract: v2/SPEC.md.
 * Plain ES5-safe, no deps, no build. Exposes window.BN.
 * Never throws to the caller: a failure leaves value:null + stale:true, or a
 * fallback with fallback:true. Every record carries source, url, year, fetchedAt.
 */
(function (global) {
  "use strict";

  var TTL_LIVE = 15 * 60 * 1000;
  var TTL_ANNUAL = 24 * 60 * 60 * 1000;
  var TIMEOUT = 10000;
  var RETRY_DELAYS = [400, 1200];
  var CACHE_PREFIX = "bn:v2:";

  var WB = "https://api.worldbank.org/v2/country/IDN/indicator/";
  var FX_URL = "https://open.er-api.com/v6/latest/USD";
  var AQ_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

  var records = {};
  var subs = {};
  var anySubs = [];
  var lastFetch = 0;

  function now() { return Date.now(); }
  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  function safeGet(k) { try { return global.localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { global.localStorage.setItem(k, v); } catch (e) {} }
  function safeDel(k) { try { global.localStorage.removeItem(k); } catch (e) {} }

  function cacheGet(id) {
    var raw = safeGet(CACHE_PREFIX + id);
    if (!raw) return null;
    try { var o = JSON.parse(raw); return (o && typeof o === "object") ? o : null; }
    catch (e) { return null; }
  }
  function cacheSet(id, rec) {
    var c = {}, k;
    for (k in rec) { if (has(rec, k)) c[k] = rec[k]; }
    try { safeSet(CACHE_PREFIX + id, JSON.stringify(c)); } catch (e) {}
  }

  function emit(id) {
    var rec = records[id], list = subs[id], i;
    if (list) {
      for (i = 0; i < list.length; i++) { try { list[i](rec); } catch (e) {} }
    }
    for (i = 0; i < anySubs.length; i++) { try { anySubs[i](rec); } catch (e) {} }
  }
  function put(id, rec) { records[id] = rec; emit(id); return rec; }

  /* ---------- formatting (id-ID) ---------- */

  var nfID = null, nfID0 = null;
  try {
    nfID = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
    nfID0 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
  } catch (e) { nfID = null; nfID0 = null; }

  function groupID(n, dec) {
    if (!isNum(n)) return "\u2014";
    if (nfID0) return (dec ? nfID : nfID0).format(n);
    var s = (dec ? n.toFixed(2) : String(Math.round(n))).split(".");
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return s.join(",");
  }

  var FMT = {
    idr: function (v) { return "Rp " + groupID(v, false); },
    usd: function (v) {
      if (!isNum(v)) return "\u2014";
      if (v >= 1e12) return "$" + groupID(v / 1e12, true) + " T";
      if (v >= 1e9) return "$" + groupID(v / 1e9, true) + " M";
      if (v >= 1e6) return "$" + groupID(v / 1e6, true) + " jt";
      return "$" + groupID(v, false);
    },
    usdFull: function (v) { return isNum(v) ? "$" + groupID(v, false) : "\u2014"; },
    pct: function (v) { return isNum(v) ? groupID(v, true) + "%" : "\u2014"; },
    num: function (v) { return groupID(v, false); },
    num1: function (v) { return groupID(v, true); },
    mha: function (v) { return isNum(v) ? groupID(v, true) + " juta ha" : "\u2014"; },
    ha: function (v) { return isNum(v) ? groupID(v, false) + " ha" : "\u2014"; },
    ugm3: function (v) { return isNum(v) ? groupID(v, false) + " \u00b5g/m\u00b3" : "\u2014"; },
    aqi: function (v) { return isNum(v) ? groupID(v, false) : "\u2014"; },
    ratio: function (v) { return isNum(v) ? "$" + v.toFixed(8).replace(".", ",") : "\u2014"; },
    text: function (v) { return v == null ? "\u2014" : String(v); }
  };

  /* ---------- network ---------- */

  function fetchJSON(url) {
    if (typeof global.fetch !== "function") return Promise.reject(new Error("no fetch"));
    var ctrl = null, timer = null;
    try {
      ctrl = new global.AbortController();
      timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT);
    } catch (e) { ctrl = null; }
    var opts = { cache: "no-store", credentials: "omit" };
    if (ctrl) opts.signal = ctrl.signal;
    return global.fetch(url, opts).then(function (res) {
      if (timer) clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function fetchRetry(url) {
    var attempt = 0;
    function go() {
      return fetchJSON(url).catch(function (err) {
        if (attempt >= RETRY_DELAYS.length) throw err;
        var wait = RETRY_DELAYS[attempt++];
        return new Promise(function (resolve) {
          setTimeout(function () { resolve(go()); }, wait);
        });
      });
    }
    return go();
  }

  /* ---------- records ---------- */

  function makeRecord(id, label, value, display, unit, year, source, url, extra) {
    var rec = {
      id: id, label: label,
      value: isNum(value) ? value : null,
      display: display == null ? "\u2014" : display,
      unit: unit || "",
      year: year == null ? null : year,
      source: source || "",
      url: url || "",
      fetchedAt: now(),
      stale: false,
      fallback: false
    };
    if (extra) { for (var k in extra) { if (has(extra, k)) rec[k] = extra[k]; } }
    return rec;
  }

  function hydrateFromCache(id, ttl) {
    var c = cacheGet(id);
    if (!c) return false;
    c.stale = (now() - (c.fetchedAt || 0)) > ttl;
    records[id] = c;
    emit(id);
    return true;
  }

  function publish(id, rec) {
    rec.stale = false; rec.fallback = false;
    cacheSet(id, rec);
    lastFetch = now();
    return put(id, rec);
  }

  // `extra` keeps the record's shape (city, level, ...) even when the fetch failed,
  // so the markup can still render the card instead of reading undefined.
  function failSoft(id, label, unit, source, url, fbValue, fbYear, formatter, extra) {
    var cached = cacheGet(id);
    if (cached && cached.value != null) {
      cached.stale = true; cached.fallback = false;
      return put(id, cached);
    }
    var hasFb = fbValue != null;
    var rec = makeRecord(id, label,
      hasFb ? fbValue : null,
      hasFb ? formatter(fbValue) : "\u2014",
      unit, hasFb ? fbYear : null, source, url,
      extra || null);
    rec.stale = true;
    rec.fallback = hasFb;
    return put(id, rec);
  }

  /* ---------- World Bank ---------- */

  // [code, id, label, unit, formatter, fallback, fallbackYear]
  var WB_SERIES = [
    ["NY.GDP.MKTP.CD", "gdp", "PDB (harga berlaku)", "USD", FMT.usd, 1445642584163.81, 2025],
    ["NY.GDP.PCAP.CD", "gdp_pc", "PDB per kapita", "USD", FMT.usdFull, 5060, 2025],
    ["NY.GDP.MKTP.KD.ZG", "gdp_growth", "Pertumbuhan PDB", "%", FMT.pct, 5.0, 2025],
    ["FP.CPI.TOTL.ZG", "inflation", "Inflasi (CPI)", "%", FMT.pct, 1.9133, 2025],
    ["SP.POP.TOTL", "population", "Populasi", "jiwa", FMT.num, 285721236, 2025],
    ["SL.UEM.TOTL.ZS", "unemployment", "Pengangguran", "%", FMT.pct, 3.237, 2025],
    ["SI.POV.NAHC", "poverty", "Kemiskinan (nasional)", "%", FMT.pct, 8.5, 2025],
    ["NV.IND.MANF.ZS", "manufacturing", "Manufaktur / PDB", "%", FMT.pct, 19.0651, 2025],
    ["NE.EXP.GNFS.ZS", "exports", "Ekspor / PDB", "%", FMT.pct, 22.8465, 2025],
    ["BX.KLT.DINV.CD.WD", "fdi", "Investasi asing langsung", "USD", FMT.usd, 22698158405.27, 2025],
    ["SP.DYN.LE00.IN", "life_exp", "Harapan hidup", "tahun", FMT.num1, 71.288, 2024],
    ["SP.URB.TOTL.IN.ZS", "urban", "Penduduk urban", "%", FMT.pct, 59.3929, 2025],
    ["EG.ELC.ACCS.ZS", "electricity", "Akses listrik", "%", FMT.pct, 99.9, 2024],
    ["IT.NET.USER.ZS", "internet", "Pengguna internet", "%", FMT.pct, 72.7808, 2024],
    ["AG.LND.FRST.ZS", "forest", "Tutupan hutan", "% luas daratan", FMT.pct, 50.6697, 2024],
    ["EG.FEC.RNEW.ZS", "renewable", "Energi terbarukan", "% konsumsi", FMT.pct, 20.2, 2021],
    ["EN.GHG.CO2.MT.CE.AR5", "co2", "Emisi CO\u2082", "Mt CO\u2082e", FMT.num, 812.2042, 2024]
  ];

  function wbLatest(code) {
    var url = WB + code + "?format=json&per_page=10";
    return fetchRetry(url).then(function (d) {
      if (!Array.isArray(d) || !Array.isArray(d[1])) throw new Error("bad payload");
      for (var i = 0; i < d[1].length; i++) {
        var row = d[1][i];
        if (row && row.value !== null && row.value !== undefined) {
          return { value: Number(row.value), year: parseInt(row.date, 10), url: url };
        }
      }
      throw new Error("no value");
    });
  }

  function loadWB(e) {
    var code = e[0], id = e[1], label = e[2], unit = e[3], fmt = e[4];
    var url = WB + code + "?format=json&per_page=10";
    hydrateFromCache(id, TTL_ANNUAL);
    return wbLatest(code).then(function (r) {
      return publish(id, makeRecord(id, label, r.value, fmt(r.value), unit, r.year,
        "World Bank", r.url));
    }).catch(function () {
      return failSoft(id, label, unit, "World Bank", url, e[5], e[6], fmt);
    });
  }

  /* ---------- FX ---------- */

  function loadFX() {
    hydrateFromCache("fx_usdidr", TTL_LIVE);
    hydrateFromCache("fx_idrusd", TTL_LIVE);
    return fetchRetry(FX_URL).then(function (d) {
      if (!d || !d.rates || !d.rates.IDR) throw new Error("no rate");
      var rate = Number(d.rates.IDR);
      if (!isNum(rate) || rate <= 0) throw new Error("bad rate");
      var stamp = d.time_last_update_unix ? d.time_last_update_unix * 1000 : now();
      var yr = new Date(stamp).getUTCFullYear();
      publish("fx_usdidr", makeRecord("fx_usdidr", "Kurs USD \u2192 IDR", rate,
        FMT.idr(rate), "IDR", yr, "ExchangeRate-API", FX_URL, { asOf: stamp }));
      publish("fx_idrusd", makeRecord("fx_idrusd", "Kurs IDR \u2192 USD", 1 / rate,
        FMT.ratio(1 / rate), "USD", yr, "ExchangeRate-API", FX_URL, { asOf: stamp }));
      return records.fx_usdidr;
    }).catch(function () {
      failSoft("fx_usdidr", "Kurs USD \u2192 IDR", "IDR", "ExchangeRate-API", FX_URL,
        18089.5, 2026, FMT.idr);
      failSoft("fx_idrusd", "Kurs IDR \u2192 USD", "USD", "ExchangeRate-API", FX_URL,
        1 / 18089.5, 2026, FMT.ratio);
      return records.fx_usdidr;
    });
  }

  /* ---------- Air quality ---------- */

  // id suffix must match app.js: aq_palangka, not aq_palangka_raya.
  var AQ_CITIES = [
    ["palangka", "Palangka Raya", "Kalimantan Tengah", -2.21, 113.92],
    ["pekanbaru", "Pekanbaru", "Riau", 0.51, 101.45],
    ["pontianak", "Pontianak", "Kalimantan Barat", -0.02, 109.34],
    ["jambi", "Jambi", "Jambi", -1.61, 103.61],
    ["banjarmasin", "Banjarmasin", "Kalimantan Selatan", -3.32, 114.59],
    ["jakarta", "Jakarta", "DKI Jakarta", -6.21, 106.85]
  ];

  function aqLevel(aqi) {
    if (!isNum(aqi)) return { key: "na", label: "tidak tersedia" };
    if (aqi <= 50) return { key: "good", label: "Baik" };
    if (aqi <= 100) return { key: "mid", label: "Sedang" };
    if (aqi <= 150) return { key: "bad", label: "Tidak sehat (sensitif)" };
    if (aqi <= 200) return { key: "bad", label: "Tidak sehat" };
    if (aqi <= 300) return { key: "verybad", label: "Sangat tidak sehat" };
    return { key: "verybad", label: "Berbahaya" };
  }

  function loadAQ(city) {
    var id = "aq_" + city[0];
    var label = "Kualitas udara \u2014 " + city[1];
    var url = AQ_URL + "?latitude=" + city[3] + "&longitude=" + city[4] +
      "&current=pm2_5,pm10,us_aqi&timezone=Asia%2FJakarta";
    hydrateFromCache(id, TTL_LIVE);
    return fetchRetry(url).then(function (d) {
      var cur = d && d.current;
      if (!cur) throw new Error("no current");
      var aqi = isNum(cur.us_aqi) ? cur.us_aqi : null;
      var lvl = aqLevel(aqi);
      return publish(id, makeRecord(id, label, aqi, FMT.aqi(aqi), "US AQI",
        new Date().getUTCFullYear(), "Open-Meteo", url, {
          city: city[1], region: city[2],
          pm25: isNum(cur.pm2_5) ? cur.pm2_5 : null,
          pm10: isNum(cur.pm10) ? cur.pm10 : null,
          level: lvl.key, levelLabel: lvl.label,
          observed: cur.time || null
        }));
    }).catch(function () {
      var lvl = aqLevel(null);
      return failSoft(id, label, "US AQI", "Open-Meteo", url, null, null, FMT.aqi, {
        city: city[1], region: city[2], pm25: null, pm10: null,
        level: lvl.key, levelLabel: lvl.label, observed: null
      });
    });
  }

  /* ---------- static, audited ---------- */

  // [id, label, value, unit, display, year, source, url]. See DATA-AUDIT.md.
  var STATIC = [
    ["mangrove", "Hutan bakau", 3.40, "juta ha", "3,40 juta ha", 2025,
      "FAO (via Wikipedia, Mangrove)", "https://en.wikipedia.org/wiki/Mangrove"],
    ["peatland", "Lahan gambut (estimasi awal)", 16.5, "juta ha", "16,5\u201327 juta ha", 2023,
      "Wetlands International / KLHK (rentang 16,5\u201327 juta ha)",
      "https://en.wikipedia.org/wiki/Peat_swamp_forest"],
    ["protected_area", "Kawasan lindung", 27.0, "juta ha", "27 juta ha (554 kawasan)", 2023,
      "KLHK (via Wikipedia, Indonesia)", "https://en.wikipedia.org/wiki/Indonesia"],
    ["national_parks", "Taman nasional", 57, "kawasan", "57 kawasan", 2023,
      "KLHK (via Wikipedia, List of national parks of Indonesia)",
      "https://en.wikipedia.org/wiki/List_of_national_parks_of_Indonesia"],
    ["coral_species", "Spesies karang (Bird's Head)", 574, "spesies", "574 spesies", 2020,
      "Coral Triangle / Conservation International", "https://en.wikipedia.org/wiki/Coral_Triangle"],
    ["forest_1900", "Tutupan hutan 1900", 170, "juta ha", "170 juta ha (84% daratan)", 1900,
      "FAO (via Wikipedia, Deforestation in Indonesia)",
      "https://en.wikipedia.org/wiki/Deforestation_in_Indonesia"],
    ["forest_2000", "Tutupan hutan 2000", 99, "juta ha", "<100 juta ha", 2000,
      "FAO (via Wikipedia, Deforestation in Indonesia)",
      "https://en.wikipedia.org/wiki/Deforestation_in_Indonesia"]
  ];

  function loadStatic() {
    for (var i = 0; i < STATIC.length; i++) {
      var s = STATIC[i];
      put(s[0], makeRecord(s[0], s[1], s[2], s[4], s[3], s[5], s[6], s[7]));
    }
  }

  /* ---------- public API ---------- */

  function loadAll() {
    var jobs = [], i;
    for (i = 0; i < WB_SERIES.length; i++) jobs.push(loadWB(WB_SERIES[i]));
    jobs.push(loadFX());
    for (i = 0; i < AQ_CITIES.length; i++) jobs.push(loadAQ(AQ_CITIES[i]));
    return jobs;
  }

  function settleAll(jobs) {
    return Promise.all(jobs.map(function (p) { return p.then(null, null); }));
  }

  loadStatic();

  var BN = {
    ready: settleAll(loadAll()).then(function () { return true; }),
    records: records,

    on: function (id, fn) {
      if (typeof fn !== "function") return function () {};
      if (!subs[id]) subs[id] = [];
      subs[id].push(fn);
      if (records[id]) { try { fn(records[id]); } catch (e) {} }
      return function off() {
        var list = subs[id];
        if (!list) return;
        for (var i = list.length - 1; i >= 0; i--) {
          if (list[i] === fn) list.splice(i, 1);
        }
      };
    },

    onAny: function (fn) {
      if (typeof fn !== "function") return function () {};
      anySubs.push(fn);
      return function off() {
        for (var i = anySubs.length - 1; i >= 0; i--) {
          if (anySubs[i] === fn) anySubs.splice(i, 1);
        }
      };
    },

    refresh: function () {
      for (var k in records) { if (has(records, k)) safeDel(CACHE_PREFIX + k); }
      return settleAll(loadAll()).then(function () { return BN.status(); });
    },

    toCSV: function () {
      var cols = ["id", "label", "value", "unit", "year", "source", "fetchedAt"];
      function esc(v) {
        if (v == null) return "";
        var s = String(v);
        return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }
      var lines = [cols.join(",")];
      var ids = Object.keys(records).sort();
      for (var i = 0; i < ids.length; i++) {
        var r = records[ids[i]], row = [];
        for (var j = 0; j < cols.length; j++) row.push(esc(r[cols[j]]));
        lines.push(row.join(","));
      }
      return lines.join("\r\n");
    },

    status: function () {
      var live = 0, stale = 0, failed = 0;
      for (var k in records) {
        if (!has(records, k)) continue;
        var r = records[k];
        if (r.fallback || r.value == null) failed++;
        else if (r.stale) stale++;
        else live++;
      }
      return { live: live, stale: stale, failed: failed, lastFetch: lastFetch };
    },

    cities: AQ_CITIES,
    aqLevel: aqLevel,
    fmt: FMT,
    version: "2.0"
  };

  global.BN = BN;

})(typeof window !== "undefined" ? window : this);
