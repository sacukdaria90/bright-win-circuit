import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';
import HudFrame from './HudFrame';

const SCREEN_W = Dimensions.get('window').width;

type Props = {
  step: 1 | 2;
  /** Screen-space centre of the cell the player has to tap. */
  target: { x: number; y: number };
  tile: number;
  onSkip: () => void;
};

const CAPTIONS: Record<number, string> = {
  1: 'STEP 1 OF 2 - TAP A GLOWING NODE TO START A WIRE',
  2: 'STEP 2 OF 2 - TAP THE NEXT CELL TO EXTEND IT',
};

/**
 * First-level coach marks.
 *
 * The veil is split into four panes around the spotlight instead of being one
 * full-screen sheet, so the highlighted cell stays live and the player learns
 * by actually making the move. `pointerEvents` is left default on the panes
 * (they are meant to block) and "none" on the ring.
 */
export default function TutorialOverlay({ step, target, tile, onSkip }: Props) {
  const ring = tile * 1.1;
  const left = target.x - ring / 2;
  const top = target.y - ring / 2;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={[styles.veil, { left: 0, top: 0, right: 0, height: Math.max(0, top) }]} />
      <View style={[styles.veil, { left: 0, top: top + ring, right: 0, bottom: 0 }]} />
      <View style={[styles.veil, { left: 0, top, width: Math.max(0, left), height: ring }]} />
      <View style={[styles.veil, { left: left + ring, top, right: 0, height: ring }]} />

      <View
        style={[styles.ring, { left, top, width: ring, height: ring, borderRadius: ring / 2 }]}
        pointerEvents="none"
      />

      <Pressable
        onPress={onSkip}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="SKIP"
        style={styles.skip}>
        <Text style={styles.skipLabel}>SKIP</Text>
      </Pressable>

      <HudFrame style={styles.card} accent={theme.colors.primary}>
        <Text style={styles.caption}>{CAPTIONS[step]}</Text>
      </HudFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  veil: { position: 'absolute', backgroundColor: 'rgba(6,10,26,0.86)' },
  ring: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
  },
  skip: {
    position: 'absolute',
    top: 44,
    right: 16,
    height: 44,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: 'rgba(247,242,233,0.7)',
  },
  card: {
    position: 'absolute',
    left: 16,
    bottom: 116,
    width: SCREEN_W - 32,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderColor: 'rgba(47,197,204,0.45)',
  },
  caption: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    lineHeight: 20,
    textAlign: 'center',
    color: theme.colors.text,
  },
});
