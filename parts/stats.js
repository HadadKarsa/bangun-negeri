
(function(){
  "use strict";

  var WB = "https://api.worldbank.org/v2/country/IDN/indicator/";
  var FX = "https://open.er-api.com/v6/latest/USD";
  var TIMEOUT = 12000;

  // Fallback values (verified 2026-11-11) so the page never shows blanks.
  var FALLBACK = {
    fx: 18089.5, fxTime: "cache",
    gdp: 1445642584163.81, gdpYear: 2025,
    inf: 1.9133, infYear: 2025,
    pop: 285721236, popYear: 2025,
    unemp: 3.237, unempYear: 2025,
    pov: 8.5, povYear: 2025,
    man: 19.0651, manYear: 2025,
    exp: 22.8465, expYear: 2025,
    fdi: 22698158405.27, fdiYear: 2025
  };

  function $(id){ return document.getElementById(id); }

  function fetchJSON(url){
    var ctrl = new AbortController();
    var t = setTimeout(function(){ ctrl.abort(); }, TIMEOUT);
    return fetch(url, {signal: ctrl.signal, cache: "no-store"})
      .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .finally(function(){ clearTimeout(t); });
  }

  function wbLatest(indicator){
    return fetchJSON(WB + indicator + "?format=json&per_page=10")
      .then(function(d){
        if(!Array.isArray(d) || !Array.isArray(d[1])) throw new Error("bad payload");
        for(var i=0;i<d[1].length;i++){
          if(d[1][i] && d[1][i].value !== null) return {value: d[1][i].value, year: parseInt(d[1][i].date,10)};
        }
        throw new Error("no value");
      });
  }

  var nfID = new Intl.NumberFormat("id-ID");
  var nfUS = new Intl.NumberFormat("en-US", {maximumFractionDigits:0});

  function fmtPct(v){ return (Math.round(v*100)/100).toLocaleString("id-ID") + "%"; }
  function fmtUSD(v){
    if(v >= 1e12) return "$" + (v/1e12).toFixed(2).replace(".",",") + " T";
    if(v >= 1e9)  return "$" + (v/1e9).toFixed(2).replace(".",",") + " M";
    return "$" + nfUS.format(v);
  }
  function fmtRupiah(v){ return "Rp " + nfID.format(Math.round(v)); }

  function setText(id, txt){ var el = $(id); if(el) el.textContent = txt; }
  function setHTML(id, html){ var el = $(id); if(el) el.innerHTML = html; }

  function fill(id, html){ setHTML(id, html); }

  // ---------- FX ----------
  var fxPromise = fetchJSON(FX).then(function(d){
    if(!d || !d.rates || !d.rates.IDR) throw new Error("no rate");
    var rate = d.rates.IDR;
    fill("fxValue", fmtRupiah(rate));
    fill("fxInvValue", "$" + (1/rate).toFixed(8));
    setText("fxTime", d.time_last_update_utc || "—");
    if(d.time_last_update_unix){ $("fxTime").dataset.ts = String(d.time_last_update_unix*1000); }
    else { delete $("fxTime").dataset.ts; }
    $("fxTag").className = "tag ok"; setText("fxTag","live");
    return {rate: rate, time: d.time_last_update_utc};
  }).catch(function(){
    fill("fxValue", fmtRupiah(FALLBACK.fx));
    fill("fxInvValue", "$" + (1/FALLBACK.fx).toFixed(8));
    setText("fxTime", "nilai cadangan (API tidak terjangkau)");
    delete $("fxTime").dataset.ts;
    $("fxTag").className = "tag err"; setText("fxTag","cache");
    return {rate: FALLBACK.fx, time: "cache"};
  });

  // ---------- World Bank ----------
  function bindSimple(key, indicator, valueId, yearId, formatter){
    return wbLatest(indicator).then(function(r){
      fill(valueId, formatter(r.value));
      setText(yearId, r.year);
      return r;
    }).catch(function(){
      fill(valueId, formatter(FALLBACK[key]));
      setText(yearId, FALLBACK[key + "Year"] + " (cadangan)");
      return {value: FALLBACK[key], year: FALLBACK[key + "Year"], fallback: true};
    });
  }

  var gdpP = bindSimple("gdp","NY.GDP.MKTP.CD","gdpValue","gdpYear", fmtUSD);
  var infP = bindSimple("inf","FP.CPI.TOTL.ZG","infValue","infYear", fmtPct);
  var popP = bindSimple("pop","SP.POP.TOTL","popValue","popYear", function(v){ return nfID.format(v) + " <span class='unit'>jiwa</span>"; });
  var unmP = bindSimple("unemp","SL.UEM.TOTL.ZS","unempValue","unempYear", fmtPct);
  var povP = bindSimple("pov","SI.POV.NAHC","povValue","povYear", fmtPct);
  var manP = bindSimple("man","NV.IND.MANF.ZS","manValue","manYear", fmtPct);
  var expP = bindSimple("exp","NE.EXP.GNFS.ZS","expValue","expYear", fmtPct);
  var fdiP = bindSimple("fdi","BX.KLT.DINV.CD.WD","fdiValue","fdiYear", fmtUSD);

  // ---------- table + ticker ----------
  Promise.all([fxPromise, gdpP, infP, popP, unmP, povP, manP, expP, fdiP]).then(function(res){
    var fx = res[0], gdp = res[1], inf = res[2], pop = res[3], unm = res[4], pov = res[5], man = res[6], exp = res[7], fdi = res[8];

    var rows = [
      ["Kurs USD → IDR", fmtRupiah(fx.rate), "harian", "ExchangeRate-API"],
      ["PDB nominal", fmtUSD(gdp.value), gdp.year, "World Bank"],
      ["Inflasi (CPI)", fmtPct(inf.value), inf.year, "World Bank"],
      ["Populasi", nfID.format(pop.value) + " jiwa", pop.year, "World Bank"],
      ["Pengangguran", fmtPct(unm.value), unm.year, "World Bank"],
      ["Kemiskinan nasional", fmtPct(pov.value), pov.year, "World Bank"],
      ["Manufaktur / PDB", fmtPct(man.value), man.year, "World Bank"],
      ["Ekspor / PDB", fmtPct(exp.value), exp.year, "World Bank"],
      ["Investasi asing langsung", fmtUSD(fdi.value), fdi.year, "World Bank"]
    ];
    $("tableBody").innerHTML = rows.map(function(r){
      return "<tr><td>" + r[0] + "</td><td class='num'>" + r[1] + "</td><td>" + r[2] + "</td><td><span class='src'>" + r[3] + "</span></td></tr>";
    }).join("");

    var anyFallback = [gdp,inf,pop,unm,pov,man,exp,fdi].some(function(x){ return x.fallback; });
    var st = $("globalStatus");
    if(anyFallback){ st.className = "tag warn"; st.textContent = "sebagian cadangan"; }
    else { st.className = "tag ok"; st.textContent = "semua live"; }

    var items = [
      "USD/IDR <b>" + fmtRupiah(fx.rate) + "</b>",
      "PDB <b>" + fmtUSD(gdp.value) + "</b>",
      "Inflasi <b>" + fmtPct(inf.value) + "</b>",
      "Populasi <b>" + nfID.format(pop.value) + "</b>",
      "Pengangguran <b>" + fmtPct(unm.value) + "</b>",
      "Kemiskinan <b>" + fmtPct(pov.value) + "</b>"
    ];
    var line = items.map(function(x){ return "<span>" + x + "</span>"; }).join("");
    $("tickerTrack").innerHTML = line + line;

    setText("lastRefresh", new Date().toLocaleString("id-ID", {dateStyle:"medium", timeStyle:"short"}));
  });

  // ---------- nav ----------
  var toggle = $("navToggle"), nav = $("mainNav");
  toggle.addEventListener("click", function(){
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function(e){
    if(e.target.tagName === "A"){ nav.classList.remove("open"); toggle.setAttribute("aria-expanded","false"); }
  });

  setText("footYear", new Date().getFullYear());
})();


/* ---- */


(function(){
  function label(ms){
    var h=Math.floor((Date.now()-ms)/3600000);
    if(h<1) return "\u00b7 baru saja diperbarui";
    if(h<24) return "\u00b7 diperbarui "+h+" jam lalu";
    return "\u00b7 diperbarui "+Math.floor(h/24)+" hari lalu";
  }
  function run(){
    var t=document.getElementById("fxTime");
    if(!t) return;
    var prev=t.querySelector(".fresh");
    if(prev) prev.remove();
    var ms = t.dataset.ts ? Number(t.dataset.ts) : Date.parse((t.textContent||"").trim());
    if(isNaN(ms)||ms<=0) return;
    var stale=(Date.now()-ms)>172800000;
    var s=document.createElement("span");
    s.className="fresh"+(stale?" stale":"");
    s.setAttribute("role","status");
    s.textContent=" "+label(ms);
    t.appendChild(s);
  }
  var n=0,iv=setInterval(function(){ run(); if(++n>8) clearInterval(iv); },2500);
  run();
})();
