import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { partScores, combine, buildStrategies, commonNotes, PRIORITIES } from '../js/scoring.js';

const crops = JSON.parse(readFileSync(new URL('../data/crops.json', import.meta.url))).crops;
const find = (id) => crops.find((c) => c.id === id);
const indicators = { meanTotal: 600, cvTotal: 0.3, meanLongestDry: 15, meanHotDays: 4, yearsUsed: 10 };
const season = { startMonth: 2, endMonth: 5 };
const run = (weights, extra = {}) =>
  buildStrategies({ crops, currentId: 'maize', weights, riskInfo: { risk: 0.5 }, indicators, season, ...extra });

test('high climate risk penalises thirsty, drought-sensitive crops more', () => {
  const ctx = { risk: 0.8, currentCrop: find('maize') };
  assert.ok(partScores(find('pearl-millet'), ctx).water > partScores(find('maize'), ctx).water);
});

test('rotation score is 0 inside the same botanical family and 1 outside it', () => {
  const ctx = { risk: 0.3, currentCrop: find('maize') };
  assert.equal(partScores(find('sorghum'), ctx).rotation, 0);
  assert.equal(partScores(find('cowpea'), ctx).rotation, 1);
});

test('combine falls back to an equal mean when every weight is zero', () => {
  assert.equal(combine({ a: 1, b: 0 }, { a: 0, b: 0 }).score, 0.5);
});

test('the score breakdown adds up to the score', () => {
  const { score, breakdown } = combine({ a: 1, b: 0.5, c: 0 }, { a: 3, b: 2, c: 5 });
  assert.equal(score, (3 * 1 + 2 * 0.5) / 10);
  const total = breakdown.reduce((s, b) => s + b.points, 0);
  assert.ok(Math.abs(total - score * 100) < 1e-9);
});

test('buildStrategies returns the current rotation plus two alternatives, ranked', () => {
  const list = run({ water: 4, soil: 3, rotation: 2, forage: 1, income: 2 });
  assert.equal(list.length, 3);
  assert.equal(list.filter((s) => s.isCurrent).length, 1);
  for (const s of list) {
    for (const k of ['why', 'benefits']) assert.ok(s[k].length > 0, `${k} must not be empty`);
    assert.ok(Array.isArray(s.risks));
    assert.ok(s.score >= 0 && s.score <= 1);
    assert.deepEqual(s.breakdown.map((b) => b.key), PRIORITIES);
  }
  assert.deepEqual(list.map((s) => s.rank), [1, 2, 3]);
  assert.ok(list[0].score >= list[1].score && list[1].score >= list[2].score);
});

test('alternatives prefer a different botanical family than the current crop', () => {
  const list = run({ water: 1, soil: 1, rotation: 1, forage: 1, income: 1 });
  assert.ok(list.filter((s) => !s.isCurrent).every((s) => s.crop.family !== 'Poaceae'));
});

test('the current crop always warns about monoculture; shared notes are not repeated in cards', () => {
  const list = run({ water: 3, soil: 3, rotation: 3, forage: 3, income: 3 });
  const current = list.find((s) => s.isCurrent);
  assert.ok(current.risks.some((m) => m.key === 'risk.monoculture'));
  for (const s of list) assert.ok(!s.risks.some((m) => m.key === 'risk.local'));
  const notes = commonNotes({ indicators, riskInfo: { risk: 0.5 } });
  assert.equal(notes.evidence[0].key, 'evidence.climate');
  assert.equal(notes.gaps.length, 3);
  assert.deepEqual(notes.risks.map((m) => m.key), ['risk.local']);
});

test('every strategy explains itself even when all priorities are zero', () => {
  const list = run({ water: 0, soil: 0, rotation: 0, forage: 0, income: 0 });
  for (const s of list) assert.ok(s.why.length > 0);
});

test('an unknown current crop is a clear error', () => {
  assert.throws(() => run({ water: 1 }, { currentId: 'banana' }), /Unknown current crop/);
});
