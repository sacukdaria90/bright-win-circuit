import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import theme from '../constants/theme';
import StarRow from './StarRow';

export type TileStatus = 'locked' | 'open' | 'current' | 'done';

type Props = {
  index: number;
  size: number;
  status: TileStatus;
  stars: number;
  sizeLabel: string;
  onPress: () => void;
};

export default function LevelTile({ index, size, status, stars, sizeLabel, onPress }: Props) {
  const locked = status === 'locked';
  const current = status === 'current';

  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      accessibilityRole="button"
      accessibilityLabel={'LEVEL ' + String(index)}
      style={[
        styles.tile,
        { width: size, height: size },
        locked ? styles.locked : styles.open,
        current ? styles.current : null,
      ]}>
      {locked ? (
        <Lock size={22} color="rgba(247,242,233,0.35)" strokeWidth={2.2} />
      ) : (
        <View style={styles.body}>
          <Text style={styles.number}>{String(index)}</Text>
          <StarRow earned={stars} size={11} gap={3} style={styles.stars} />
          <Text style={styles.caption}>{sizeLabel}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  open: {
    backgroundColor: 'rgba(47,197,204,0.14)',
    borderColor: 'rgba(47,197,204,0.55)',
  },
  locked: {
    backgroundColor: 'rgba(247,242,233,0.04)',
    borderColor: 'rgba(247,242,233,0.10)',
  },
  current: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  body: { alignItems: 'center', justifyContent: 'center' },
  number: {
    fontSize: 30,
    fontWeight: '900',
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  stars: { marginTop: 4 },
  caption: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textFaint,
  },
});
