/**
 * Builds public/solver/yahtzee-values.bin - the value of every Yahtzee game
 * state under optimal play. Run it only if you change the scoring rules in
 * src/engine/score.ts or src/engine/sheet.ts (the committed file is already built):
 *
 *   npx tsx scripts/build-solver-table.ts
 *
 * Takes a few minutes. Top-down with memoisation, so only states that can
 * actually occur in a game are computed.
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import {
  ALL_USED,
  STATE_COUNT,
  computeStateValue,
  createTurnBuffers,
  stateIndex,
  type TurnBuffers,
} from "@/engine/solver/core";
import { encodeSolverTable } from "@/engine/solver/table";

const OUTPUT = resolve(process.cwd(), "public/solver/yahtzee-values.bin");

const values = new Float32Array(STATE_COUNT);
const done = new Uint8Array(STATE_COUNT);
// One scratch set per recursion depth (= boxes already filled), because a state's
// computation recurses into states one box further on while its buffers are in use.
const buffers: TurnBuffers[] = Array.from({ length: 14 }, createTurnBuffers);
const popcount = (n: number) => { let c = 0; for (; n; n &= n - 1) c++; return c; };

let computed = 0;
const started = Date.now();

function lookup(index: number): number {
  return solve(index >> 7, (index >> 1) & 63, index & 1);
}

function solve(used: number, upper: number, yz: number): number {
  if (used === ALL_USED) return 0;
  const index = stateIndex(used, upper, yz);
  if (done[index]) return values[index];
  const v = computeStateValue(used, upper, yz, lookup, buffers[popcount(used)]);
  values[index] = v;
  done[index] = 1;
  if (++computed % 25000 === 0) {
    const seconds = Math.round((Date.now() - started) / 1000);
    console.log(`  ${computed} states solved (${seconds}s)`);
  }
  return v;
}

const start = solve(0, 0, 0);
console.log(`Solved ${computed} reachable states in ${Math.round((Date.now() - started) / 1000)}s`);
console.log(`Expected score of a new game under optimal play: ${start.toFixed(4)}`);

const bytes = encodeSolverTable(values);
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, bytes);
console.log(`Wrote ${OUTPUT} (${(bytes.length / 1e6).toFixed(2)} MB)`);
