/* ===== LOU SOLEU — interactions partagées ===== */
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===== Ambiance selon le moment de la journée ===== */
var MOOD_KEY = 'lousoleu-mood';
var MOOD_CYCLE = ['auto', 'aube', 'jour', 'crepuscule', 'nuit'];
var MOOD_LABEL = { aube: 'Aube', jour: 'Jour', crepuscule: 'Crépuscule', nuit: 'Nuit' };
var MOOD_ICONS = {
  aube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="12" y1="9" x2="12" y2="3"/><polyline points="9.5 5.5 12 3 14.5 5.5"/><line x1="5" y1="9" x2="4" y2="8"/><line x1="19" y1="9" x2="20" y2="8"/></svg>',
  jour: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  crepuscule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="12" y1="3" x2="12" y2="9"/><polyline points="9.5 6.5 12 9 14.5 6.5"/><line x1="5" y1="9" x2="4" y2="8"/><line x1="19" y1="9" x2="20" y2="8"/></svg>',
  nuit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>'
};
function moodFromHour(h) {
  if (h >= 6 && h < 9) return 'aube';
  if (h >= 9 && h < 17) return 'jour';
  if (h >= 17 && h < 20) return 'crepuscule';
  return 'nuit';
}
var moodPref;                                   // source de vérité en mémoire (robuste hors localStorage)
try { moodPref = localStorage.getItem(MOOD_KEY) || 'auto'; } catch (e) { moodPref = 'auto'; }
if (MOOD_CYCLE.indexOf(moodPref) === -1) moodPref = 'auto';
function getMoodPref() { return moodPref; }
function setMoodPref(p) { moodPref = p; try { localStorage.setItem(MOOD_KEY, p); } catch (e) {} }
function resolveMood(pref) { return (pref && pref !== 'auto') ? pref : moodFromHour(new Date().getHours()); }
function applyMoodPref(pref) { document.documentElement.setAttribute('data-mood', resolveMood(pref)); }
/* applique immédiatement (avant le rendu du body) pour éviter tout flash */
applyMoodPref(moodPref);

function initMoodSwitcher() {
  var navCta = document.querySelector('.nav-cta');
  if (!navCta) return;
  var btn = document.createElement('button');
  btn.className = 'mood-switch';
  btn.type = 'button';
  navCta.insertBefore(btn, navCta.firstChild);

  function render() {
    var pref = getMoodPref(), m = resolveMood(pref);
    btn.innerHTML = MOOD_ICONS[m] + (pref === 'auto' ? '<span class="auto-dot"></span>' : '');
    var t = 'Ambiance : ' + MOOD_LABEL[m] + (pref === 'auto' ? ' · auto' : '') + ' — clic pour changer';
    btn.title = t; btn.setAttribute('aria-label', t);
  }
  render();
  btn.addEventListener('click', function () {
    var next = MOOD_CYCLE[(MOOD_CYCLE.indexOf(getMoodPref()) + 1) % MOOD_CYCLE.length];
    setMoodPref(next);
    applyMoodPref(next); render();
  });
  /* en mode auto : réévalue périodiquement (changement de créneau horaire) */
  setInterval(function () { if (getMoodPref() === 'auto') { applyMoodPref('auto'); render(); } }, 300000);
}

