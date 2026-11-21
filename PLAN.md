# Dice Duel: Online Versus & Accounts Plan

High-level plan only. Pricing and free-tier limits change, so re-check Cloudflare's
current docs before committing to anything.

## Goals

| Stage | Outcome |
| --- | --- |
| **1** | Two people play a 1v1 game over the internet via a share link. Dice rolls are generated on the server. No accounts, no database. |
| **2** | Finished games are saved to Cloudflare D1, enabling accounts, game history and leaderboards. |

---

## Stage 1: Online 1v1 on Cloudflare Durable Objects

### Architecture

```
Browser A ──┐                      ┌── Worker (router)
            ├── HTTPS / WebSocket ─┤      POST /api/rooms         -> create room, return id
Browser B ──┘                      │      GET  /api/rooms/:id/ws  -> upgrade, forward to the room
                                   └── GameRoom Durable Object (one per room)
                                          owns state, validates moves, rolls dice
```

- **Worker:** stateless entry point. Creates room IDs, checks the request origin, rate-limits
  room creation, and forwards WebSocket upgrades to the right `GameRoom`.
- **`GameRoom` Durable Object:** one instance per room. It is the only source of truth.
  Clients send *intents*; the server decides what happens and broadcasts the result.

### Repo layout

Simplest start: add a `server/` folder with its own `wrangler.toml`, importing the pure game
code from `src/` through a path alias. Promote to a monorepo (`apps/web`, `apps/server`,
`packages/shared`) later if it gets awkward.

Shared with the server (pure, no React): `engine/score.ts`, `engine/sheet.ts`, `types/*`, and a
new `protocol.ts` defining the messages. **Do not** import the bot solver or its tables into the
Worker; it isn't needed.

### `GameRoom` state

- `phase`: `waiting` | `playing` | `finished`
- `players[2]`: seat, private `playerId`, display name, `diceId` theme, connected flag
- `turnSeat`, `dice`, `rollsUsed`
- `sheets[2]`: score sheets (reuse `createEmptyScoreSheet` / `applyScore`)
- `turns[2]`: recorded turns (for history later)
- `createdAt`, `lastActivityAt`

Persist this to the Durable Object's own storage after every action. Objects can be evicted
from memory, and WebSocket hibernation depends on state surviving that.

### Protocol

| Direction | Message | Notes |
| --- | --- | --- |
| client → server | `join { playerId, name, diceId }` | Claims a seat (or rejoins one) |
| client → server | `roll { keepMask }` | Server rolls the non-kept dice |
| client → server | `score { category }` | Server scores and passes the turn |
| server → client | `state { ...snapshot }` | Full state on join and after every change |
| server → client | `rolled { dice, by }` | Lets the client animate the result |
| server → client | `error { reason }` | Rejected move |

Server-side checks on every message: it's that seat's turn, rolls remain (max 3), the keep mask
is only used after the first roll, and the category is still open. Dice come from
`crypto.getRandomValues`, never from the client.

### Identity and seats

- Each browser generates an anonymous `playerId` (localStorage) and sends it on join.
- **Keep `playerId` private.** Broadcast only seat, name and theme, never the other player's
  ID, so nobody can impersonate a seat.
- Room full means a third connection is rejected (no spectators in v1).

### Room lifecycle

1. Creator hits "Play Online", gets `/room/abc123` and a copy-link button, and waits.
2. Second player opens the link and takes seat 2. The game starts.
3. **Disconnect:** hold the seat for a grace period (Durable Object alarm). If the player
   doesn't return, the game is forfeited.
4. **Finished or abandoned:** an alarm deletes the room's storage after a short TTL.

### Frontend changes

- New menu entry **Play Online**, plus a waiting/lobby screen with the share link.
- New `useOnlineGame` hook that exposes the same shape `GameView` already consumes from
  `useGameSession` (tray, score sheets, `isOpponentTurn`, `score`, ...), so the dice, score card
  and theme-swap code are reused.
- Dice animations are driven by incoming `rolled` events, not local randomness.
- Each player's `diceId` is sent on join, so the existing "your dice on your turn, theirs on
  theirs" behaviour carries over.
- Add an `online` matchup kind. The bot-specific panel (mood, chat) needs a simpler
  human-opponent version.
- Achievements keep working client-side, fed by the same `onProgress` snapshot.

### Frontend hosting

The app currently has no server routes, so a static export (`output: "export"`) should be
possible. Verify that the custom webpack rule for `.mp3` files and the `public/` images still
work with it.

