// NASA POWER Daily API client (point query, AG community).
// Docs: https://power.larc.nasa.gov/docs/services/api/temporal/daily/

const BASE = 'https://power.larc.nasa.gov/api/temporal/daily/point';
export const PARAMS = ['PRECTOTCORR', 'T2M_MAX']; // rainfall (mm/day), max air temperature at 2 m (°C)
const FILL = -999; // POWER's documented fill value for missing data
const TIMEOUT_MS = 45000;

/**
 * A NASA POWER response saved unchanged from the API (see docs/data-sources.md).
 * It keeps the demo working when the API is slow or offline, and it lets anyone check the numbers.
 */
export const SNAPSHOT = {
  name: 'Cedro, Ceará',
  lat: -6.6,
  lon: -39.06,
  startYear: 1996,
  endYear: 2025,
  file: 'data/nasa-power-cedro-1996-2025.json',
};

export function buildUrl({ lat, lon, startYear, endYear }) {
  const q = new URLSearchParams({
    parameters: PARAMS.join(','),
    community: 'AG',
    longitude: String(lon),
    latitude: String(lat),
    start: `${startYear}0101`,
    end: `${endYear}1231`,
    format: 'JSON',
  });
  return `${BASE}?${q.toString()}`;
}

/** Turns a POWER JSON response into aligned, date-sorted arrays. Missing values become null. */
export function parsePower(json) {
  const p = json && json.properties && json.properties.parameter;
  if (!p || !p.PRECTOTCORR || !p.T2M_MAX) {
    throw new Error('Unexpected response from NASA POWER (missing PRECTOTCORR or T2M_MAX).');
  }
  const dates = Object.keys(p.PRECTOTCORR).sort();
  const clean = (v) => (typeof v === 'number' && v !== FILL ? v : null);
  return {
    dates,
    rain: dates.map((d) => clean(p.PRECTOTCORR[d])),
    tmax: dates.map((d) => clean(p.T2M_MAX[d])),
  };
}

/** Keeps only the days from startYear to endYear (inclusive). */
export function sliceYears(series, startYear, endYear) {
  const keep = series.dates.map((d) => {
    const y = Number(d.slice(0, 4));
    return y >= startYear && y <= endYear;
  });
  const pick = (arr) => arr.filter((_, i) => keep[i]);
  return { dates: pick(series.dates), rain: pick(series.rain), tmax: pick(series.tmax) };
}

/** True when a point is inside the same ~0.5° POWER grid cell area as the saved snapshot. */
export function isNearSnapshot(lat, lon) {
  return Math.abs(lat - SNAPSHOT.lat) <= 0.25 && Math.abs(lon - SNAPSHOT.lon) <= 0.25;
}

/** Live request to NASA POWER, with a timeout so the page never hangs. */
export async function fetchDaily(opts, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(buildUrl(opts), { signal: controller.signal });
    if (!res.ok) throw new Error(`NASA POWER request failed (HTTP ${res.status}).`);
    return parsePower(await res.json());
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(`NASA POWER did not answer within ${TIMEOUT_MS / 1000} s.`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Loads the saved Cedro response and trims it to the requested years. */
export async function loadSnapshot({ startYear, endYear }, fetchImpl = fetch) {
  const res = await fetchImpl(SNAPSHOT.file);
  if (!res.ok) throw new Error(`Could not load the saved NASA data (HTTP ${res.status}).`);
  return sliceYears(parsePower(await res.json()), startYear, endYear);
}
