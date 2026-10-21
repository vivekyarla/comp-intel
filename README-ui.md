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
- `feed[]` — posts from company channels & founders (last 1–2 PT days), written by `scripts/pull_feed.py`: `{company, slug, author:{name, handle, url}, kind: company|founder, source: X|LinkedIn, ts (ISO, PT offset), category, summary, url, also?:{LinkedIn|X: url}, engagement:{likes, reposts, replies, views | reactions, comments}}`. Rendered by `feed.js` as "Posts from company channels & founders"; omitted when empty, no filler line. `data/feed_recent.json` (rolling 14 days) feeds the "Recent posts" block on competitor pages.
- `watch[]` — `{title, body, company?, logo?, image?, cites[]}`
- `quiet_note`, `interpretation?: {fact, note}`

Omit sections or fields the brief doesn’t have; the UI adapts.

## Logos (static)

Company logos live in `assets/logos/` (`gong`, `salesforce`, `clay`, `nooks`, `outreach`, `salesloft`, `monaco`). Competitor pages and Today (moves / change thumbs / watch) reference these local files. Refresh logos only when a mark changes — not every morning.

## Serving

From this directory: `python3 -m http.server 8765 --bind 127.0.0.1`  
Open `http://127.0.0.1:8765/`.

## Get it daily (Instinct / Muse)

The **Get it daily** button on Today (`daily.js`) builds a setup message for Instinct or Muse: a recurring task that reads `data/today.json` and sends the highlights with source links. It needs no server; it just relies on the morning routine overwriting `data/today.json`. Setup choices are remembered in the browser (`localStorage`).
