// Builds the page sections from computed results. No calculations happen here:
// every number comes from js/indicators.js or js/scoring.js.
//
// Layout rule: show what differs between options up front, put the rest one click away
// (<details>), and show what is the same for every option only once.
import { t, tm, monthName, cropName, getLang, scaleWord, familyName } from './i18n.js';
import { riskLevel, dryWindow, isInSeason, CONFIG } from './indicators.js';
import { PRIORITIES } from './scoring.js';
import { seasonYearsChart, monthlyChart, extremes } from './charts.js';

export const $ = (id) => document.getElementById(id);

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Fills every element marked data-i18n="key" (text) or data-i18n-aria="key" (aria-label). */
export function applyStaticText(root = document) {
  for (const node of root.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of root.querySelectorAll('[data-i18n-aria]')) node.setAttribute('aria-label', t(node.dataset.i18nAria));
  document.title = t('meta.title');
}

export function setStatus(message, kind = 'info') {
  const box = $('status');
  box.textContent = message;
  box.dataset.kind = kind;
}

const pct = (x) => Math.round(x * 100);
const locale = () => (getLang() === 'pt' ? 'pt-BR' : 'en');
const seasonLabelOf = (season) => (year) =>
  season.startMonth > season.endMonth ? `${year}/${String(year + 1).slice(2)}` : String(year);

function table(headers, rows) {
  const tableEl = el('table');
  const head = el('tr');
  headers.forEach((h) => head.append(el('th', null, h)));
  tableEl.append(el('thead'), el('tbody'));
  tableEl.tHead.append(head);
  for (const row of rows) {
    const tr = el('tr');
    row.forEach((cell) => tr.append(el('td', null, String(cell))));
    tableEl.tBodies[0].append(tr);
  }
  return tableEl;
}

function disclosure(summary, ...content) {
  const details = el('details', 'disclosure');
  details.append(el('summary', null, summary), ...content);
  return details;
}

function list(className, items) {
  const ul = el('ul', className);
  items.forEach((text) => ul.append(el('li', null, text)));
  return ul;
}

// ---------------------------------------------------------------- verdict

export function renderVerdict(strategies, riskInfo) {
  const best = strategies[0];
  const current = strategies.find((s) => s.isCurrent);
  const level = riskLevel(riskInfo.risk);
  const box = $('verdict');
  box.dataset.level = level;

  const headline = best.isCurrent
    ? t('verdict.keep', { current: cropName(current.crop) })
    : t('verdict.switch', { best: cropName(best.crop), current: cropName(current.crop) });
  const detail = [t('verdict.risk', { level: t(`risk.level.${level}`) })];
  if (!best.isCurrent) detail.unshift(t('verdict.scores', { best: pct(best.score), current: pct(current.score) }));

  box.replaceChildren(
    el('p', 'verdict-headline', headline),
    el('p', 'verdict-detail', detail.join(' ')),
    el('p', 'verdict-note', t('verdict.disclaimer')),
  );
}

// ---------------------------------------------------------------- strategies

export function renderPriorityLegend() {
  const legend = $('priority-legend');
  legend.replaceChildren();
  for (const k of PRIORITIES) {
    const item = el('li');
    item.append(el('span', `swatch prio-${k}`), document.createTextNode(t(`priority.${k}`)));
    legend.append(item);
  }
}

function scoreBar(breakdown) {
  const bar = el('div', 'score-bar');
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', breakdown.map((b) => `${t(`priority.${b.key}`)}: ${Math.round(b.points)}`).join(', '));
  for (const b of breakdown) {
    if (b.points < 0.5) continue;
    const seg = el('span', `prio-${b.key}`);
    seg.style.width = `${b.points}%`;
    seg.title = `${t(`priority.${b.key}`)}: ${Math.round(b.points)}`;
    bar.append(seg);
  }
  return bar;
}

function cardDetails(s) {
  const c = s.crop;
  const rows = s.breakdown.map((b) => [t(`priority.${b.key}`), b.weight, pct(b.part), Math.round(b.points)]);
  rows.push([t('card.total'), '', '', pct(s.score)]);
  const traits = [
    t('trait.water', { v: scaleWord(c.water_need) }),
    t('trait.drought', { v: scaleWord(c.drought_tolerance) }),
    t('trait.cycle', { days: c.cycle_days }),
    t('trait.family', { family: familyName(c.family), latin: c.family }),
  ];
  return disclosure(
    t('card.details'),
    table([t('card.col.priority'), t('card.col.weight'), t('card.col.part'), t('card.col.points')], rows),
    el('h4', null, t('card.benefits')),
    list(null, s.benefits.map(tm)),
    el('h4', null, t('card.traits')),
    list(null, traits),
  );
}

export function renderStrategies(strategies) {
  const box = $('cards');
  box.replaceChildren();
  for (const s of strategies) {
    const card = el('article', s.isCurrent ? 'card current' : 'card');
    const name = cropName(s.crop);

    card.append(
      el('span', 'badge', t(s.isCurrent ? 'card.current' : 'card.alt', { rank: s.rank })),
      el('h3', null, t(s.isCurrent ? 'card.keep' : 'card.switch', { crop: name })),
      el('p', 'card-sub', t('card.subtitle', { family: familyName(s.crop.family), days: s.crop.cycle_days })),
    );

    const score = el('p', 'score');
    score.append(el('strong', null, String(pct(s.score))), el('span', null, t('card.scoreOf')));
    card.append(score, scoreBar(s.breakdown));

    card.append(el('h4', null, t('card.why')), list('pros', s.why.map(tm)));
    card.append(el('h4', null, t('card.watch')));
    card.append(s.risks.length ? list('cons', s.risks.map(tm)) : el('p', 'muted', t('card.noRisk')));
    card.append(cardDetails(s));
    box.append(card);
  }
}

