import React, { useEffect, useRef } from 'react';
import { Animated, BackHandler, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { ChevronsRight, Home, RotateCw, Star } from 'lucide-react-native';
import theme from '../constants/theme';
import assets from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import ScreenBackground from '../components/ScreenBackground';
import NeonButton from '../components/NeonButton';
import StatCard from '../components/StatCard';
import { RoundSummary } from '../hooks/useCircuitGame';
import { TOTAL_LEVELS } from '../constants/config';

const SCREEN_W = Dimensions.get('window').width;

type Props = {
  summary: RoundSummary;
  totalStars: number;
  onNext: () => void;
  onAgain: () => void;
  onMenu: () => void;
};

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m) + ':' + (s < 10 ? '0' : '') + String(s);
}

/** Deterministic spark field — celebration without crossing any lettering. */
function Sparks({ win }: { win: boolean }) {
  const nodes: React.ReactNode[] = [];
  let seed = 19;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  if (win) {
    for (let i = 0; i < 24; i++) {
      nodes.push(
        <Circle
          key={i}
          cx={rand() * SCREEN_W}
          cy={rand() * 260}
          r={1 + rand() * 2.2}
          fill={theme.colors.accent}
          opacity={0.35 + rand() * 0.4}
        />,
      );
    }
  } else {
    nodes.push(
      <Path key="a1" d={'M 30 120 Q ' + SCREEN_W / 2 + ' 20 ' + (SCREEN_W - 30) + ' 120'} stroke={theme.colors.danger} strokeOpacity={0.28} strokeWidth={2} fill="none" />,
      <Path key="a2" d={'M 30 180 Q ' + SCREEN_W / 2 + ' 80 ' + (SCREEN_W - 30) + ' 180'} stroke={theme.colors.danger} strokeOpacity={0.18} strokeWidth={2} fill="none" />,
    );
  }
  return (
    <Svg width={SCREEN_W} height={280}>
      {nodes}
    </Svg>
  );
}

export default function ResultScreen({ summary, totalStars, onNext, onAgain, onMenu }: Props) {
  const pops = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;
  const fades = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = pops.map((v, i) =>
      Animated.parallel([
        Animated.timing(fades[i], { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(v, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      ]),
    );
    const seq = Animated.stagger(170, anims.slice(0, Math.max(1, summary.stars)));
    seq.start();
    // Unearned slots simply appear, so the row is never half-empty.
    for (let i = summary.stars; i < 3; i++) {
      fades[i].setValue(1);
      pops[i].setValue(1);
    }
    return () => seq.stop();
  }, [fades, pops, summary.stars]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onMenu();
      return true;
    });
    return () => sub.remove();
  }, [onMenu]);

  const win = summary.won;
  const hasNext = win && summary.levelId < TOTAL_LEVELS;

  return (
    <ScreenBackground variant="result">
      <View style={styles.sparks} pointerEvents="none">
        <Sparks win={win} />
      </View>

      <ScreenHeader title={'LEVEL ' + String(summary.levelId)} starCount={totalStars} />

      <View style={styles.body}>
        <Text style={[styles.verdict, { color: win ? theme.colors.accent : theme.colors.danger }]}>
          {win ? 'CIRCUIT COMPLETE' : 'CIRCUIT BROKEN'}
        </Text>
        <Text style={styles.verdictSub}>
          {win ? 'EVERY NODE IS LIT' : 'THE BOARD WENT DARK'}
        </Text>

        <View style={styles.starRow}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={{ opacity: fades[i], transform: [{ scale: pops[i] }] }}
              pointerEvents="none">
              <Star
                size={46}
                color={i < summary.stars ? theme.colors.accent : 'rgba(247,242,233,0.16)'}
                fill={i < summary.stars ? theme.colors.accent : 'transparent'}
                strokeWidth={2}
              />
            </Animated.View>
          ))}
        </View>

        <Image source={win ? assets.spriteTrophy : assets.spriteBulb} style={[styles.hero, win ? null : styles.heroDim]} />

        <View style={styles.statsRow}>
          <View style={styles.statSlot}>
            <StatCard value={String(summary.movesUsed)} label="MOVES" accent={theme.colors.primary} />
          </View>
          <View style={styles.statSlot}>
            <StatCard value={String(summary.mistakes)} label="MISTAKES" accent={theme.colors.danger} />
          </View>
          <View style={styles.statSlot}>
            <StatCard value={clock(summary.seconds)} label="TIME" accent={theme.colors.accent} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {hasNext ? (
          <NeonButton label="NEXT LEVEL" onPress={onNext} Icon={ChevronsRight} variant="primary" height={60} />
        ) : null}
        <NeonButton
          label="PLAY AGAIN"
          onPress={onAgain}
          Icon={RotateCw}
          variant="secondary"
          height={56}
          style={hasNext ? styles.spaced : null}
        />
        <NeonButton label="MENU" onPress={onMenu} Icon={Home} variant="ghost" height={48} style={styles.spaced} />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  sparks: { position: 'absolute', top: 60, left: 0 },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  verdict: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(242,201,76,0.45)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  verdictSub: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: theme.colors.textMuted,
  },
  starRow: { flexDirection: 'row', gap: 14, marginTop: 18 },
  hero: { width: 120, height: 120, resizeMode: 'contain', marginTop: 10 },
  heroDim: { opacity: 0.5 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14, width: '100%' },
  statSlot: { flex: 1 },
  footer: { paddingHorizontal: 20, paddingBottom: 28 },
  spaced: { marginTop: 12 },
});
