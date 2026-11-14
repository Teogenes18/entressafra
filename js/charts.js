// Small, dependency-free SVG charts. Colors come from CSS classes in css/style.css.
// Charts are drawn at the container's real pixel width so labels stay readable on phones.

const NS = 'http://www.w3.org/2000/svg';
const MAX_BAR = 24; // px: bars never fill the whole slot

function svgEl(tag, attrs = {}, text) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

/** A column with a 4px rounded top and a square base. */
function column(x, y, width, height, className, tooltip) {
  const r = Math.min(4, width / 2, height);
  const d = `M${x},${y + height} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${y + height} Z`;
  const path = svgEl('path', { d, class: className });
  path.append(svgEl('title', {}, tooltip));
  return path;
}

/** Round axis steps: 0, 100, 200... or 0, 250, 500... */
export function niceTicks(max, count = 4) {
  const raw = Math.max(max, 1) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * mag).find((s) => s >= raw);
  const ticks = [];
  for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(v);
  return ticks;
}

/** Shared frame: gridlines with y-axis labels. Returns the plot geometry. */
function frame(svg, { width, height, max, unit }) {
  const pad = { top: 22, right: 8, bottom: 26, left: 44 };
  const ticks = niceTicks(max, 5);
  const top = ticks[ticks.length - 1];
  const plotH = height - pad.top - pad.bottom;
  const y = (v) => pad.top + plotH - (v / top) * plotH;
  for (const v of ticks) {
    svg.append(svgEl('line', { x1: pad.left, x2: width - pad.right, y1: y(v), y2: y(v), class: v === 0 ? 'axis' : 'grid' }));
    svg.append(svgEl('text', { x: pad.left - 6, y: y(v) + 4, 'text-anchor': 'end', class: 'tick' }, v === top ? `${v} ${unit}` : v));
  }
  return { pad, y, plotW: width - pad.left - pad.right, base: y(0) };
}

/**
 * Rainy-season total for each year, with the average as a reference line.
 * rows = [{ year, total }], labels = { mean, driest, wettest, tooltip(row) }
 */
export function seasonYearsChart(rows, { width, labels }) {
  const height = 260;
  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': labels.aria });
  if (!rows.length) return svg;
  const totals = rows.map((r) => r.total);
  const mean = totals.reduce((s, x) => s + x, 0) / totals.length;
  const { pad, y, plotW, base } = frame(svg, { width, height, max: Math.max(...totals), unit: 'mm' });

  const slot = plotW / rows.length;
  const bw = Math.max(2, Math.min(MAX_BAR, slot - 2));
  const driest = rows.reduce((a, b) => (b.total < a.total ? b : a));
  const everyYear = slot >= 34;

  rows.forEach((r, i) => {
    const cx = pad.left + slot * i + slot / 2;
    // The driest season gets its own color; the caption under the chart names it.
    const cls = r === driest ? 'bar bar-low' : 'bar bar-main';
    svg.append(column(cx - bw / 2, y(r.total), bw, base - y(r.total), cls, labels.tooltip(r)));
    // Wide screens label every season ('09); narrow screens label every fifth year (2010).
    if (everyYear || r.year % 5 === 0) {
      const label = everyYear ? `'${String(r.year).slice(2)}` : String(r.year);
      svg.append(svgEl('text', { x: cx, y: base + 16, 'text-anchor': 'middle', class: 'tick' }, label));
    }
  });

  const my = y(mean);
  svg.append(svgEl('line', { x1: pad.left, x2: width - pad.right, y1: my, y2: my, class: 'ref-line' }));
  svg.append(svgEl('text', { x: pad.left + 4, y: my - 6, 'text-anchor': 'start', class: 'ref-label' }, labels.mean(Math.round(mean))));
  return svg;
}

/** Driest and wettest seasons, for the caption under the chart. */
export function extremes(rows) {
  return {
    driest: rows.reduce((a, b) => (b.total < a.total ? b : a)),
    wettest: rows.reduce((a, b) => (b.total > a.total ? b : a)),
  };
}

/**
 * Average rain per calendar month. Season months are highlighted; a line marks the dry-month threshold.
 * monthly = [12 values], isSeason(m) -> bool, labels = { monthName(m), tooltip(m, mm), threshold }
 */
export function monthlyChart(monthly, { width, isSeason, threshold, labels }) {
  const height = 220;
  const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': labels.aria });
  const { pad, y, plotW, base } = frame(svg, { width, height, max: Math.max(...monthly, threshold), unit: 'mm' });
  const slot = plotW / 12;
  const bw = Math.min(MAX_BAR, slot - 4);
  const peak = monthly.indexOf(Math.max(...monthly));

  monthly.forEach((mm, i) => {
    const cx = pad.left + slot * i + slot / 2;
    const cls = isSeason(i + 1) ? 'bar bar-season' : 'bar bar-other';
    svg.append(column(cx - bw / 2, y(mm), bw, base - y(mm), cls, labels.tooltip(i + 1, mm)));
    svg.append(svgEl('text', { x: cx, y: base + 16, 'text-anchor': 'middle', class: 'tick' }, labels.monthName(i + 1)));
    if (i === peak) svg.append(svgEl('text', { x: cx, y: y(mm) - 6, 'text-anchor': 'middle', class: 'value' }, `${Math.round(mm)} mm`));
  });

  const ty = y(threshold);
  svg.append(svgEl('line', { x1: pad.left, x2: width - pad.right, y1: ty, y2: ty, class: 'ref-line' }));
  svg.append(svgEl('text', { x: width - pad.right, y: ty - 6, 'text-anchor': 'end', class: 'ref-label' }, `${threshold} mm`));
  return svg;
}
