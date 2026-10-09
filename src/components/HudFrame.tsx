import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import theme from '../constants/theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
  /** Length of each bracket arm. */
  arm?: number;
};

/**
 * The recurring HUD motif: a low-alpha surface with a 1px border and four
 * L-shaped corner brackets. Every card, sheet and panel in the app is built
 * on this, which is what makes the screens read as one system.
 */
function Corner({ color, arm, rotate }: { color: string; arm: number; rotate: string }) {
  const size = arm + 4;
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate }] }}>
      <Path
        d={'M 2 ' + size + ' L 2 2 L ' + size + ' 2'}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export default function HudFrame({ children, style, accent, arm = 14 }: Props) {
  const color = accent || theme.colors.primary;
  return (
    <View style={[styles.frame, style]}>
      <View style={[styles.corner, styles.tl]} pointerEvents="none">
        <Corner color={color} arm={arm} rotate="0deg" />
      </View>
      <View style={[styles.corner, styles.tr]} pointerEvents="none">
        <Corner color={color} arm={arm} rotate="90deg" />
      </View>
      <View style={[styles.corner, styles.br]} pointerEvents="none">
        <Corner color={color} arm={arm} rotate="180deg" />
      </View>
      <View style={[styles.corner, styles.bl]} pointerEvents="none">
        <Corner color={color} arm={arm} rotate="270deg" />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    borderRadius: theme.radius.card,
    backgroundColor: 'rgba(22,30,58,0.72)',
    overflow: 'hidden',
  },
  corner: { position: 'absolute', opacity: 0.6 },
  tl: { top: 3, left: 3 },
  tr: { top: 3, right: 3 },
  br: { bottom: 3, right: 3 },
  bl: { bottom: 3, left: 3 },
});
