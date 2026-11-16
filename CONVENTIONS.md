# Conventions

Formatting is enforced by Prettier (`.prettierrc.json`): run
`npx prettier --write "src/**/*.{ts,tsx,css}"` before committing. Don't hand-format
and don't run Prettier on `src/data/**/*.json` (recordings use a custom layout).

## Naming

| What | Style | Example |
| --- | --- | --- |
| React components, views | `PascalCase.tsx`, default export | `components/ScoreCard.tsx` |
| Hooks | `useCamelCase.ts`, named export | `hooks/usePlayerGame.ts` |
| Type files | `PascalCase.ts`, named after the main type | `types/Matchup.ts` |
| Engine / constants | single lowercase word, else `camelCase.ts` | `engine/score.ts` |
| Data files (themes, recordings) | `kebab-case` | `themes/midnight-neon.ts` |
| Variables, functions, props, object keys, string-union values | `camelCase` | `threeOfAKind` |
| Types, interfaces | `PascalCase` | `ScoreSheet` |
| Constants | `UPPER_SNAKE_CASE` | `TURNS_PER_GAME` |
| Next.js route files | what Next requires | `app/page.tsx` |

No `snake_case` identifiers or serialized values: recordings use the same
camelCase category names as the code.

## Structure

- `app/page.tsx` stays thin. Screens live in `views/`, reusable UI in `components/`.
- Game rules and solver code live in `engine/` and must not import React.
- Per-game state belongs in the game view (remount with a new `key` to reset).
  Only settings that outlive a game (dice theme, high score) live at the top.
- Type-only imports use `import type`.
- No commented-out code; delete it (git remembers).
