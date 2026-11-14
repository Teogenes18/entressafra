# Data sources

## NASA POWER (Prediction Of Worldwide Energy Resources)

- Service: Daily API, point query, community `AG` (agroclimatology).
- Endpoint: `https://power.larc.nasa.gov/api/temporal/daily/point`
- Documentation: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- Variables used:
  - `PRECTOTCORR`: precipitation corrected, mm/day
  - `T2M_MAX`: maximum air temperature at 2 m, °C
- Missing values use the fill value `-999`, which the app converts to missing.
- No API key is required. The API allows requests from the browser (CORS), so the app needs no server.

Example request (the one saved below):

```
https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M_MAX&community=AG&longitude=-39.06&latitude=-6.60&start=19960101&end=20251231&format=JSON
```

## Saved response for Cedro, Ceará

`data/nasa-power-cedro-1996-2025.json` is the response to the request above, saved unchanged on 2026-11-14 (POWER API v2.10.3; sources MERRA-2 and POWER). It has 10,958 days and no missing values.

It is used in two cases:

1. The **"See an example: Cedro, Ceará"** button, so the demo opens in seconds.
2. As a **fallback** when the live API does not answer and the chosen point is within 0.25° of Cedro.

The page always says which source it used. The API response time varied from about 2 s to 17 s while the tool was being built, which is why the fallback exists.

Values computed from this file (also checked in `tests/power.test.js`):

| Season (February-May) | Rain |
|---|---|
| 2009 | 795 mm |
| 2012 | 382 mm |
| 1996-2025 average | 567 mm, 67% of the yearly rain |

## Other resources

- Map tiles: OpenStreetMap contributors.
- Map library: Leaflet 1.9.4.
- Fonts: Inter and Space Grotesk (Google Fonts), with system fonts as fallback.
- Crop traits: provisional table in `data/crops.json`, to be validated against published sources (for example Embrapa).