document.addEventListener('DOMContentLoaded', function () {

  initMoodSwitcher();


  /* Mobile drawer */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  if (burger && drawer) {
    burger.addEventListener('click', function () { drawer.classList.add('open'); });
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.classList.contains('drawer-close')) drawer.classList.remove('open');
    });
  }

  /* FAQ accordions */
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () { q.parentElement.classList.toggle('open'); });
  });

  /* Reveal on scroll — avec stagger par groupe (mêmes parents) */
  document.querySelectorAll('.reveal').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList && c.classList.contains('reveal');
    });
    var idx = sibs.indexOf(el);
    if (idx > 0 && !REDUCED) el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
  });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });

  /* Header condensé au scroll */
  var nav = document.querySelector('header.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Parallaxe douce du contenu du hero */
  var heroWrap = document.querySelector('.hero .wrap');
  if (heroWrap && !REDUCED) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < 700) {
          heroWrap.style.transform = 'translateY(' + (y * 0.18) + 'px)';
          heroWrap.style.opacity = Math.max(0, 1 - y / 620);
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* Compteurs animés (bandeaux .stats) */
  initCounters();

  /* Year */
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Contact form (demo, no backend) */
  var cf = document.getElementById('contact-form');
  if (cf) {
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.getElementById('form-success');
      if (ok) { ok.style.display = 'block'; cf.reset(); ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  if (document.getElementById('roiChart')) initSimulateur();
  if (document.getElementById('dailyChart')) initDailyChart('dailyChart');
  if (document.getElementById('roiStaticChart')) initRoiStaticChart('roiStaticChart');
});

/* ===== Compteurs animés ===== */
function initCounters() {
  var nums = document.querySelectorAll('.stats .stat .n');
  if (!nums.length) return;

  function animate(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/[\d \s.,]*\d/);          // bloc numérique (gère 1 550, 100, 06…)
    if (!m) return;
    var numStr = m[0];
    var clean = numStr.replace(/[ \s.,]/g, '');
    var target = parseInt(clean, 10);
    if (isNaN(target)) return;
    var pad = /^0\d/.test(clean);                    // conserve "06"
    var grouped = /[ \s]/.test(numStr);         // séparateur de milliers
    var prefix = raw.slice(0, m.index);
    var suffix = raw.slice(m.index + numStr.length);

    if (REDUCED) { return; }                         // garde la valeur d'origine
    var start = null, dur = 1400;
    function fmt(v) {
      var s = grouped ? v.toLocaleString('fr-FR') : String(v);
      if (pad && v < 10) s = '0' + s;
      return prefix + s + suffix;
    }
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);            // ease-out cubic
      el.textContent = fmt(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var cobs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { animate(en.target); cobs.unobserve(en.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach(function (n) { cobs.observe(n); });
}

/* ===== Palette « Solaire lumineux » pour les graphiques ===== */
var TH = { mustard:'#E6A100', mustardBright:'#FFC107', terra:'#F43F5E', sage:'#16A34A',
           choco:'#0B1B3A', beige:'#06B6D4', muted:'#5A6B85', line:'#E2E8F2' };

/* ============== Graphique journalier production / consommation ============== */
function initDailyChart(id) {
  if (typeof Chart === 'undefined') return;
  var ctx = document.getElementById(id).getContext('2d');
  var hours = ['0h','2h','4h','6h','8h','10h','12h','14h','16h','18h','20h','22h','24h'];
  var prod  = [0,0,0,8,32,68,92,86,58,24,3,0,0];
  var conso = [22,18,16,20,30,26,24,25,28,40,46,34,24];
  var auto  = prod.map(function (p, i) { return Math.min(p, conso[i]); });
  var gP = ctx.createLinearGradient(0,0,0,320); gP.addColorStop(0,'rgba(255,193,7,.36)'); gP.addColorStop(1,'rgba(255,193,7,0)');
  var gA = ctx.createLinearGradient(0,0,0,320); gA.addColorStop(0,'rgba(22,163,74,.42)'); gA.addColorStop(1,'rgba(22,163,74,.04)');
  new Chart(ctx, {
    type: 'line',
    data: { labels: hours, datasets: [
      { label:'Production solaire', data:prod, borderColor:TH.mustardBright, backgroundColor:gP, fill:true, tension:.45, borderWidth:3, pointRadius:0 },
      { label:'Consommation', data:conso, borderColor:TH.choco, backgroundColor:'transparent', fill:false, tension:.4, borderWidth:3, pointRadius:0, borderDash:[6,4] },
      { label:'Autoconsommée', data:auto, borderColor:TH.sage, backgroundColor:gA, fill:true, tension:.45, borderWidth:2, pointRadius:0 }
    ]},
    options: { responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
      plugins:{ legend:{ labels:{ usePointStyle:true, boxWidth:8, font:{family:'Inter'} } },
        tooltip:{ callbacks:{ label:function(c){ return c.dataset.label+' : '+c.parsed.y+' %'; } } } },
      scales:{ x:{ grid:{display:false}, ticks:{font:{family:'Inter'},maxTicksLimit:7} },
        y:{ border:{display:false}, ticks:{ callback:function(v){return v+' %';}, font:{family:'Inter'} }, grid:{color:'rgba(74,64,58,.06)'} } } }
  });
}

/* ============== Graphique statique de trésorerie (rentabilité) ============== */
function initRoiStaticChart(id) {
  if (typeof Chart === 'undefined') return;
  var ctx = document.getElementById(id).getContext('2d');
  var years = [], cumul = [], invest = [];
  var capex = 14000, gain = 1500, infl = 1.045;
  var c = -capex, g = gain;
  for (var y = 0; y <= 25; y++) {
    years.push('An ' + y);
    invest.push(0);
    cumul.push(Math.round(c));
    c += g; g *= infl;
  }
  var grad = ctx.createLinearGradient(0,0,0,340); grad.addColorStop(0,'rgba(22,163,74,.30)'); grad.addColorStop(1,'rgba(22,163,74,0)');
  new Chart(ctx, {
    type: 'line',
    data: { labels: years, datasets: [
      { label:'Trésorerie cumulée', data:cumul, borderColor:TH.sage, backgroundColor:grad, fill:true, tension:.35, borderWidth:4, pointRadius:0 },
      { label:'Seuil de rentabilité', data:invest, borderColor:TH.terra, borderDash:[6,6], borderWidth:2, pointRadius:0, fill:false }
    ]},
    options: { responsive:true, maintainAspectRatio:false, interaction:{mode:'index',intersect:false},
      plugins:{ legend:{ labels:{ usePointStyle:true, boxWidth:8, font:{family:'Inter'} } },
        tooltip:{ callbacks:{ label:function(c){ return c.dataset.label+' : '+Math.round(c.parsed.y).toLocaleString('fr-FR')+' €'; } } } },
      scales:{ x:{ grid:{display:false}, ticks:{font:{family:'Inter'},maxTicksLimit:9} },
        y:{ border:{display:false}, ticks:{ callback:function(v){return (v/1000)+'k€';}, font:{family:'Inter'} }, grid:{color:'rgba(74,64,58,.06)'} } } }
  });
}

/* ============== SIMULATEUR ROI (logique kWh) ============== */
function initSimulateur() {
  var chartInstance = null;
  var euros = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
  var $ = function (id) { return document.getElementById(id); };

  function run() {
    var conso = +$('conso-annuelle').value;
    var orientation = +$('orientation').value;
    var autoconsoRate = +$('autoconso').value / 100;
    var avecBatterie = $('batterie') ? $('batterie').checked : false;

    $('val-conso-annuelle').innerText = conso.toLocaleString('fr-FR');
    $('val-autoconso').innerText = Math.round(autoconsoRate * 100);

    /* Dimensionnement : ~ couvrir la conso, capé entre 3 et 12 kWc (villa) */
    var kwc = Math.max(3, Math.min(12, Math.round((conso / 1300) * 2) / 2));
    if ($('surface-toit')) {
      var surf = +$('surface-toit').value;
      $('val-surface').innerText = surf;
      kwc = Math.min(kwc, parseFloat((surf * 0.21).toFixed(1)));
    }
    if ($('val-kwc')) $('val-kwc').innerText = kwc.toFixed(1);

    var irradiation = 1550;                  // PACA / 06, kWh/kWc/an
    var prodAn1 = kwc * irradiation * orientation * 0.86;

    /* CAPEX premium (micro-onduleurs APsystems) + batterie option */
    var prixWc = 2.05;                        // €/Wc clé en main premium
    var capex = kwc * 1000 * prixWc;
    var batterieKwh = 0, capexBatterie = 0;
    if (avecBatterie) {
      batterieKwh = Math.round(Math.min(15, Math.max(5, conso / 1100)));
      capexBatterie = batterieKwh * 750;
      capex += capexBatterie;
    }

    var inflation = 0.05;                     // hausse élec moyenne
    var degradation = 0.005;
    var prixKwh = 0.2516;
    var prixRevente = 0.011;                  // 1,1 c€/kWh — arrêté S21 (juin 2026)

    var autoBoost = avecBatterie ? Math.min(1, autoconsoRate + 0.30) : autoconsoRate;

    var cumul = 0, payback = 0, prod = prodAn1, gain1 = 0, data = [];
    var prix = prixKwh;
    for (var an = 1; an <= 25; an++) {
      var auto = Math.min(prod * autoBoost, conso);
      var surplus = prod - auto;
      var eco = auto * prix + surplus * prixRevente;
      if (an === 1) gain1 = eco;
      cumul += eco;
      data.push(Math.round(cumul));
      if (cumul >= capex && payback === 0) payback = an - 1 + ((capex - (cumul - eco)) / eco);
      prod *= (1 - degradation);
      prix *= (1 + inflation);
    }
    var benefice = cumul - capex;

    $('res-capex').innerText = euros(capex);
    $('res-gain1').innerText = euros(gain1);
    $('res-benef').innerText = (benefice > 0 ? '+' : '') + euros(benefice);
    $('res-payback').innerText = payback > 0 ? payback.toFixed(1) + ' ans' : '> 25 ans';
    if ($('res-kwc')) $('res-kwc').innerText = kwc.toFixed(1) + ' kWc';
    if ($('res-batterie')) $('res-batterie').innerText = avecBatterie ? batterieKwh + ' kWh' : '—';
    if ($('res-prod')) $('res-prod').innerText = Math.round(prodAn1).toLocaleString('fr-FR') + ' kWh';

    drawChart(data, capex);
  }

  function drawChart(data, capex) {
    if (typeof Chart === 'undefined') return;
    var ctx = document.getElementById('roiChart').getContext('2d');
    var labels = Array.from({ length: 25 }, function (_, i) { return 'An ' + (i + 1); });
    if (chartInstance) chartInstance.destroy();
    var grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, 'rgba(22,163,74,.30)');
    grad.addColorStop(1, 'rgba(22,163,74,0)');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Trésorerie cumulée', data: data, borderColor: '#16A34A', backgroundColor: grad, fill: true, tension: .4, borderWidth: 3, pointRadius: 0 },
          { label: 'Investissement', data: Array(25).fill(Math.round(capex)), borderColor: '#F43F5E', borderDash: [6, 6], borderWidth: 2, pointRadius: 0, fill: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter' } } },
          tooltip: { callbacks: { label: function (c) { return c.dataset.label + ' : ' + euros(c.parsed.y); } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 9, font: { family: 'Inter' } } },
          y: { border: { display: false }, ticks: { callback: function (v) { return (v / 1000) + 'k€'; }, font: { family: 'Inter' } } }
        }
      }
    });
  }

  ['conso-annuelle', 'autoconso', 'orientation', 'batterie', 'surface-toit'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('input', run);
    if (el && el.tagName === 'SELECT') el.addEventListener('change', run);
  });
  setTimeout(run, 80);
}
