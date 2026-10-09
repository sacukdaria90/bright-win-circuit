import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, BackHandler, Dimensions, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Play } from 'lucide-react-native';
import theme from '../constants/theme';
import ScreenHeader from '../components/ScreenHeader';
import NeonButton from '../components/NeonButton';
import LevelTile, { TileStatus } from '../components/LevelTile';
import { CornerTraces } from '../components/ScreenBackground';
import { levelSizeLabel } from '../game/levels';
import { TOTAL_LEVELS } from '../constants/config';

const SCREEN_W = Dimensions.get('window').width;
const GRID_W = Math.min(SCREEN_W - 32, 380);
const GAP = 12;
const TILE = Math.floor((GRID_W - 2 * GAP) / 3);

type Props = {
  unlocked: number;
  selected: number;
  starsByLevel: number[];
  totalStars: number;
  onSelect: (level: number) => void;
  onLaunch: () => void;
  onBack: () => void;
};

/**
 * Level picker. The first unsolved level is already selected when the screen
 * mounts, so the bottom CTA is always a single tap away from the board — the
 * picker informs, it never gates.
 */
export default function LevelSelectScreen({
  unlocked,
  selected,
  starsByLevel,
  totalStars,
  onSelect,
  onLaunch,
  onBack,
}: Props) {
  const fades = useRef(
    Array.from({ length: TOTAL_LEVELS }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const anim = Animated.stagger(
      45,
      fades.map(v => Animated.timing(v, { toValue: 1, duration: 260, useNativeDriver: true })),
    );
    anim.start();
    return () => anim.stop();
  }, [fades]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const tiles = useMemo(() => {
    const out: { id: number; status: TileStatus }[] = [];
    for (let id = 1; id <= TOTAL_LEVELS; id++) {
      let status: TileStatus = 'open';
      if (id > unlocked) {
        status = 'locked';
      } else if (id === selected) {
        status = 'current';
      } else if (starsByLevel[id - 1] > 0) {
        status = 'done';
      }
      out.push({ id, status });
    }
    return out;
  }, [selected, starsByLevel, unlocked]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={theme.gradients.board}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.decor} pointerEvents="none">
        <CornerTraces />
      </View>

      <ScreenHeader title="SELECT LEVEL" onBack={onBack} starCount={totalStars} />

      <View style={styles.body}>
        <View style={styles.grid}>
          {tiles.map((t, i) => (
            <Animated.View key={t.id} style={{ opacity: fades[i] }} pointerEvents="box-none">
              <LevelTile
                index={t.id}
                size={TILE}
                status={t.status}
                stars={starsByLevel[t.id - 1] || 0}
                sizeLabel={levelSizeLabel(t.id)}
                onPress={() => onSelect(t.id)}
              />
            </Animated.View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>EASY 1-3</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: theme.colors.accent }]} />
            <Text style={styles.legendText}>MEDIUM 4-6</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: theme.colors.danger }]} />
            <Text style={styles.legendText}>HARD 7-9</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerHint}>{'SELECTED - LEVEL ' + String(selected) + ' - ' + levelSizeLabel(selected) + ' BOARD'}</Text>
        <NeonButton
          label="START LEVEL"
          accessibilityLabel="START"
          onPress={onLaunch}
          Icon={Play}
          variant="gold"
          height={60}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  decor: { position: 'absolute', top: 50, right: -30, opacity: 0.8 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: {
    width: GRID_W,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    justifyContent: 'flex-start',
  },
  legend: { flexDirection: 'row', gap: 16, marginTop: 26 },
  legendItem: { alignItems: 'center', gap: 6 },
  legendBar: { width: 46, height: 4, borderRadius: 2 },
  legendText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textFaint,
  },
  footer: { paddingHorizontal: 16, paddingBottom: 28 },
  footerHint: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(247,242,233,0.55)',
  },
});
