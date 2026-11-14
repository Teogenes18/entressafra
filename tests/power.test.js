import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parsePower, buildUrl, sliceYears, isNearSnapshot, fetchDaily, SNAPSHOT } from '../js/power.js';
import { computeIndicators } from '../js/indicators.js';

const saved = JSON.parse(readFileSync(new URL(`../${SNAPSHOT.file}`, import.meta.url)));

test('parsePower maps fill value -999 to null and sorts dates', () => {
  const json = { properties: { parameter: { PRECTOTCORR: { 20240102: -999, 20240101: 2 }, T2M_MAX: { 20240101: 31, 20240102: 32 } } } };
  const s = parsePower(json);
  assert.deepEqual(s.dates, ['20240101', '20240102']);
  assert.deepEqual(s.rain, [2, null]);
  assert.deepEqual(s.tmax, [31, 32]);
});

test('parsePower rejects unexpected responses', () => {
  assert.throws(() => parsePower({}), /Unexpected response/);
});

test('buildUrl uses the documented endpoint and parameters', () => {
  const u = buildUrl({ lat: -6.6, lon: -39.06, startYear: 2015, endYear: 2024 });
  assert.match(u, /^https:\/\/power\.larc\.nasa\.gov\/api\/temporal\/daily\/point\?/);
  assert.match(u, /parameters=PRECTOTCORR%2CT2M_MAX/);
  assert.match(u, /community=AG/);
  assert.match(u, /start=20150101/);
  assert.match(u, /end=20241231/);
});

test('fetchDaily reports HTTP errors clearly', async () => {
  const fake = async () => ({ ok: false, status: 503 });
  await assert.rejects(fetchDaily({ lat: 0, lon: 0, startYear: 2020, endYear: 2020 }, fake), /HTTP 503/);
});

test('sliceYears keeps only the requested years', () => {
  const s = { dates: ['20191231', '20200101', '20211231', '20220101'], rain: [1, 2, 3, 4], tmax: [5, 6, 7, 8] };
  assert.deepEqual(sliceYears(s, 2020, 2021), { dates: ['20200101', '20211231'], rain: [2, 3], tmax: [6, 7] });
});

test('the saved snapshot is only used near Cedro', () => {
  assert.equal(isNearSnapshot(-6.6, -39.06), true);
  assert.equal(isNearSnapshot(-6.75, -38.9), true);
  assert.equal(isNearSnapshot(-3.73, -38.52), false); // Fortaleza
});

test('the saved NASA POWER response for Cedro is complete and matches its header', () => {
  const series = parsePower(saved);
  assert.equal(saved.header.start, `${SNAPSHOT.startYear}0101`);
  assert.equal(saved.header.end, `${SNAPSHOT.endYear}1231`);
  assert.equal(series.dates.length, 10958); // 30 years, 8 of them leap years
  assert.equal(series.rain.filter((v) => v === null).length, 0);
});

test('Cedro: 2012 was a drought year against 2009 in the NASA data', () => {
  // These are the numbers the pitch deck should quote (source: NASA POWER, this file).
  const ind = computeIndicators(parsePower(saved), { startMonth: 2, endMonth: 5 });
  const season = (y) => Math.round(ind.years.find((r) => r.year === y).total);
  assert.equal(season(2009), 795);
  assert.equal(season(2012), 382);
});
