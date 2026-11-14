import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { keysOf, t, tm, setLang } from '../js/i18n.js';
import { buildStrategies, commonNotes } from '../js/scoring.js';
import { niceTicks } from '../js/charts.js';

const crops = JSON.parse(readFileSync(new URL('../data/crops.json', import.meta.url))).crops;

test('English and Portuguese have exactly the same keys', () => {
  assert.deepEqual([...keysOf('pt')].sort(), [...keysOf('en')].sort());
});

test('every text key used in index.html exists', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const used = [...html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(used.length > 10);
  for (const key of used) assert.ok(keysOf('en').includes(key), `missing key ${key}`);
});

test('every message the scoring can produce is translated, with no empty placeholder', () => {
  const seen = new Set();
  const weightSets = [
    { water: 5, soil: 0, rotation: 0, forage: 0, income: 0 },
    { water: 0, soil: 5, rotation: 5, forage: 5, income: 5 },
    { water: 0, soil: 0, rotation: 0, forage: 0, income: 0 },
  ];
  for (const currentId of crops.map((c) => c.id)) {
    for (const weights of weightSets) {
      for (const risk of [0.1, 0.9]) {
        const list = buildStrategies({
          crops, currentId, weights, riskInfo: { risk },
          indicators: { meanTotal: 500, cvTotal: 0.3, meanLongestDry: 20, meanHotDays: 30, yearsUsed: 20 },
          season: { startMonth: 2, endMonth: 5 },
        });
        for (const s of list) for (const k of ['why', 'benefits', 'risks']) s[k].forEach((m) => seen.add(m));
        const notes = commonNotes({ indicators: { meanTotal: 500, cvTotal: 0.3, meanLongestDry: 20, meanHotDays: 30, yearsUsed: 20 }, riskInfo: { risk } });
        for (const k of ['evidence', 'gaps', 'risks']) notes[k].forEach((m) => seen.add(m));
      }
    }
  }
  for (const lang of ['en', 'pt']) {
    setLang(lang);
    for (const m of seen) {
      assert.ok(keysOf(lang).includes(m.key), `${lang}: missing ${m.key}`);
      assert.doesNotMatch(tm(m), /\{\w+\}/, `${lang}: unfilled placeholder in ${m.key}`);
    }
  }
  setLang('en');
});

test('every literal t("...") key in the JavaScript exists', () => {
  const dir = new URL('../js/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const code = readFileSync(new URL(file, dir), 'utf8');
    for (const [, key] of code.matchAll(/\bt\('([\w.]+)'/g)) assert.ok(keysOf('en').includes(key), `${file}: missing key ${key}`);
  }
});

test('t fills placeholders and shows unknown keys as-is', () => {
  setLang('pt');
  assert.equal(t('card.keep', { crop: 'Milho' }), 'Manter Milho');
  setLang('en');
  assert.equal(t('no.such.key'), 'no.such.key');
});

test('chart axis ticks are round numbers that cover the maximum', () => {
  assert.deepEqual(niceTicks(1031), [0, 500, 1000, 1500]);
  assert.deepEqual(niceTicks(1031, 5), [0, 250, 500, 750, 1000, 1250]);
  assert.deepEqual(niceTicks(180), [0, 50, 100, 150, 200]);
});
