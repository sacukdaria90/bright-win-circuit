/**
 * Pure routing engine. No React, no timers — every function here takes a state
 * and returns a new one, which keeps the reducer in useCircuitGame trivial and
 * makes the win/loss rules testable in isolation.
 */

import { Level } from './levels';
import { MAX_MISTAKES, MAX_UNDO } from '../constants/config';

export type Phase = 'routing' | 'won' | 'lost';

export type GameState = {
  level: Level;
  /** owner pair index per cell, -1 when the cell is still dark. */
  owner: number[];
  /** the route laid so far for each pair (always starts at one of its emitters). */
  routes: number[][];
  solved: boolean[];
  activePair: number;
  movesLeft: number;
  movesUsed: number;
  mistakes: number;
  hintsLeft: number;
  /** last cell laid or removed, drives the head-pulse animation. */
  lastTouched: number;
  undoDepth: number;
  phase: Phase;
  /** bumped on every rejected tap so the view can replay the shake. */
  errorToken: number;
  errorCell: number;
};

export type TapKind = 'extend' | 'retract' | 'start' | 'close' | 'reject';
export type TapResult = { state: GameState; kind: TapKind };

function emitters(level: Level): Map<number, number> {
  const map = new Map<number, number>();
  level.pairs.forEach((p, i) => {
    map.set(p.solution[0], i);
    map.set(p.solution[p.solution.length - 1], i);
  });
  return map;
}

export function emitterMap(level: Level): Map<number, number> {
  return emitters(level);
}

export function createState(level: Level, hints: number): GameState {
  const owner = new Array(level.cells).fill(-1);
  const routes: number[][] = level.pairs.map((p, i) => {
    owner[p.solution[0]] = i;
    owner[p.solution[p.solution.length - 1]] = i;
    return [p.solution[0]];
  });
  return {
    level,
    owner,
    routes,
    solved: level.pairs.map(() => false),
    activePair: -1,
    movesLeft: level.movesBudget,
    movesUsed: 0,
    mistakes: 0,
    hintsLeft: hints,
    lastTouched: -1,
    undoDepth: 0,
    phase: 'routing',
    errorToken: 0,
    errorCell: -1,
  };
}

export function adjacent(cols: number, a: number, b: number): boolean {
  const dr = Math.abs(Math.floor(a / cols) - Math.floor(b / cols));
  const dc = Math.abs((a % cols) - (b % cols));
  return dr + dc === 1;
}

function clone(s: GameState): GameState {
  return {
    ...s,
    owner: s.owner.slice(),
    routes: s.routes.map(r => r.slice()),
    solved: s.solved.slice(),
  };
}

function boardFull(s: GameState): boolean {
  for (let i = 0; i < s.owner.length; i++) {
    if (s.owner[i] < 0) {
      return false;
    }
  }
  return true;
}

export function allSolved(s: GameState): boolean {
  return s.solved.every(Boolean);
}

export function litCells(s: GameState): number {
  let n = 0;
  for (let i = 0; i < s.owner.length; i++) {
    if (s.owner[i] >= 0) {
      n++;
    }
  }
  return n;
}

function settle(s: GameState): GameState {
  if (allSolved(s) && boardFull(s)) {
    s.phase = 'won';
    s.activePair = -1;
    return s;
  }
  if (s.mistakes >= MAX_MISTAKES || s.movesLeft <= 0) {
    s.phase = 'lost';
    s.activePair = -1;
  }
  return s;
}

function reject(prev: GameState, cell: number): TapResult {
  const s = clone(prev);
  s.mistakes = s.mistakes + 1;
  s.errorToken = s.errorToken + 1;
  s.errorCell = cell;
  return { state: settle(s), kind: 'reject' };
}

function closeOn(prev: GameState, cell: number): TapResult {
  const active = prev.activePair;
  const route = prev.routes[active];
  const head = route[route.length - 1];
  if (!adjacent(prev.level.cols, head, cell)) {
    return reject(prev, cell);
  }
  const s = clone(prev);
  s.routes[active].push(cell);
  s.owner[cell] = active;
  s.solved[active] = true;
  s.movesUsed = s.movesUsed + 1;
  s.movesLeft = s.movesLeft - 1;
  s.lastTouched = cell;
  s.activePair = -1;
  s.undoDepth = 0;
  return { state: settle(s), kind: 'close' };
}

