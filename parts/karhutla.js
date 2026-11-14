
(function(){
  "use strict";
  var CITIES = [
    {name:"Palangka Raya", region:"Kalimantan Tengah", lat:-2.21, lon:113.92},
    {name:"Pekanbaru",     region:"Riau",              lat:0.51,  lon:101.45},
    {name:"Pontianak",     region:"Kalimantan Barat",  lat:-0.02, lon:109.34},
    {name:"Jambi",         region:"Jambi",             lat:-1.61, lon:103.61},
    {name:"Banjarmasin",   region:"Kalimantan Selatan",lat:-3.32, lon:114.59},
    {name:"Jakarta",       region:"DKI Jakarta",       lat:-6.21, lon:106.85}
  ];

  function level(v){
    if (v == null) return {cls:"lv-mid", txt:"tidak tersedia"};
    if (v <= 12) return {cls:"lv-good", txt:"baik"};
    if (v <= 35) return {cls:"lv-mid",  txt:"sedang"};
    if (v <= 55) return {cls:"lv-bad",  txt:"tidak sehat (sensitif)"};
    if (v <= 150) return {cls:"lv-bad", txt:"tidak sehat"};
    return {cls:"lv-verybad", txt:"berbahaya"};
  }

  function card(c, data){
    var pm = data && data.pm2_5 != null ? data.pm2_5 : null;
    var lv = level(pm);
    var el = document.createElement("div");
    el.className = "aq-card";
    el.setAttribute("role","listitem");
    el.innerHTML =
      '<div class="aq-city">' + c.name + '</div>' +
      '<div class="aq-region">' + c.region + '</div>' +
      '<div class="aq-val">' + (pm != null ? pm.toFixed(1) : "—") +
        '<span class="aq-unit">µg/m³</span></div>' +
      '<div class="aq-label ' + lv.cls + '">' + lv.txt + '</div>';
    return el;
  }

  function loadAir(){
    var grid = document.getElementById("aqGrid");
    if (!grid) return;
    var done = 0, results = {};
    CITIES.forEach(function(c){
      var url = "https://air-quality-api.open-meteo.com/v1/air-quality" +
                "?latitude=" + c.lat + "&longitude=" + c.lon +
                "&current=pm2_5,pm10,us_aqi&timezone=Asia%2FJakarta";
      var ctrl = new AbortController();
      var t = setTimeout(function(){ ctrl.abort(); }, 12000);
      fetch(url, {signal: ctrl.signal})
        .then(function(r){ if(!r.ok) throw new Error("http "+r.status); return r.json(); })
        .then(function(d){ results[c.name] = (d && d.current) || null; })
        .catch(function(){ results[c.name] = null; })
        .then(function(){
          clearTimeout(t);
          if (++done === CITIES.length) render(results);
        });
    });
  }

  function render(results){
    var grid = document.getElementById("aqGrid");
    if (!grid) return;
    grid.textContent = "";
    CITIES.forEach(function(c){ grid.appendChild(card(c, results[c.name])); });
  }

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

  function renderProv(){
    var tb = document.getElementById("provBody");
    if (!tb) return;
    var max = PROV[0][1];
    tb.textContent = "";
    PROV.forEach(function(row, i){
      var pct = Math.max(2, (row[1] / max) * 100);
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (i+1) + "</td>" +
        "<td>" + row[0] + "</td>" +
        "<td>" + row[1].toLocaleString("id-ID", {minimumFractionDigits:2, maximumFractionDigits:2}) + "</td>" +
        '<td class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:' + pct.toFixed(1) + '%"></div></div></td>';
      tb.appendChild(tr);
    });
  }

  renderProv();
  loadAir();
})();
