// Transparent weighted scoring of rotation strategies. See docs/methodology.md.
//
// This module never writes sentences. Every explanation is a message object
// { key, params } that js/i18n.js turns into English or Portuguese, so the logic
// stays testable and the wording stays in one place.
import { riskLevel, daysInSeason } from './indicators.js';

/** The farmer's priorities, in display order. Each one becomes a part-score from 0 to 1. */
export const PRIORITIES = ['water', 'soil', 'rotation', 'forage', 'income'];

export const DEFAULT_WEIGHTS = { water: 4, soil: 3, rotation: 2, forage: 1, income: 2 };

const msg = (key, params = {}) => ({ key, params });
const orFallback = (list, fallback) => (list.length ? list : [fallback]);

/** Part-scores (0 to 1) of one crop. ctx = { risk, currentCrop } */
export function partScores(crop, { risk, currentCrop }) {
  return {
    // Thirsty, drought-sensitive crops lose more points as climate risk grows.
    water: 1 - risk * (crop.water_need / 5) * ((6 - crop.drought_tolerance) / 5),
    soil: 0.5 * (crop.n_fixing ? 1 : 0) + 0.5 * (crop.soil_cover / 5),
    rotation: currentCrop && currentCrop.family === crop.family ? 0 : 1,
    forage: crop.forage / 5,
    income: crop.income / 5,
  };
}

/**
 * Weighted mean of the part-scores, with how many of the 100 points each priority adds.
 * If every weight is zero, all priorities count equally.
 */
export function combine(parts, weights) {
  const keys = Object.keys(parts);
  const totalWeight = keys.reduce((s, k) => s + (weights[k] || 0), 0);
  const w = (k) => (totalWeight === 0 ? 1 : weights[k] || 0);
  const sum = totalWeight === 0 ? keys.length : totalWeight;
  const breakdown = keys.map((k) => ({ key: k, weight: w(k), part: parts[k], points: (100 * w(k) * parts[k]) / sum }));
  return { score: breakdown.reduce((s, b) => s + b.points, 0) / 100, breakdown };
}

// Why a crop was suggested: its strongest weighted parts, phrased for the farmer.
const GOOD_WATER_FIT = 0.85; // below this, water fit is a risk to review, not a reason to choose

const REASONS = {
  water: (c) => msg('why.water', { need: c.water_need, tol: c.drought_tolerance }),
  soil: (c) => msg(c.n_fixing ? 'why.soil.nfix' : 'why.soil.cover'),
  rotation: (c) => msg('why.rotation', { family: c.family }),
  forage: (c) => msg('why.forage', { forage: c.forage }),
  income: (c) => msg('why.income', { income: c.income }),
};

function reasons(crop, parts, weights, isCurrent) {
  return PRIORITIES.filter((k) => (weights[k] || 0) > 0)
    .filter((k) => !(isCurrent && k === 'rotation')) // keeping the same crop never breaks a pest cycle
    .filter((k) => parts[k] >= (k === 'water' ? GOOD_WATER_FIT : 0.5)) // a weak part is not a reason to choose a crop
    .sort((a, b) => weights[b] * parts[b] - weights[a] * parts[a])
    .slice(0, 2)
    .map((k) => REASONS[k](crop, parts[k]));
}

function benefitsOf(crop, parts, isCurrent) {
  const list = [];
  if (crop.n_fixing) list.push(msg('benefit.nfix'));
  if (crop.soil_cover >= 4) list.push(msg('benefit.cover'));
  if (crop.forage >= 4) list.push(msg('benefit.forage'));
  if (crop.drought_tolerance >= 4) list.push(msg('benefit.drought'));
  if (!isCurrent && parts.rotation === 1) list.push(msg('benefit.rotation'));
  return orFallback(list, msg('benefit.none'));
}

function risksOf(crop, parts, isCurrent, { risk, indicators, seasonDays }) {
  const list = [];
  if (isCurrent) list.push(msg('risk.monoculture'));
  else if (parts.rotation === 0) list.push(msg('risk.sameFamily', { family: crop.family }));
  if (crop.water_need >= 4 && risk >= 0.33) list.push(msg('risk.water'));
  else if (parts.water < GOOD_WATER_FIT) list.push(msg('risk.waterFit', { need: crop.water_need, tol: crop.drought_tolerance }));
  if (crop.cycle_days > seasonDays && crop.drought_tolerance <= 3) {
    list.push(msg('risk.cycle', { cycle: crop.cycle_days, season: seasonDays }));
  }
  if (indicators.meanHotDays >= 10 && crop.drought_tolerance <= 2) list.push(msg('risk.heat'));
  return list; // may be empty: the risks shared by every option are in commonNotes()
}

/**
 * Notes that apply to every strategy (the NASA climate evidence, the data gaps and the
 * call for local review). The page shows them once instead of repeating them in each card.
 */
export function commonNotes({ indicators, riskInfo }) {
  return {
    evidence: [msg('evidence.climate', {
      mm: Math.round(indicators.meanTotal),
      years: indicators.yearsUsed,
      cv: Math.round(indicators.cvTotal * 100),
      dry: Math.round(indicators.meanLongestDry),
      hot: Math.round(indicators.meanHotDays),
      level: riskLevel(riskInfo.risk),
    })],
    gaps: [msg('gap.soil'), msg('gap.traits'), msg('gap.market')],
    risks: [msg('risk.local')],
  };
}

/**
 * Ranks the current rotation against the two best alternatives.
 * Alternatives prefer a different botanical family than the current crop.
 */
export function buildStrategies({ crops, currentId, weights, riskInfo, indicators, season }) {
  const currentCrop = crops.find((c) => c.id === currentId);
  if (!currentCrop) throw new Error(`Unknown current crop: ${currentId}`);
  const ctx = { risk: riskInfo.risk, indicators, seasonDays: daysInSeason(season) };

  const scored = crops.map((crop) => {
    const parts = partScores(crop, { risk: riskInfo.risk, currentCrop });
    return { crop, parts, ...combine(parts, weights) };
  });

  const current = scored.find((s) => s.crop.id === currentId);
  const others = scored.filter((s) => s.crop.id !== currentId).sort((a, b) => b.score - a.score);
  const differentFamily = others.filter((s) => s.crop.family !== currentCrop.family);
  const sameFamily = others.filter((s) => s.crop.family === currentCrop.family);
  const alternatives = [...differentFamily, ...sameFamily].slice(0, 2);

  return [current, ...alternatives]
    .map(({ crop, parts, score, breakdown }) => {
      const isCurrent = crop.id === currentId;
      return {
        crop,
        isCurrent,
        score,
        parts,
        breakdown,
        why: orFallback(reasons(crop, parts, weights, isCurrent), msg('why.balanced')),
        benefits: benefitsOf(crop, parts, isCurrent),
        risks: risksOf(crop, parts, isCurrent, ctx), // only the risks specific to this crop
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}
