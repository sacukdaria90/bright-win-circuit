import { useCallback, useMemo, useRef, useState } from 'react';
import { getLevel } from '../game/levels';
import {
  GameState,
  TapKind,
  createState,
  stars as scoreStars,
  litCells,
  tapCell,
  undo as undoMove,
} from '../game/engine';
import { nextUnsolvedPair, solveAll, solvePair } from '../game/solver';
import { HINTS_PER_LEVEL, HINT_MOVE_COST } from '../constants/config';

export type RoundSummary = {
  won: boolean;
  stars: number;
  movesUsed: number;
  mistakes: number;
  seconds: number;
  levelId: number;
};

/**
 * Round controller. The whole board lives in ONE state object so screens pull
 * exactly the slices they draw instead of subscribing to a bag of booleans,
 * and a mirror ref keeps the latest state reachable from animation callbacks
 * and timers without re-arming them on every render.
 */
export function useCircuitGame(levelId: number) {
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const [state, setState] = useState<GameState>(() => createState(level, HINTS_PER_LEVEL));
  const [lastKind, setLastKind] = useState<TapKind>('start');
  const stateRef = useRef<GameState>(state);
  const startedAt = useRef<number>(Date.now());

  const commit = useCallback((next: GameState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const tap = useCallback(
    (cell: number) => {
      const result = tapCell(stateRef.current, cell);
      setLastKind(result.kind);
      commit(result.state);
      return result.kind;
    },
    [commit],
  );

  const undo = useCallback(() => {
    commit(undoMove(stateRef.current));
    setLastKind('retract');
  }, [commit]);

  const hint = useCallback(() => {
    const cur = stateRef.current;
    if (cur.phase !== 'routing' || cur.hintsLeft <= 0) {
      return false;
    }
    const target = nextUnsolvedPair(cur);
    if (target < 0) {
      return false;
    }
    const laid = solvePair(cur, target);
    const spent = Math.min(HINT_MOVE_COST, laid.movesLeft);
    const next: GameState = {
      ...laid,
      hintsLeft: cur.hintsLeft - 1,
      movesLeft: laid.movesLeft - spent,
      movesUsed: laid.movesUsed + spent,
    };
    const full = next.owner.every(o => o >= 0);
    commit(next.solved.every(Boolean) && full ? { ...next, phase: 'won' } : next);
    setLastKind('close');
    return true;
  }, [commit]);

  const restart = useCallback(() => {
    startedAt.current = Date.now();
    commit(createState(level, HINTS_PER_LEVEL));
    setLastKind('start');
  }, [commit, level]);

  /** Idle backstop escape hatch: finish the board from the stored solution. */
  const autoSolve = useCallback(() => {
    commit(solveAll(stateRef.current));
    setLastKind('close');
  }, [commit]);

  const summary = useCallback((): RoundSummary => {
    const cur = stateRef.current;
    return {
      won: cur.phase === 'won',
      stars: scoreStars(cur),
      movesUsed: cur.movesUsed,
      mistakes: cur.mistakes,
      seconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      levelId: cur.level.id,
    };
  }, []);

  return {
    level,
    state,
    stateRef,
    lastKind,
    lit: litCells(state),
    tap,
    undo,
    hint,
    restart,
    autoSolve,
    summary,
  };
}
