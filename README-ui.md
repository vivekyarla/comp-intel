# Market Intel dashboard — UI notes

## Morning routine (data only)

Overwrite `data/today.json` with the day’s brief. Optionally drop images into `assets/media/` and reference them from `watch[].image` (or `what_changed[].logo`).

The Today page (`index.html` + `today.js`) fetches JSON and renders. You do **not** need to rewrite HTML for each brief.

### `today.json` shape (flexible)

- `as_of`, `filter_note`
- `market_briefing?` — `{lede, bullets:[{text, cites[]}]}` (top; category trends, not competitor recap)
- `biggest_ai_news?` — `[{title, body, new?, cites[]}]` (platform/model/infra; not watchlist product ships)
- `what_changed[]` — `{title, body, new?, company?, logo?, cites:[{label,url}]}`
- `market_direction[]` — `{kind: up|flat|down|emerging, label, text}`
- `language_pulse[]` — `{term, gloss}`
- `competitive_moves[]` — `{company, slug, text, cites[]}`
- `watch[]` — `{title, body, company?, logo?, image?, cites[]}`
- `quiet_note`, `interpretation?: {fact, note}`

Omit sections or fields the brief doesn’t have; the UI adapts.

## Logos (static)

Company logos live in `assets/logos/` (`gong`, `salesforce`, `clay`, `nooks`, `outreach`, `salesloft`, `monaco`). Competitor pages and Today (moves / change thumbs / watch) reference these local files. Refresh logos only when a mark changes — not every morning.

## Serving

From this directory: `python3 -m http.server 8765 --bind 127.0.0.1`  
Open `http://127.0.0.1:8765/`.
