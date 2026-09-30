# Public leaderboard discovery and design

The ranking implementation was not deleted. `/leaderboard`, XP calculation,
three rolling periods and privacy preferences remain present. The old Home
certificate component linked to it, but the active editorial Home did not.

Public discovery now follows the passport journey: Home's closing section beside
Digital Passport, footer, authenticated account menu, passport header, and profile
XP section. The original primary navbar is preserved. These are links only; Home
does not fetch rankings or add a heavyweight widget.

The ranking page uses Home's copper/forest palette, editorial heading and calm
spacing with readable list rows. Rank numerals remain visible including the top
three. Long public names wrap, current-user rows have a text badge, mobile rows
include level/stamps/badges, and period controls announce the selected period and
returned row count. 7-day and 30-day labels are rolling windows, not calendar
week/month labels. The display remains capped at 100 entries per period.

The public list still includes only opted-in participants and public DTO fields.
Private accounts remain excluded. No tourist/provider IDs, history or photos are
added to ranking output. Both private/public participants can reach visibility
settings; unavailable service stays distinct from an empty period. No consent,
database, query or scoring changes are part of this UI delivery.

Scoped skeletons stream while data loads; short color transitions honor reduced
motion. No new dependencies or image requests are introduced. Browser fixtures
use synthetic names/XP and never contact production or mutate accounts.
