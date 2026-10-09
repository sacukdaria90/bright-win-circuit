import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Lightbulb, RotateCcw, Undo2 } from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {
  hints: number;
  canUndo: boolean;
  onUndo: () => void;
  onHint: () => void;
  onRestart: () => void;
};

const ICON = 24;

function SquareAction({
  onPress,
  label,
  tint,
  border,
  children,
}: {
  onPress: () => void;
  label: string;
  tint: string;
  border: string;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.92, tension: 300, friction: 12, useNativeDriver: true }).start();
  }, [scale]);
  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, tension: 300, friction: 12, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.square, { backgroundColor: tint, borderColor: border }]}>
      <Animated.View style={[styles.squareInner, { transform: [{ scale }] }]} pointerEvents="box-none">
        {children}
      </Animated.View>
    </Pressable>
  );
}

/**
 * The floating control bar. It sits above the board rather than inside the
 * flex column, which is what gives the game screen its "board fills the space,
 * controls hover" look.
 */
export default function ControlsBar({ hints, canUndo, onUndo, onHint, onRestart }: Props) {
  const hintScale = useRef(new Animated.Value(1)).current;
  const hintIn = useCallback(() => {
    Animated.spring(hintScale, { toValue: 0.96, tension: 300, friction: 12, useNativeDriver: true }).start();
  }, [hintScale]);
  const hintOut = useCallback(() => {
    Animated.spring(hintScale, { toValue: 1, tension: 300, friction: 12, useNativeDriver: true }).start();
  }, [hintScale]);

  return (
    <View style={styles.bar}>
      <SquareAction
        onPress={onUndo}
        label="UNDO"
        tint={canUndo ? 'rgba(247,242,233,0.09)' : 'rgba(247,242,233,0.04)'}
        border={theme.colors.glassBorder}>
        <Undo2
          size={ICON}
          color={canUndo ? theme.colors.text : theme.colors.textFaint}
          strokeWidth={2.4}
        />
      </SquareAction>

      <Pressable
        onPress={onHint}
        onPressIn={hintIn}
        onPressOut={hintOut}
        disabled={hints <= 0}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="HINT"
        style={[styles.hintPress, { opacity: hints <= 0 ? 0.45 : 1 }]}>
        <Animated.View style={[styles.hintInner, { transform: [{ scale: hintScale }] }]} pointerEvents="box-none">
          <LinearGradient
            colors={theme.gradients.hint}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hintFill}>
            <View style={styles.row}>
              <Lightbulb size={ICON} color={theme.colors.ink} strokeWidth={2.4} />
              <Text style={styles.hintLabel}>{'HINT ' + String(hints)}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>

      <SquareAction
        onPress={onRestart}
        label="RESTART"
        tint="rgba(234,93,130,0.16)"
        border="rgba(234,93,130,0.45)">
        <RotateCcw size={ICON} color={theme.colors.danger} strokeWidth={2.4} />
      </SquareAction>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    height: 72,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(22,30,58,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(47,197,204,0.28)',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 14,
  },
  square: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareInner: { alignItems: 'center', justifyContent: 'center' },
  hintPress: { flex: 1, height: 52, borderRadius: 14, overflow: 'hidden' },
  hintInner: { width: '100%', height: 52, borderRadius: 14, overflow: 'hidden' },
  hintFill: { width: '100%', height: 52, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  hintLabel: {
    lineHeight: ICON,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: theme.colors.ink,
  },
});
