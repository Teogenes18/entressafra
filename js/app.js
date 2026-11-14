// Entry point: reads the form, loads NASA data, runs the analysis and asks render.js to draw it.
//
//   form ──► NASA POWER (power.js) ──► indicators.js ──► scoring.js ──► render.js / charts.js
//
// Data is fetched only when the location or period changes. Changing the crop, the
// season or the priorities re-runs the analysis instantly on the data already loaded.
import { fetchDaily, loadSnapshot, isNearSnapshot, SNAPSHOT } from './power.js';
import { computeIndicators, monthlyMeans, climateRisk } from './indicators.js';
import { buildStrategies, commonNotes, PRIORITIES, DEFAULT_WEIGHTS } from './scoring.js';
import { setLang, t, monthName, cropName, LANGS } from './i18n.js';
import {
  $, el, applyStaticText, setStatus, renderVerdict, renderClimate, renderCharts,
  renderPriorityLegend, renderStrategies, renderCommon,
} from './render.js';

const DEFAULTS = { lat: SNAPSHOT.lat, lon: SNAPSHOT.lon, crop: 'maize', startMonth: 2, endMonth: 5, years: 20 };

const state = {
  crops: [], // rows of data/crops.json
  series: null, // daily NASA data in memory
  source: null, // where that data came from: { kind: 'live' | 'snapshot', lat, lon, name? }
  dataKey: null, // location + period of the data in memory
  result: null, // last analysis, kept for redraws (language switch, resize)
};
let map = null;
let marker = null;

// ---------------------------------------------------------------- form

function readForm() {
  const endYear = new Date().getFullYear() - 1;
  const years = Math.min(30, Math.max(5, Math.round(Number($('years').value)) || DEFAULTS.years));
  const weights = {};
  for (const k of PRIORITIES) weights[k] = Number($(`w-${k}`).value);
  return {
    lat: Number($('lat').value),
    lon: Number($('lon').value),
    startYear: endYear - years + 1,
    endYear,
    season: { startMonth: Number($('startMonth').value), endMonth: Number($('endMonth').value) },
    cropId: $('current').value,
    weights,
  };
}

const dataKeyOf = (f) => [f.lat.toFixed(2), f.lon.toFixed(2), f.startYear, f.endYear].join('|');
const validCoords = (f) => f.lat >= -90 && f.lat <= 90 && f.lon >= -180 && f.lon <= 180;

function fillSelect(select, options, value) {
  select.replaceChildren(...options.map(([label, v]) => new Option(label, v)));
  select.value = value;
}

/** (Re)builds every control whose labels depend on the language, keeping current values. */
function buildControls() {
  const months = Array.from({ length: 12 }, (_, i) => [monthName(i + 1), String(i + 1)]);
  fillSelect($('startMonth'), months, $('startMonth').value || String(DEFAULTS.startMonth));
  fillSelect($('endMonth'), months, $('endMonth').value || String(DEFAULTS.endMonth));
  const crops = state.crops.map((c) => [cropName(c), c.id]);
  fillSelect($('current'), crops, $('current').value || DEFAULTS.crop);

  const box = $('weights');
  const values = Object.fromEntries(PRIORITIES.map((k) => [k, $(`w-${k}`)?.value ?? DEFAULT_WEIGHTS[k]]));
  box.replaceChildren();
  for (const k of PRIORITIES) {
    const label = el('label', 'weight');
    const head = el('span', 'weight-head');
    const output = el('output', null, String(values[k]));
    output.id = `o-${k}`;
    head.append(el('span', `swatch prio-${k}`), el('span', 'weight-name', t(`priority.${k}`)), output);
    const input = Object.assign(document.createElement('input'), { type: 'range', min: 0, max: 5, step: 1, value: values[k], id: `w-${k}` });
    input.addEventListener('input', () => { output.textContent = input.value; });
    label.append(head, el('span', 'weight-help', t(`priority.${k}.help`)), input);
    box.append(label);
  }
}

// ---------------------------------------------------------------- data + analysis

/**
 * Fetches NASA POWER data live. If the API fails near Cedro, falls back to the saved
 * NASA POWER response for Cedro, so a demo there never depends on the API being up.
 */
async function loadData(form) {
  setStatus(t('status.fetching'), 'busy');
  let fallbackReason = null;
  try {
    state.series = await fetchDaily(form);
    state.source = { kind: 'live', lat: form.lat, lon: form.lon };
  } catch (err) {
    if (!isNearSnapshot(form.lat, form.lon)) throw err;
    state.series = await loadSnapshot({ startYear: form.startYear, endYear: Math.min(form.endYear, SNAPSHOT.endYear) });
    state.source = { kind: 'snapshot', name: SNAPSHOT.name, lat: SNAPSHOT.lat, lon: SNAPSHOT.lon };
    fallbackReason = err.message;
  }
  state.dataKey = dataKeyOf(form);
  return { fallbackReason };
}

/** Runs the whole analysis on the data in memory and draws it. Returns false if the data is too thin. */
function analyse(form) {
  const indicators = computeIndicators(state.series, form.season);
  if (indicators.yearsUsed < 3) {
    setStatus(t('status.fewYears', { years: indicators.yearsUsed }), 'error');
    return false;
  }
  const riskInfo = climateRisk(indicators);
  const strategies = buildStrategies({
    crops: state.crops, currentId: form.cropId, weights: form.weights, riskInfo, indicators, season: form.season,
  });
  state.result = {
    indicators, riskInfo, strategies,
    common: commonNotes({ indicators, riskInfo }),
    monthly: monthlyMeans(state.series),
    season: form.season,
    source: state.source,
  };
  renderResults();
  return true;
}