/** What is the same for every option, shown once under the cards. */
export function renderCommon(notes) {
  const box = $('common');
  const column = (title, messages) => {
    const div = el('div');
    div.append(el('h4', null, title), list(null, messages.map(tm)));
    return div;
  };
  const grid = el('div', 'common-grid');
  grid.append(
    column(t('common.evidence'), notes.evidence),
    column(t('common.gaps'), notes.gaps),
    column(t('common.risks'), notes.risks),
  );
  box.replaceChildren(el('h3', null, t('common.title')), grid);
}

// ---------------------------------------------------------------- climate

function tile(label, value, note) {
  const node = el('div', 'tile');
  node.append(el('span', 'tile-label', label), el('span', 'tile-value', value), el('span', 'tile-note', note));
  return node;
}

function formatWindow(ranges) {
  if (!ranges.length) return t('tile.window.none');
  return ranges.map(([a, b]) => (a === b ? monthName(a) : `${monthName(a)}–${monthName(b)}`)).join(', ');
}

function meter(label, value) {
  const node = el('div', 'meter');
  const head = el('div', 'meter-head');
  head.append(el('span', null, label), el('strong', null, `${pct(value)}`));
  const track = el('div', 'meter-track');
  const fill = el('span', 'meter-fill');
  fill.style.width = `${pct(value)}%`;
  track.append(fill);
  node.append(head, track);
  return node;
}

export function renderClimate({ indicators: ind, riskInfo, monthly, season, source }) {
  const label = seasonLabelOf(season);
  const { driest, wettest } = extremes(ind.years);
  const ratio = (wettest.total / driest.total).toLocaleString(locale(), { maximumFractionDigits: 1 });

  $('tiles').replaceChildren(
    tile(t('tile.rain'), t('tile.rain.unit', { mm: Math.round(ind.meanTotal) }),
      t('tile.rain.note', { from: monthName(season.startMonth), to: monthName(season.endMonth) })),
    tile(t('tile.range'), t('tile.range.value', { ratio }), t('tile.range.note', {
      wet: label(wettest.year), wetMm: Math.round(wettest.total), dry: label(driest.year), dryMm: Math.round(driest.total),
    })),
    tile(t('tile.window'), formatWindow(dryWindow(monthly)), t('tile.window.note')),
  );
  $('tiles-more').replaceChildren(
    tile(t('tile.cv'), `${pct(ind.cvTotal)}%`, t('tile.cv.note')),
    tile(t('tile.dry'), t('tile.dry.unit', { days: Math.round(ind.meanLongestDry) }), t('tile.dry.note')),
    tile(t('tile.hot'), String(Math.round(ind.meanHotDays)), t('tile.hot.note')),
  );

  const level = riskLevel(riskInfo.risk);
  const badge = $('risk-badge');
  badge.className = `risk-badge level-${level}`;
  badge.textContent = t('risk.score', { level: t(`risk.level.${level}`), score: pct(riskInfo.risk) });

  $('risk').replaceChildren(
    el('h3', null, t('risk.title')),
    ...['variability', 'dry', 'low'].map((part) => meter(t(`risk.part.${part}`), riskInfo.parts[part])),
    el('p', 'hint', t('risk.explain')),
  );

  const fmt = (x) => x.toFixed(2);
  $('source').textContent = source.kind === 'snapshot'
    ? t('climate.source.snapshot', { name: source.name, lat: fmt(source.lat), lon: fmt(source.lon) })
    : t('climate.source.live', { lat: fmt(source.lat), lon: fmt(source.lon) });
}

/** Charts are drawn at the real container width, so they are redrawn on resize. */
export function renderCharts({ indicators: ind, monthly, season }) {
  const yearsBox = $('chart-years');
  // The monthly chart sits in a closed <details> (width 0), so both charts use this width.
  const width = yearsBox.clientWidth || 640;
  const label = seasonLabelOf(season);
  const { driest, wettest } = extremes(ind.years);

  yearsBox.replaceChildren(
    seasonYearsChart(ind.years, {
      width,
      labels: {
        aria: t('chart.years.title'),
        mean: (mm) => t('chart.years.mean', { mm }),
        tooltip: (r) => `${label(r.year)}: ${Math.round(r.total)} mm`,
      },
    }),
    el('p', 'chart-caption', t('chart.years.caption', {
      dry: label(driest.year), dryMm: Math.round(driest.total), wet: label(wettest.year), wetMm: Math.round(wettest.total),
    })),
    disclosure(t('chart.table'), table(
      [t('chart.col.season'), t('chart.col.rain'), t('chart.col.dry'), t('chart.col.hot')],
      ind.years.map((r) => [label(r.year), Math.round(r.total), r.longestDry, r.hotDays]),
    )),
  );

  const legend = el('ul', 'legend');
  for (const [cls, key] of [['swatch-season', 'chart.months.season'], ['swatch-other', 'chart.months.other']]) {
    const item = el('li');
    item.append(el('span', `swatch ${cls}`), document.createTextNode(t(key)));
    legend.append(item);
  }
  $('chart-months').replaceChildren(
    legend,
    monthlyChart(monthly, {
      width,
      isSeason: (m) => isInSeason(m, season),
      threshold: CONFIG.dryMonthMm,
      labels: { aria: t('chart.months.title'), monthName, tooltip: (m, mm) => `${monthName(m)}: ${Math.round(mm)} mm` },
    }),
    disclosure(t('chart.table'), table(
      [t('chart.col.month'), t('chart.col.rain')],
      monthly.map((mm, i) => [monthName(i + 1), Math.round(mm)]),
    )),
  );
}
