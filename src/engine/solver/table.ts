import { STATE_COUNT } from "./core";

/**
 * The precomputed value table: V(state) for every state, as 16-bit fixed
 * point (value * SCALE, i.e. 0.01-point resolution) behind a 16-byte header.
 * Built offline by `scripts/build-solver-table.ts`; served as a static file.
 */
export interface SolverTable {
  /** Expected additional points from the state at `index` (see core.ts stateIndex). */
  value(index: number): number;
}

export const TABLE_SCALE = 100;
const MAGIC = "YZV1";
const HEADER_BYTES = 16;

/** Where the browser fetches the table from (override the prefix for sub-path hosting). */
export const SOLVER_TABLE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/solver/yahtzee-values.bin`;

export function encodeSolverTable(values: ArrayLike<number>): Uint8Array {
  if (values.length !== STATE_COUNT)
    throw new Error(`Expected ${STATE_COUNT} values`);
  const bytes = new Uint8Array(HEADER_BYTES + STATE_COUNT * 2);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < 4; i++) bytes[i] = MAGIC.charCodeAt(i);
  view.setUint32(4, TABLE_SCALE, true);
  view.setUint32(8, STATE_COUNT, true);
  for (let i = 0; i < STATE_COUNT; i++) {
    const fixed = Math.round(values[i] * TABLE_SCALE);
    if (fixed < 0 || fixed > 0xffff)
      throw new Error(`Value ${values[i]} at ${i} doesn't fit in 16 bits`);
    view.setUint16(HEADER_BYTES + i * 2, fixed, true);
  }
  return bytes;
}

/** Validates the header (so a 404 page or stale file fails loudly) and wraps the data. */
export function decodeSolverTable(buffer: ArrayBuffer): SolverTable {
  if (buffer.byteLength < HEADER_BYTES)
    throw new Error("Solver table is too small");
  const view = new DataView(buffer);
  const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
  const scale = view.getUint32(4, true);
  const count = view.getUint32(8, true);
  if (magic !== MAGIC) throw new Error("Not a solver table (bad header)");
  if (count !== STATE_COUNT || buffer.byteLength !== HEADER_BYTES + count * 2) {
    throw new Error("Solver table has the wrong size");
  }
  // Uint16Array reads in platform byte order; every browser/Node target is little-endian.
  const data = new Uint16Array(buffer, HEADER_BYTES, count);
  return { value: (index) => data[index] / scale };
}

// ---- loading (browser) ------------------------------------------------------
let loaded: SolverTable | null = null;
let pending: Promise<SolverTable> | null = null;

/** The table if it has already been loaded, otherwise null. */
export const getLoadedSolverTable = (): SolverTable | null => loaded;

/** Fetches the table once and caches it; safe to call repeatedly. Retries after a failure. */
export function loadSolverTable(): Promise<SolverTable> {
  if (loaded) return Promise.resolve(loaded);
  if (!pending) {
    pending = fetch(SOLVER_TABLE_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then((buffer) => (loaded = decodeSolverTable(buffer)))
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}

/** Forget any loaded table (used by tests). */
export function clearSolverTable(): void {
  loaded = null;
  pending = null;
}

/** Install an already-fetched table (used by tests and server-side tooling). */
export function primeSolverTable(buffer: ArrayBuffer): SolverTable {
  loaded = decodeSolverTable(buffer);
  return loaded;
}