function renderResults() {
  const r = state.result;
  if (!r) return;
  $('intro').hidden = true;
  $('results').hidden = false;
  renderVerdict(r.strategies, r.riskInfo);
  renderPriorityLegend();
  renderStrategies(r.strategies);
  renderCommon(r.common);
  renderClimate(r);
  renderCharts(r);
}

/** Scrolls to the results only if they are out of sight (on phones they sit below the form). */
function revealResults() {
  const top = $('results').getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.5) $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function doneMessage() {
  const { years } = state.result.indicators;
  return t('status.done', { years: years.length, from: years[0].year, to: years[years.length - 1].year });
}

async function compare() {
  const form = readForm();
  if (!validCoords(form)) return setStatus(t('status.badCoords'), 'error');
  $('run').disabled = true;
  try {
    let fallbackReason = null;
    if (dataKeyOf(form) !== state.dataKey) ({ fallbackReason } = await loadData(form));
    if (!analyse(form)) return;
    setStatus(fallbackReason ? t('status.fallback', { reason: fallbackReason }) : doneMessage(), fallbackReason ? 'warn' : 'ok');
    revealResults();
  } catch (err) {
    setStatus(`${t('status.error', { reason: err.message })} ${t('status.errorHint')}`, 'error');
  } finally {
    $('run').disabled = false;
  }
}

/** Crop, season or priority changed: re-rank at once using the data already loaded. */
function onQuickChange() {
  if (!state.series) return;
  const form = readForm();
  if (dataKeyOf(form) !== state.dataKey) return setStatus(t('status.stale'), 'warn');
  if (analyse(form)) setStatus(t('status.updated'), 'ok');
}

function onDataChange() {
  if (state.series && dataKeyOf(readForm()) !== state.dataKey) setStatus(t('status.stale'), 'warn');
}

// ---------------------------------------------------------------- map + location

function setPoint(lat, lon) {
  $('lat').value = lat.toFixed(2);
  $('lon').value = lon.toFixed(2);
  if (marker) marker.setLatLng([lat, lon]);
  if (map) map.panTo([lat, lon]);
  onDataChange();
}

function initMap() {
  if (typeof L === 'undefined') {
    $('map').textContent = t('step1.noMap');
    return;
  }
  // Wheel zoom stays off until the map is clicked, so scrolling the page never zooms the map by accident.
  map = L.map('map', { scrollWheelZoom: false }).setView([DEFAULTS.lat, DEFAULTS.lon], 7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
  }).addTo(map);
  marker = L.marker([DEFAULTS.lat, DEFAULTS.lon]).addTo(map);
  map.on('click', (e) => {
    map.scrollWheelZoom.enable();
    setPoint(e.latlng.lat, e.latlng.lng);
  });
  map.on('mouseout', () => map.scrollWheelZoom.disable());

  let hintTimer;
  $('map').addEventListener('wheel', () => {
    if (map.scrollWheelZoom.enabled()) return;
    $('map-hint').hidden = false;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { $('map-hint').hidden = true; }, 1600);
  }, { passive: true });
}

function locate() {
  if (!navigator.geolocation) return setStatus(t('status.noLocation'), 'error');
  setStatus(t('status.locating'), 'busy');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setPoint(pos.coords.latitude, pos.coords.longitude);
      if (map) map.setZoom(10);
      setStatus('');
    },
    () => setStatus(t('status.noLocation'), 'error'),
    { timeout: 15000 },
  );
}

// ---------------------------------------------------------------- language

function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem('entressafra-lang');
    if (LANGS.includes(saved)) return saved;
  } catch { /* storage can be blocked; fall through */ }
  return (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function switchLang(lang) {
  setLang(lang);
  try { localStorage.setItem('entressafra-lang', lang); } catch { /* not essential */ }
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  applyStaticText();
  if (state.crops.length) buildControls();
  renderResults();
}

// ---------------------------------------------------------------- start

async function init() {
  switchLang(initialLang());
  try {
    const res = await fetch('data/crops.json');
    state.crops = (await res.json()).crops;
  } catch {
    setStatus(t('status.noCrops'), 'error');
    return;
  }
  buildControls();
  $('lat').value = DEFAULTS.lat.toFixed(2);
  $('lon').value = DEFAULTS.lon.toFixed(2);
  $('years').value = String(DEFAULTS.years);
  initMap();

  $('run').addEventListener('click', () => compare());
  $('locate').addEventListener('click', locate);
  for (const b of document.querySelectorAll('[data-lang]')) b.addEventListener('click', () => switchLang(b.dataset.lang));
  for (const id of ['current', 'startMonth', 'endMonth']) $(id).addEventListener('change', onQuickChange);
  $('weights').addEventListener('input', onQuickChange); // live re-ranking while a slider moves
  for (const id of ['lat', 'lon']) {
    $(id).addEventListener('change', () => {
      const lat = Number($('lat').value);
      const lon = Number($('lon').value);
      if (validCoords({ lat, lon })) setPoint(lat, lon);
    });
  }
  $('years').addEventListener('change', onDataChange);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => state.result && renderCharts(state.result), 200);
  });
}

init();
