import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ArrowLeft, Star } from 'lucide-react-native';
import theme from '../constants/theme';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  /** Right-hand HUD slot. When omitted the star counter is drawn instead. */
  rightSlot?: React.ReactNode;
  starCount?: number;
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The single header used by every screen below the loader.
 *
 * Keeping it in one place is what stops the back chip / counter styling from
 * drifting between Menu, Level Select, Game and Result. paddingTop clears the
 * status bar; the 44px slots are the minimum comfortable touch target.
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
  starCount,
  solid = false,
  style,
}: Props) {
  return (
    <View style={[styles.header, solid ? styles.solid : null, style]}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="BACK"
            style={styles.backChip}>
            <ArrowLeft size={20} color={theme.colors.text} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.sideRight}>
        {rightSlot ? (
          rightSlot
        ) : typeof starCount === 'number' ? (
          <View style={styles.starChip}>
            <Star size={16} color={theme.colors.accent} fill={theme.colors.accent} strokeWidth={2} />
            <Text style={styles.starValue}>{String(starCount)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 44,
    height: 116,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  solid: {
    backgroundColor: 'rgba(0,0,0,0.30)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(47,197,204,0.22)',
  },
  side: { width: 56, alignItems: 'flex-start', justifyContent: 'center' },
  sideRight: { width: 56, alignItems: 'flex-end', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backChip: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,242,233,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.text,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(47,197,204,0.78)',
  },
  starChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: theme.radius.chip,
    borderWidth: 1,
    borderColor: 'rgba(242,201,76,0.38)',
    backgroundColor: 'rgba(242,201,76,0.10)',
  },
  starValue: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.accent,
    fontVariant: ['tabular-nums'],
  },
});