| Option | Notes |
| --- | --- |
| **Cloudflare static hosting** (Pages / Workers static assets; check which is currently recommended) | Everything on one platform, easiest to keep the site and API on the same domain. **Recommended.** |
| **Vercel** for the Next app + Worker on a subdomain | Also fine. Cross-origin WebSockets work; just keep both on one parent domain so Stage 2 cookies work. |

Use a custom domain with the site at `example.com` and the API at `api.example.com` (or a
path route), and have the Worker check the `Origin` header on WebSocket upgrades.

### Local dev and deploy

- `wrangler dev` for the Worker and Durable Object, `next dev` for the front end, with the
  client's server URL set by environment variable.
- `wrangler deploy` for the server; deploy the front end through the chosen host's Git
  integration.

### Free-tier notes

The free plan only supports SQLite-backed Durable Objects and has daily request limits. Exceeding
them makes operations fail rather than billing you. A game is on the order of 100 inbound
messages, so watch usage if it takes off. The paid plan is a low flat monthly fee if needed.
Use the **WebSocket Hibernation API** so idle rooms don't consume compute.

### Out of scope for Stage 1

Accounts, matchmaking, spectators, turn timers, rematch, chat, and persistent history.

### Done when

- [ ] Two browsers on different networks complete a full 13-turn game via a share link
- [ ] All rolls are server-generated and moves are validated server-side
- [ ] A refresh or short disconnect rejoins the same seat with state intact
- [ ] A third visitor is rejected; abandoned rooms clean themselves up
- [ ] Deployed to a real domain on the free plan

---

## Stage 2: D1 database, accounts, history, leaderboards

### Principle

Durable Objects keep running **live** games. D1 stores **permanent records**. The live game
code doesn't change; the room just writes one result when a game ends.

### Setup

- Create a D1 database, bind it to the Worker/Durable Object in `wrangler.toml`.
- Manage the schema with D1 migrations (`wrangler d1 migrations`), checked into the repo.

### Schema (starting point)

| Table | Key columns |
| --- | --- |
| `players` | `id` (the anonymous playerId), `account_id` (nullable), `display_name`, `created_at` |
| `accounts` | Owned by the chosen auth solution (see below) |
| `games` | `id`, `started_at`, `finished_at`, `winner_seat` (null for a tie), `forfeit` |
| `game_players` | `game_id`, `seat`, `player_id`, `final_score`, `upper_bonus`, `yahtzee_bonus`, `dice_theme` |
| `game_turns` | `game_id`, `seat`, `turn_index`, recorded turn as JSON (enables replays, server-side achievements) |
| `player_stats` | `player_id`, `games`, `wins`, `best_score`, optional rating; updated on each game end for fast leaderboards |

Index on `player_stats` ranking columns and on `game_players(player_id, game_id)` for history
lookups.

### Writing results from the Durable Object

1. When the game finishes (or is forfeited), build a single **`GameResult`** object.
2. Write `games`, `game_players`, `game_turns` and the `player_stats` updates in **one
   `DB.batch()`** so they succeed or fail together.
3. Make it **idempotent**: key on the game ID and use insert-or-ignore, so a retry can't
   double-count.
4. If D1 is unavailable, keep the result in the Durable Object's storage and retry from an
   alarm. Delete the room only after the write succeeds.

### Accounts

- Use an auth service or library rather than building login yourself. Pick one that works on
  Cloudflare and can store users in D1 or its own backend.
- Guests can still play. The anonymous `playerId` keeps working, and games are stored against
  it from day one.
- **On sign-up/sign-in:** link the current `playerId` to the account (`players.account_id`),
  and merge any earlier guest games.
- The session cookie must be readable by the Worker (same parent domain), which then passes
  the verified account to the room when joining.

### New API and UI

- Worker endpoints: `GET /api/leaderboard`, `GET /api/me/games`, `GET /api/games/:id`.
- Front end: **History**, **Leaderboard** and **Profile/Sign-in** screens, with menu icons
  next to the existing trophy and settings buttons.
- Cache leaderboard responses briefly to protect the D1 read quota.

### Trust and ranking

- Only **online** games, computed entirely server-side, count towards leaderboards.
- Solo and bot games stay local and are unranked, since a client can report anything.
- Achievements for signed-in players should move server-side over time (derivable from
  `game_turns`). Treat the existing localStorage achievements as a one-time, unverified import.

### Open decisions

- Which auth provider, and whether to support social login
- What ranks the leaderboard: wins, best score, or a rating system
- How long to keep `game_turns` (replays vs storage use)
- Display-name rules and moderation

### Done when

- [ ] Finished online games appear in the signed-in player's history
- [ ] A guest who signs up keeps their earlier games
- [ ] Leaderboard shows server-computed stats, and a failed DB write is retried, not lost
- [ ] Migrations run cleanly from empty on a fresh D1 database
