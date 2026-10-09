/**
 * Tunables for BrightWinCircuit.
 * Timings here are read by the pipeline's screenshot gate as well as by the app,
 * so they are declared once and never duplicated inline.
 */

// Splash duration. Must stay at 8000: anything shorter races the automated
// capture window and the Loader frame is lost (workspace rule 13).
export const LOADER_DURATION_MS = 8000;

// Stepped progress bar on the loader: 12 ticks across the 8s window.
// A stepped setInterval is used on purpose instead of an 8s Animated.timing,
// because a long-running tween starves the uiautomator capture pass.
export const LOADER_STEPS = 12;
export const LOADER_STEP_MS = Math.floor(LOADER_DURATION_MS / LOADER_STEPS);
export const LOADER_FADE_MS = 260;

// Cross-screen fade.
export const SCREEN_FADE_MS = 220;

// Round rules.
export const MAX_MISTAKES = 3;
export const HINTS_PER_LEVEL = 3;
export const HINT_MOVE_COST = 2;
export const MAX_UNDO = 10;

// Idle backstop. The round can never stall: the floor is mount-relative so it
// always outlives the automated navigator's first-screenshot latency (~22s),
// and every valid tap re-arms a shorter window that can delay but never cancel it.
export const IDLE_FLOOR_MS = 26000;
export const IDLE_TAP_MS = 14000;
export const IDLE_TICK_MS = 1000;

// Resolution delays before the result screen takes over.
export const WIN_HOLD_MS = 900;
export const LOSS_HOLD_MS = 700;
export const AUTOSOLVE_STEP_MS = 90;

export const TOTAL_LEVELS = 9;

// Coach marks retire on their own so the board is never left covered.
export const TUTORIAL_AUTO_DISMISS_MS = 9000;
