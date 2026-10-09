import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import ScreenBackground from '../components/ScreenBackground';
import CircuitBoard, { boardMetrics } from '../components/CircuitBoard';
import ControlsBar from '../components/ControlsBar';
import TutorialOverlay from '../components/TutorialOverlay';
import { useCircuitGame, RoundSummary } from '../hooks/useCircuitGame';
import { useIdleBackstop } from '../hooks/useIdleBackstop';
import { LOSS_HOLD_MS, TUTORIAL_AUTO_DISMISS_MS, WIN_HOLD_MS } from '../constants/config';

type Props = {
  levelId: number;
  onFinish: (summary: RoundSummary) => void;
  onBack: () => void;
};

const BLOOM_IDLE = 0.25;
const BLOOM_FLASH = 0.62;

export default function GameScreen({ levelId, onFinish, onBack }: Props) {
  const game = useCircuitGame(levelId);
  const { level, state, tap, undo, hint, restart, autoSolve, summary } = game;

  const [bloom, setBloom] = useState<number>(BLOOM_IDLE);
  const [tutorialStep, setTutorialStep] = useState<1 | 2 | 0>(levelId === 1 ? 1 : 0);
  const [boardOrigin, setBoardOrigin] = useState<{ x: number; y: number } | null>(null);

  const shake = useRef(new Animated.Value(0)).current;
  const boardRef = useRef<any>(null);
  const assistedRef = useRef<boolean>(false);
  const hintedRef = useRef<boolean>(false);
  const finishedRef = useRef<boolean>(false);

  const { tile } = boardMetrics(level.cols);

  // ── failsafe ────────────────────────────────────────────────────────────
  // A routing puzzle has no clock of its own, so an untouched board would sit
  // there forever. The backstop finishes it from the stored solution and
  // scores it as an assisted single-star win.
  const fire = useCallback(() => {
    if (finishedRef.current) {
      return;
    }
    assistedRef.current = true;
    autoSolve();
  }, [autoSolve]);

  const { bump, rearm } = useIdleBackstop(fire, state.phase === 'routing');

  // ── board input ─────────────────────────────────────────────────────────
  const handleCellTap = useCallback(
    (cell: number) => {
      const kind = tap(cell);
      bump();

      if (kind === 'reject') {
        Animated.sequence([
          Animated.timing(shake, { toValue: 1, duration: 70, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -1, duration: 70, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 70, useNativeDriver: true }),
        ]).start();
        return;
      }

      if (kind === 'close') {
        setBloom(BLOOM_FLASH);
        setTimeout(() => setBloom(BLOOM_IDLE), 500);
      }

      if (tutorialStep === 1) {
        setTutorialStep(2);
      } else if (tutorialStep === 2) {
        setTutorialStep(0);
      }
    },
    [bump, shake, tap, tutorialStep],
  );

  const handleHint = useCallback(() => {
    if (hint()) {
      hintedRef.current = true;
      bump();
      setBloom(BLOOM_FLASH);
      setTimeout(() => setBloom(BLOOM_IDLE), 500);
    }
  }, [bump, hint]);

  const handleRestart = useCallback(() => {
    restart();
    assistedRef.current = false;
    hintedRef.current = false;
    setBloom(BLOOM_IDLE);
    // A restart must re-arm the failsafe from zero, never leave it disarmed.
    rearm();
  }, [rearm, restart]);

  const handleUndo = useCallback(() => {
    undo();
    bump();
  }, [bump, undo]);

  // ── round resolution ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'routing' || finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    const won = state.phase === 'won';
    const hold = won ? WIN_HOLD_MS : LOSS_HOLD_MS;
    if (won) {
      setBloom(BLOOM_FLASH);
    }
    const timer = setTimeout(() => {
      const result = summary();
      let awarded = result.stars;
      if (assistedRef.current) {
        awarded = Math.min(awarded, 1);
      } else if (hintedRef.current) {
        awarded = Math.min(awarded, 2);
      }
      onFinish({ ...result, stars: awarded });
    }, hold);
    return () => clearTimeout(timer);
  }, [onFinish, state.phase, summary]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  // The coach marks are a nudge, not a gate: they retire on their own so the
  // board is never left obscured for a player who simply reads them.
  useEffect(() => {
    if (tutorialStep === 0) {
      return;
    }
    const timer = setTimeout(() => setTutorialStep(0), TUTORIAL_AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [tutorialStep]);

  // ── tutorial anchor ─────────────────────────────────────────────────────
  const measureBoard = useCallback(() => {
    const node = boardRef.current;
    if (!node) {
      return;
    }
    node.measureInWindow((x: number, y: number) => setBoardOrigin({ x, y }));
  }, []);

  const firstPair = level.pairs[0];
  const targetCell = tutorialStep === 1 ? firstPair.solution[0] : firstPair.solution[1];
  const tutorialTarget =
    boardOrigin !== null
      ? {
          x: boardOrigin.x + 8 + ((targetCell % level.cols) + 0.5) * tile,
          y: boardOrigin.y + 8 + (Math.floor(targetCell / level.cols) + 0.5) * tile,
        }
      : null;

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });
  const pips: number[] = [0, 1, 2];
  const goal =
    'LINK ' + String(level.pairs.length) + ' PAIRS - FILL ' + String(level.cells) + ' CELLS';

  return (
    <ScreenBackground variant="game">
      <ScreenHeader
        solid
        title={'LEVEL ' + String(level.id)}
        subtitle={goal}
        onBack={onBack}
        rightSlot={
          <View style={styles.moveBlock}>
            <Text style={styles.moveValue}>{String(state.movesLeft)}</Text>
            <Text style={styles.moveCaption}>MOVES</Text>
            <View style={styles.pips}>
              {pips.map(i => (
                <View
                  key={i}
                  style={[
                    styles.pip,
                    {
                      backgroundColor:
                        i < state.mistakes ? theme.colors.danger : 'rgba(247,242,233,0.20)',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        }
      />

      <View style={styles.area}>
        <Animated.View
          ref={boardRef}
          onLayout={measureBoard}
          style={[styles.boardWrap, { transform: [{ translateX }] }]}
          pointerEvents="box-none">
          <CircuitBoard
            state={state}
            onCellTap={handleCellTap}
            bloom={bloom}
            locked={state.phase !== 'routing'}
          />
        </Animated.View>

        <View style={styles.statusRow} pointerEvents="none">
          <Text style={styles.statusText}>
            {state.activePair >= 0
              ? 'ROUTING - TAP AN ADJACENT CELL'
              : 'TAP A GLOWING NODE TO BEGIN'}
          </Text>
          <Text style={styles.statusCount}>
            {String(game.lit) + ' / ' + String(level.cells) + ' LIT'}
          </Text>
        </View>
      </View>

      <ControlsBar
        hints={state.hintsLeft}
        canUndo={state.activePair >= 0 && state.routes[state.activePair].length > 1}
        onUndo={handleUndo}
        onHint={handleHint}
        onRestart={handleRestart}
      />

      {tutorialStep !== 0 && tutorialTarget !== null ? (
        <TutorialOverlay
          step={tutorialStep}
          target={tutorialTarget}
          tile={tile}
          onSkip={() => setTutorialStep(0)}
        />
      ) : null}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, paddingTop: 18 },
  boardWrap: { alignSelf: 'center' },
  statusRow: { marginTop: 22, alignItems: 'center' },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: 'rgba(47,197,204,0.9)',
  },
  statusCount: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.textFaint,
    fontVariant: ['tabular-nums'],
  },
  moveBlock: { alignItems: 'flex-end' },
  moveValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.accent,
    fontVariant: ['tabular-nums'],
  },
  moveCaption: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: theme.colors.textFaint,
  },
  pips: { flexDirection: 'row', gap: 4, marginTop: 5 },
  pip: { width: 8, height: 8, borderRadius: 4 },
});
