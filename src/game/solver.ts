/**
 * Constructive helpers built on the level's stored solution.
 *
 * Nothing here searches at runtime: every level ships its full solution, so a
 * hint (or the idle auto-solve) can only ever move the board towards a state
 * that is still completable. That is what makes the hint safe to spam.
 */

import { GameState } from './engine';

/** Index of the next pair that still needs routing, or -1 when all are done. */
export function nextUnsolvedPair(s: GameState): number {
  for (let i = 0; i < s.solved.length; i++) {
    if (!s.solved[i]) {
      return i;
    }
  }
  return -1;
}

/**
 * Lay one whole pair from its stored solution, clearing any cells the player
 * had borrowed for it. Returns a fresh state; the caller owns the animation.
 */
export function solvePair(s: GameState, pairIndex: number): GameState {
  if (pairIndex < 0 || pairIndex >= s.level.pairs.length) {
    return s;
  }
  const owner = s.owner.slice();
  const routes = s.routes.map(r => r.slice());
  const solved = s.solved.slice();
  const target = s.level.pairs[pairIndex].solution;

  // Release every cell this pair had claimed outside its real route.
  for (let i = 0; i < owner.length; i++) {
    if (owner[i] === pairIndex) {
      owner[i] = -1;
    }
  }
  for (const cell of target) {
    owner[cell] = pairIndex;
  }
  routes[pairIndex] = target.slice();
  solved[pairIndex] = true;

  return {
    ...s,
    owner,
    routes,
    solved,
    activePair: -1,
    lastTouched: target[target.length - 1],
    undoDepth: 0,
  };
}

/** Lay every remaining pair at once — the idle backstop's escape hatch. */
export function solveAll(s: GameState): GameState {
  let next = s;
  for (let i = 0; i < s.level.pairs.length; i++) {
    if (!next.solved[i]) {
      next = solvePair(next, i);
    }
  }
  return { ...next, phase: 'won', activePair: -1 };
}

/** The ordered list of pairs the auto-solve still has to lay. */
export function remainingPairs(s: GameState): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.solved.length; i++) {
    if (!s.solved[i]) {
      out.push(i);
    }
  }
  return out;
}
