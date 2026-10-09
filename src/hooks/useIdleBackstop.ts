import { useCallback, useEffect, useRef } from 'react';
import { IDLE_FLOOR_MS, IDLE_TAP_MS, IDLE_TICK_MS } from '../constants/config';

/**
 * No-input failsafe for a long-form puzzle.
 *
 * The round must always produce a result frame, even if nobody ever touches
 * the board. Two clocks guard that:
 *   - a MOUNT-relative floor, so the backstop can never fire before the screen
 *     has been alive long enough for a first screenshot to exist;
 *   - a per-tap window, re-armed on every valid interaction.
 * The effective fire time is max(mount + floor, lastTap + tapWindow): a tap can
 * push the deadline out, never cancel it.
 */
export function useIdleBackstop(onFire: () => void, enabled: boolean) {
  const mountedAt = useRef<number>(Date.now());
  const lastTapAt = useRef<number>(Date.now());
  const firedRef = useRef<boolean>(false);
  const fireRef = useRef(onFire);
  fireRef.current = onFire;

  const bump = useCallback(() => {
    lastTapAt.current = Date.now();
  }, []);

  /** RESTART must re-arm the failsafe from scratch, never leave it disarmed. */
  const rearm = useCallback(() => {
    mountedAt.current = Date.now();
    lastTapAt.current = Date.now();
    firedRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = setInterval(() => {
      if (firedRef.current) {
        return;
      }
      const now = Date.now();
      const deadline = Math.max(mountedAt.current + IDLE_FLOOR_MS, lastTapAt.current + IDLE_TAP_MS);
      if (now >= deadline) {
        firedRef.current = true;
        fireRef.current();
      }
    }, IDLE_TICK_MS);
    return () => clearInterval(timer);
  }, [enabled]);

  return { bump, rearm };
}
