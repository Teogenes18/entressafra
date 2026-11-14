import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeIndicators, monthlyMeans, climateRisk, riskLevel, daysInSeason, seasonMonths, isInSeason, dryWindow,
} from '../js/indicators.js';

const DIM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Builds a daily series (no leap days) where rainFn(y, m, d) gives the rain of each day. */
function synthetic(years, rainFn) {
  const dates = [], rain = [], tmax = [];
  for (const y of years) {
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= DIM[m - 1]; d++) {
        dates.push(`${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`);
        rain.push(rainFn(y, m, d));
        tmax.push(m === 3 && d <= 5 ? 36 : 30);
      }
    }
  }
  return { dates, rain, tmax };
}

test('season totals, dry spells and hot days are computed per year', () => {
  // 2 mm every day in Feb-May except a 10-day dry block in April.
  const s = synthetic([2020, 2021, 2022], (y, m, d) => (m === 4 && d <= 10 ? 0 : m >= 2 && m <= 5 ? 2 : 0));
  const ind = computeIndicators(s, { startMonth: 2, endMonth: 5 });
  assert.equal(ind.yearsUsed, 3);
  assert.equal(ind.meanLongestDry, 10);
  assert.equal(ind.cvTotal, 0);
  assert.equal(ind.meanHotDays, 5);
  assert.equal(daysInSeason({ startMonth: 2, endMonth: 5 }), 28 + 31 + 30 + 31);
  assert.equal(ind.meanTotal, (120 - 10) * 2);
});

test('seasons with too many missing days are skipped', () => {
  const s = synthetic([2020, 2021], (y) => (y === 2021 ? null : 1));
  const ind = computeIndicators(s, { startMonth: 2, endMonth: 5 });
  assert.equal(ind.yearsUsed, 1);
});

test('a season can cross the new year (November to March)', () => {
  const season = { startMonth: 11, endMonth: 3 };
  assert.deepEqual(seasonMonths(season), [11, 12, 1, 2, 3]);
  assert.equal(isInSeason(1, season), true);
  assert.equal(isInSeason(6, season), false);
  assert.equal(daysInSeason(season), 30 + 31 + 31 + 28 + 31);

  // 1 mm per day in every season month. Data covers 2020-2022, so only the
  // 2020/21 and 2021/22 seasons are complete; the cut-off ones are skipped.
  const s = synthetic([2020, 2021, 2022], (y, m) => (isInSeason(m, season) ? 1 : 0));
  const ind = computeIndicators(s, season);
  assert.deepEqual(ind.years.map((r) => r.year), [2020, 2021]);
  assert.equal(ind.meanTotal, 151);
});

test('a dry spell that runs across the new year is counted as one spell', () => {
  const season = { startMonth: 11, endMonth: 3 };
  // Dry from 20 December to 9 January (21 days), wet otherwise.
  const s = synthetic([2020, 2021], (y, m, d) => ((m === 12 && d >= 20) || (m === 1 && d <= 9) ? 0 : 5));
  const ind = computeIndicators(s, season);
  assert.equal(ind.years[0].longestDry, 21);
});

test('monthlyMeans averages monthly totals over years', () => {
  const s = synthetic([2020, 2021], (y, m) => (m === 1 ? 1 : 0));
  const mm = monthlyMeans(s);
  assert.equal(mm[0], 31);
  assert.equal(mm[1], 0);
});

test('dryWindow finds the entressafra months, also across December-January', () => {
  const months = (dryOnes) => Array.from({ length: 12 }, (_, i) => (dryOnes.includes(i + 1) ? 5 : 100));
  assert.deepEqual(dryWindow(months([7, 8, 9, 10, 11, 12])), [[7, 12]]);
  assert.deepEqual(dryWindow(months([10, 11, 12, 1])), [[10, 1]]);
  assert.deepEqual(dryWindow(months([3, 8, 9])), [[3, 3], [8, 9]]);
  assert.deepEqual(dryWindow(months([])), []);
  assert.deepEqual(dryWindow(months([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])), [[1, 12]]);
});

test('climate risk grows with variability, dry spells and low rainfall', () => {
  const calm = climateRisk({ cvTotal: 0.1, meanLongestDry: 5, meanTotal: 900 }).risk;
  const harsh = climateRisk({ cvTotal: 0.5, meanLongestDry: 25, meanTotal: 300 }).risk;
  assert.ok(harsh > calm);
  assert.ok(calm >= 0 && harsh <= 1);
  assert.equal(riskLevel(calm), 'low');
  assert.equal(riskLevel(harsh), 'high');
});