/**
 * The single entry point for every board tap.
 * - tapping an emitter selects its pair (either end may be the start)
 * - tapping the partner emitter next to the head closes the pair
 * - tapping an empty neighbour of the head extends the wire
 * - tapping the cell behind the head retracts it for free
 * - anything else costs a mistake
 */
export function tapCell(prev: GameState, cell: number): TapResult {
  if (prev.phase !== 'routing') {
    return { state: prev, kind: 'reject' };
  }

  const level = prev.level;
  const cols = level.cols;
  const ends = emitters(level);
  const endOwner = ends.has(cell) ? (ends.get(cell) as number) : -1;
  const active = prev.activePair;

  // The partner emitter of the pair currently being routed closes it.
  if (endOwner >= 0 && endOwner === active && !prev.solved[active]) {
    const route = prev.routes[active];
    if (cell !== route[0]) {
      return closeOn(prev, cell);
    }
  }

  // Any other emitter selects its own pair.
  if (endOwner >= 0) {
    const s = clone(prev);
    s.activePair = endOwner;
    s.undoDepth = 0;
    if (!s.solved[endOwner] && s.routes[endOwner].length <= 1) {
      // Either end can be the starting emitter — anchor the route on the tap.
      s.routes[endOwner] = [cell];
      s.owner[cell] = endOwner;
      const pair = level.pairs[endOwner];
      s.owner[pair.solution[0]] = endOwner;
      s.owner[pair.solution[pair.solution.length - 1]] = endOwner;
    }
    s.lastTouched = cell;
    return { state: s, kind: 'start' };
  }

  if (active < 0 || prev.solved[active]) {
    return reject(prev, cell);
  }

  const route = prev.routes[active];
  const head = route[route.length - 1];

  // Retract: tapping the cell directly behind the head is a free correction.
  if (route.length >= 2 && cell === route[route.length - 2]) {
    const s = clone(prev);
    const dropped = s.routes[active].pop() as number;
    if (!ends.has(dropped)) {
      s.owner[dropped] = -1;
    }
    s.lastTouched = cell;
    s.undoDepth = Math.max(0, s.undoDepth - 1);
    return { state: s, kind: 'retract' };
  }

  if (!adjacent(cols, head, cell) || prev.owner[cell] >= 0) {
    return reject(prev, cell);
  }

  const s = clone(prev);
  s.routes[active].push(cell);
  s.owner[cell] = active;
  s.movesUsed = s.movesUsed + 1;
  s.movesLeft = s.movesLeft - 1;
  s.lastTouched = cell;
  s.undoDepth = Math.min(s.undoDepth + 1, MAX_UNDO);
  return { state: settle(s), kind: 'extend' };
}

export function undo(prev: GameState): GameState {
  if (prev.phase !== 'routing' || prev.activePair < 0) {
    return prev;
  }
  const active = prev.activePair;
  if (prev.routes[active].length < 2) {
    return prev;
  }
  const s = clone(prev);
  const ends = emitters(s.level);
  const dropped = s.routes[active].pop() as number;
  if (!ends.has(dropped)) {
    s.owner[dropped] = -1;
  }
  s.solved[active] = false;
  s.movesUsed = Math.max(0, s.movesUsed - 1);
  s.movesLeft = s.movesLeft + 1;
  s.undoDepth = Math.max(0, s.undoDepth - 1);
  s.lastTouched = s.routes[active][s.routes[active].length - 1];
  return s;
}

export function stars(s: GameState): number {
  if (s.phase !== 'won') {
    return 0;
  }
  const min = s.level.minSegments;
  if (s.mistakes === 0 && s.movesUsed <= Math.ceil(min * 1.1)) {
    return 3;
  }
  if (s.movesUsed <= Math.ceil(min * 1.35)) {
    return 2;
  }
  return 1;
}
