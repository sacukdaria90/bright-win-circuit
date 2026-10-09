import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Star } from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {
  earned: number;
  total?: number;
  size?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

const EMPTY = 'rgba(247,242,233,0.16)';

/** Rating strip. Vector icons only — no glyph fallbacks, no emoji. */
export default function StarRow({ earned, total = 3, size = 16, gap = 6, style }: Props) {
  const slots: number[] = [];
  for (let i = 0; i < total; i++) {
    slots.push(i);
  }
  return (
    <View style={[styles.row, { gap }, style]}>
      {slots.map(i => (
        <Star
          key={i}
          size={size}
          color={i < earned ? theme.colors.accent : EMPTY}
          fill={i < earned ? theme.colors.accent : 'transparent'}
          strokeWidth={2}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
