import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../constants/theme';

type Props = {
  value: string;
  label: string;
  accent: string;
};

/**
 * The one stat pill used on Menu, Game result and everywhere else.
 *
 * No raster icon on purpose: three AI sprites in a row never share an internal
 * aspect ratio, so they read as three different sizes. Semantics are carried
 * by colour (accent dot + value) and by the caption, and every pill is
 * therefore pixel-identical in shape.
 *
 * `width: '100%'` rather than `flex: 1` — the parent slot is already flex:1 in
 * a row, and flex inside flex collapses the card to a sliver on Android.
 */
export default function StatCard({ value, label, accent }: Props) {
  return (
    <View style={[styles.card, { borderColor: accent + '55' }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    backgroundColor: 'rgba(76,56,162,0.18)',
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  value: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  label: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: theme.colors.textFaint,
  },
});
