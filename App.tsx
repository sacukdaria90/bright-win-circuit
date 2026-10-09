import React, { useCallback, useRef, useState } from 'react';
import { Animated, StatusBar, StyleSheet, View } from 'react-native';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import GameScreen from './src/screens/GameScreen';
import ResultScreen from './src/screens/ResultScreen';
import { RoundSummary } from './src/hooks/useCircuitGame';
import theme from './src/constants/theme';
import { SCREEN_FADE_MS, TOTAL_LEVELS } from './src/constants/config';

type Screen = 'loader' | 'menu' | 'levelSelect' | 'game' | 'result';

const EMPTY_RESULT: RoundSummary = {
  won: false,
  stars: 0,
  movesUsed: 0,
  mistakes: 0,
  seconds: 0,
  levelId: 1,
};

/**
 * Screen state machine. Deliberately a plain conditional render rather than a
 * navigator: five screens, one linear flow, and every transition is set
 * synchronously in the handler so a tap can never be swallowed by an
 * animation callback that failed to run.
 */
export default function App() {
  const [screen, setScreen] = useState<Screen>('loader');
  const [starsByLevel, setStarsByLevel] = useState<number[]>(() => new Array(TOTAL_LEVELS).fill(0));
  const [unlocked, setUnlocked] = useState<number>(1);
  const [selected, setSelected] = useState<number>(1);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [result, setResult] = useState<RoundSummary>(EMPTY_RESULT);

  const fade = useRef(new Animated.Value(1)).current;

  const go = useCallback(
    (next: Screen) => {
      setScreen(next);
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: SCREEN_FADE_MS, useNativeDriver: true }).start();
    },
    [fade],
  );

  const totalStars = starsByLevel.reduce((a, b) => a + b, 0);
  const bestStars = starsByLevel.reduce((a, b) => (b > a ? b : a), 0);
  const solvedCount = starsByLevel.reduce((a, b) => (b > 0 ? a + 1 : a), 0);

  const openLevels = useCallback(() => {
    // Always land on the first level that still needs solving.
    setSelected(prev => (prev > unlocked ? unlocked : prev));
    go('levelSelect');
  }, [go, unlocked]);

  const launchLevel = useCallback(() => {
    go('game');
  }, [go]);

  const pickLevel = useCallback(
    (level: number) => {
      setSelected(level);
    },
    [],
  );

  const finishRound = useCallback(
    (summary: RoundSummary) => {
      setResult(summary);
      if (summary.won) {
        setStarsByLevel(prev => {
          const next = prev.slice();
          const i = summary.levelId - 1;
          next[i] = Math.max(next[i], summary.stars);
          return next;
        });
        setUnlocked(prev => Math.max(prev, Math.min(TOTAL_LEVELS, summary.levelId + 1)));
      }
      go('result');
    },
    [go],
  );

  const playNext = useCallback(() => {
    const next = Math.min(TOTAL_LEVELS, result.levelId + 1);
    setSelected(next);
    go('game');
  }, [go, result.levelId]);

  const playAgain = useCallback(() => {
    setSelected(result.levelId);
    go('game');
  }, [go, result.levelId]);

  const toMenu = useCallback(() => {
    go('menu');
  }, [go]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} translucent />
      {screen === 'loader' ? (
        <LoaderScreen onDone={() => go('menu')} />
      ) : (
        <Animated.View style={[styles.root, { opacity: fade }]} pointerEvents="box-none">
          {screen === 'menu' ? (
            <MenuScreen
              currentLevel={unlocked}
              totalStars={totalStars}
              bestStars={bestStars}
              solved={solvedCount}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn(prev => !prev)}
              onLevels={openLevels}
            />
          ) : null}

          {screen === 'levelSelect' ? (
            <LevelSelectScreen
              unlocked={unlocked}
              selected={selected}
              starsByLevel={starsByLevel}
              totalStars={totalStars}
              onSelect={pickLevel}
              onLaunch={launchLevel}
              onBack={toMenu}
            />
          ) : null}

          {screen === 'game' ? (
            <GameScreen
              key={'level-' + String(selected)}
              levelId={selected}
              onFinish={finishRound}
              onBack={toMenu}
            />
          ) : null}

          {screen === 'result' ? (
            <ResultScreen
              summary={result}
              totalStars={totalStars}
              onNext={playNext}
              onAgain={playAgain}
              onMenu={toMenu}
            />
          ) : null}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
});
