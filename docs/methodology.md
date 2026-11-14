# Methodology

All thresholds below are **provisional** and should be validated with local agronomists. Each one lives in a single place in the code (`CONFIG` in `js/indicators.js`), so the team can change it in one line.

## 1. Rainy season

The farmer picks the first and last month of the rainy season (default: February to May, the "quadra chuvosa" of Ceará). A season can cross the new year, for example November to March. In that case it is labelled by the year it starts (the 2020 season runs from November 2020 to March 2021).

## 2. Indicators (`js/indicators.js`)

For each season in the selected window:

- **Season rainfall**: sum of daily `PRECTOTCORR` (mm).
- **Longest dry spell** ("veranico"): longest run of consecutive days with rainfall below 1 mm. A spell that crosses the new year counts as one spell.
- **Hot days**: days with `T2M_MAX` of 35 °C or more.
- A season is used only if at least 90% of its days have valid data. Coverage is measured against the full season length, so a season cut off by the start or the end of the data is skipped. POWER's fill value (-999) is treated as missing.

Across seasons: mean season rainfall, **coefficient of variation (CV)** of season rainfall (standard deviation divided by the mean), mean longest dry spell, mean hot days.

**Monthly rainfall**: mean total of each calendar month over all years.

**Entressafra window**: the months whose mean rainfall is below 30 mm. Without irrigation, fields usually stay idle in these months. Consecutive months are joined into ranges, also across December and January.

## 3. Climate risk indicator (0 to 1)

```
variability = min(1, CV / 0.6)
dry         = min(1, mean longest dry spell / 30 days)
low         = min(1, max(0, 1 - mean season rainfall / 600 mm))
risk        = (variability + dry + low) / 3
```

Labels: below 0.33 low, below 0.66 moderate, otherwise high. The page shows the three parts separately, so the user can see what drives the risk. The reference values (0.6, 30 days, 600 mm) are provisional and tuned for a semi-arid setting.

## 4. Crop part-scores (`js/scoring.js`), each from 0 to 1

```
water    = 1 - risk * (water_need / 5) * ((6 - drought_tolerance) / 5)
soil     = 0.5 * (nitrogen_fixing ? 1 : 0) + 0.5 * (soil_cover / 5)
rotation = 0 if same botanical family as the current crop, otherwise 1
forage   = forage / 5
income   = income / 5        (provisional; depends on local markets)
```

## 5. Strategy score and its breakdown

The farmer's priorities (0 to 5 each) are the weights:

```
score       = sum(weight_i * part_i) / sum(weight_i)
points_i    = 100 * weight_i * part_i / sum(weight_i)      (sum of points_i = 100 * score)
```

If every weight is zero, all parts count equally. Each strategy card shows `points_i` as a colored bar and as a table (weight, crop fit, points), so every score can be checked by hand.

## 6. Strategies shown

1. The **current rotation** (the same crop again), as the baseline.
2. The **two best-scoring alternatives**, preferring crops from a different botanical family.

Each card shows only what is specific to that option:

- **Why**: its two strongest weighted priorities. A priority counts as a reason only when the crop fits it well (water fit ≥ 0.85, other parts ≥ 0.5).
- **Watch out**: the risks specific to that crop (rules below). A card can have none.
- **Details** (one click): the score table, possible benefits and crop traits.

What is the same for every option (the NASA climate evidence, the information gaps and the call for local review) is shown once, under the cards (`commonNotes()` in `js/scoring.js`).

| Risk rule | Shown when |
|---|---|
| Monoculture | the strategy repeats the current crop |
| Same family | an alternative shares the botanical family of the current crop |
| Water demand | water need ≥ 4 and climate risk ≥ 0.33 |
| Weak water fit | otherwise, when water fit < 0.85 |
| Long cycle | crop cycle longer than the season and drought tolerance ≤ 3 |
| Heat | mean hot days ≥ 10 and drought tolerance ≤ 2 |
| Local review | always (shown once, for every option) |

Crop ratings from 1 to 5 are shown in words: 1-2 low, 3 medium, 4-5 high.

## 7. Colors

The five priority colors (blue, orange, violet, green, yellow, in that fixed order) were checked with a color-vision-deficiency validator: every adjacent pair stays distinguishable for protan, deutan and tritan vision. Yellow has low contrast on the light background, so every colored bar also has a legend and a table with the same numbers.

## 8. Known simplifications

- One crop per season, no multi-year sequences or intercropping.
- No soil data, prices, irrigation, labor or seed access.
- NASA POWER is gridded data, so local conditions can differ.
- Gridded daily rainfall tends to spread light rain over many days, which can shorten dry spells compared with a rain gauge in the field.
