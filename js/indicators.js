// Turns daily rainfall and temperature into a few simple, explainable indicators.
// Pure functions only (no DOM), so every number on screen can be unit-tested.
// All thresholds are provisional and documented in docs/methodology.md.

export const CONFIG = {
  dryDayMm: 1, // a day with less rain than this counts as dry
  hotDayC: 35, // a day at or above this maximum temperature counts as hot
  dryMonthMm: 30, // a month averaging less rain than this is part of the dry window (entressafra)
  minCoverage: 0.9, // share of valid days required to use a season
  refs: { cv: 0.6, dryspell: 30, lowRain: 600 }, // normalisation references for the risk score
};

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

/** "20240315" -> { y: 2024, m: 3 } */
export function parseDate(key) {
  return { y: Number(key.slice(0, 4)), m: Number(key.slice(4, 6)) };
}

/**
 * A season is { startMonth, endMonth } with months 1-12.
 * It may cross the new year: { startMonth: 11, endMonth: 3 } means November to March.
 */
export function seasonMonths({ startMonth, endMonth }) {
  const months = [];
  for (let m = startMonth; ; m = (m % 12) + 1) {
    months.push(m);
    if (m === endMonth) return months;
  }
}

export function isInSeason(month, { startMonth, endMonth }) {
  return startMonth <= endMonth
    ? month >= startMonth && month <= endMonth
    : month >= startMonth || month <= endMonth;
}

/** The year a season is labelled with: the year in which it starts. */
export function seasonYear(year, month, { startMonth, endMonth }) {
  return startMonth > endMonth && month < startMonth ? year - 1 : year;
}

/** Number of days in the season (non-leap year). */
export function daysInSeason(season) {
  return seasonMonths(season).reduce((n, m) => n + DAYS_IN_MONTH[m - 1], 0);
}

/**
 * Per-season statistics and their averages across years.
 * series = { dates: ["YYYYMMDD", ...], rain: [mm|null], tmax: [°C|null] }, sorted by date.
 */
export function computeIndicators(series, season, cfg = CONFIG) {
  const perSeason = new Map();
  for (let i = 0; i < series.dates.length; i++) {
    const { y, m } = parseDate(series.dates[i]);
    if (!isInSeason(m, season)) continue;
    const key = seasonYear(y, m, season);
    if (!perSeason.has(key)) perSeason.set(key, { valid: 0, total: 0, run: 0, longest: 0, hot: 0 });
    const s = perSeason.get(key);

    const rain = series.rain[i];
    if (rain !== null) {
      s.valid += 1;
      s.total += rain;
      s.run = rain < cfg.dryDayMm ? s.run + 1 : 0;
      s.longest = Math.max(s.longest, s.run);
    }
    const tmax = series.tmax[i];
    if (tmax !== null && tmax >= cfg.hotDayC) s.hot += 1;
  }

  // Coverage is measured against the full season length, so a season cut off at the
  // start or end of the data (for example November-March with data starting in January) is skipped.
  const expectedDays = daysInSeason(season);
  const years = [...perSeason.entries()]
    .filter(([, s]) => s.valid / expectedDays >= cfg.minCoverage)
    .sort((a, b) => a[0] - b[0])
    .map(([year, s]) => ({ year, total: s.total, longestDry: s.longest, hotDays: s.hot }));

  const totals = years.map((r) => r.total);
  const meanTotal = mean(totals);
  const std = Math.sqrt(mean(totals.map((x) => (x - meanTotal) ** 2)));
  return {
    years,
    yearsUsed: years.length,
    meanTotal,
    cvTotal: meanTotal > 0 ? std / meanTotal : 0,
    meanLongestDry: mean(years.map((r) => r.longestDry)),
    meanHotDays: mean(years.map((r) => r.hotDays)),
  };
}

/** Mean rainfall (mm) for each calendar month, averaged over the years in the series. */
export function monthlyMeans(series) {
  const totals = new Map(); // "y-m" -> mm
  for (let i = 0; i < series.dates.length; i++) {
    const rain = series.rain[i];
    if (rain === null) continue;
    const { y, m } = parseDate(series.dates[i]);
    const key = `${y}-${m}`;
    totals.set(key, (totals.get(key) || 0) + rain);
  }
  const perMonth = Array.from({ length: 12 }, () => []);
  for (const [key, mm] of totals) perMonth[Number(key.split('-')[1]) - 1].push(mm);
  return perMonth.map(mean);
}

/**
 * The dry window (the "entressafra"): months that average less than cfg.dryMonthMm of rain.
 * Returned as ranges of consecutive months, joined across December-January:
 * e.g. [[7, 12]] for July to December, or [[9, 1]] for September to January.
 */
export function dryWindow(monthly, cfg = CONFIG) {
  const dry = monthly.map((mm) => mm < cfg.dryMonthMm);
  if (dry.every(Boolean)) return [[1, 12]];
  if (!dry.some(Boolean)) return [];
  // Start scanning just after a wet month, so a range that wraps the year stays whole.
  const firstWet = dry.indexOf(false);
  const ranges = [];
  let start = null;
  for (let k = 1; k <= 12; k++) {
    const i = (firstWet + k) % 12;
    if (dry[i] && start === null) start = i;
    if (!dry[i] && start !== null) {
      ranges.push([start + 1, ((i + 11) % 12) + 1]);
      start = null;
    }
  }
  return ranges;
}

/**
 * Climate risk from 0 (low) to 1 (high): the mean of three normalised parts.
 *  - variability: how much season rainfall changes from year to year
 *  - dry: how long the longest dry spell inside the season usually is
 *  - low: how far season rainfall falls below the reference amount
 */
export function climateRisk(ind, cfg = CONFIG) {
  const parts = {
    variability: clamp01(ind.cvTotal / cfg.refs.cv),
    dry: clamp01(ind.meanLongestDry / cfg.refs.dryspell),
    low: clamp01(1 - ind.meanTotal / cfg.refs.lowRain),
  };
  return { risk: (parts.variability + parts.dry + parts.low) / 3, parts };
}

/** "low" | "moderate" | "high" */
export function riskLevel(risk) {
  return risk < 0.33 ? 'low' : risk < 0.66 ? 'moderate' : 'high';
}
