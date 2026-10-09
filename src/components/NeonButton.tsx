import React, { useCallback, useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import theme from '../constants/theme';

export type NeonButtonVariant = 'primary' | 'gold' | 'secondary' | 'ghost';

type IconComponent = LucideIcon;

type Props = {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
  variant?: NeonButtonVariant;
  height?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Every button icon in the app is this size, and every label matches it. */
const ICON = 24;

/**
 * The one button component in the app.
 *
 * Press feedback follows the stack's working pattern: Pressable is the PARENT
 * and drives an Animated.View CHILD — a native-driven transform on an outer
 * wrapper swallows the touch on Android release builds.
 */
export default function NeonButton({
  label,
  onPress,
  Icon,
  variant = 'primary',
  height = 60,
  style,
  disabled = false,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scale, { toValue: 0.96, tension: 300, friction: 12, useNativeDriver: true }).start();
  }, [scale]);

  const pressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, tension: 300, friction: 12, useNativeDriver: true }).start();
  }, [scale]);

  const gradient =
    variant === 'gold' ? theme.gradients.gold : variant === 'primary' ? theme.gradients.cta : null;
  const labelColor =
    variant === 'primary' || variant === 'gold'
      ? theme.colors.ink
      : variant === 'secondary'
      ? theme.colors.accent
      : theme.colors.text;

  const inner = (
    <View style={styles.row}>
      {Icon ? <Icon size={ICON} color={labelColor} strokeWidth={2.4} /> : null}
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={[
        styles.press,
        { height, opacity: disabled ? 0.45 : 1 },
        variant === 'primary' ? styles.glowCyan : null,
        variant === 'gold' ? styles.glowGold : null,
        style,
      ]}>
      <Animated.View style={[styles.fill, { height, transform: [{ scale }] }]} pointerEvents="box-none">
        {gradient ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.fill, styles.center, { height }]}>
            {inner}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.fill,
              styles.center,
              { height },
              variant === 'secondary' ? styles.secondarySkin : styles.ghostSkin,
            ]}>
            {inner}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    width: '100%',
    borderRadius: theme.radius.button,
    overflow: 'hidden',
  },
  fill: { width: '100%', borderRadius: theme.radius.button, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    lineHeight: ICON,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  secondarySkin: {
    backgroundColor: 'rgba(242,201,76,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(242,201,76,0.55)',
  },
  ghostSkin: {
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  glowCyan: {
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  glowGold: {
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },
});
