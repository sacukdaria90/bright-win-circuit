import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Volume2, VolumeX, Zap } from 'lucide-react-native';
import theme from '../constants/theme';
import assets from '../assets';
import ScreenHeader from '../components/ScreenHeader';
import NeonButton from '../components/NeonButton';
import StatCard from '../components/StatCard';
import { TOTAL_LEVELS } from '../constants/config';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = Math.round(SCREEN_H * 0.52);

type Props = {
  currentLevel: number;
  totalStars: number;
  bestStars: number;
  solved: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onLevels: () => void;
};

/**
 * Bottom-sheet menu: full-bleed hero art on top, a HUD sheet carrying the
 * identity and the call to action below. The CTA sits deep in the lower third
 * so it is always within comfortable thumb reach.
 */
export default function MenuScreen({
  currentLevel,
  totalStars,
  bestStars,
  solved,
  soundOn,
  onToggleSound,
  onLevels,
}: Props) {
  const heroIn = useRef(new Animated.Value(0)).current;
  const heroRise = useRef(new Animated.Value(22)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroIn, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(heroRise, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Three finite cycles, never a perpetual loop: an animation that never
    // settles keeps the UI thread busy and starves screenshot capture.
    const cycle = Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);
    const anim = Animated.sequence([cycle, cycle, cycle]);
    anim.start();
    return () => anim.stop();
  }, [bob, heroIn, heroRise]);

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [5, -5] });

  const handleLevels = useCallback(() => {
    onLevels();
  }, [onLevels]);

  return (
    <View style={styles.root}>
      <ImageBackground source={assets.bgMenu} resizeMode="cover" style={styles.hero}>
        <View style={styles.menuWash} />
        <LinearGradient colors={theme.gradients.menuFade} style={styles.heroFade} />

        <ScreenHeader
          title={'LEVEL ' + String(currentLevel) + ' / ' + String(TOTAL_LEVELS)}
          starCount={totalStars}
        />

        <View style={styles.heroArt} pointerEvents="none">
          <Svg width={300} height={300} style={styles.glow}>
            <Circle cx={150} cy={150} r={140} fill={theme.colors.secondary} opacity={0.28} />
            <Circle cx={150} cy={150} r={100} fill={theme.colors.secondary} opacity={0.16} />
            <Circle cx={150} cy={150} r={62} fill={theme.colors.primary} opacity={0.07} />
          </Svg>
          <Animated.View
            style={{ opacity: heroIn, transform: [{ translateY: heroRise }, { translateY: bobY }] }}
            pointerEvents="none">
            <Image source={assets.spriteHero} style={styles.heroImg} />
          </Animated.View>
        </View>
      </ImageBackground>

      <View style={styles.sheet}>
        <View style={styles.sheetBracketLeft} pointerEvents="none" />
        <View style={styles.sheetBracketRight} pointerEvents="none" />

        <Text style={styles.title}>BRIGHT WIN CIRCUIT</Text>
        <Text style={styles.tagline}>LINK THE PAIRS - LIGHT THE BOARD</Text>

        <View style={styles.statsRow}>
          <View style={styles.statSlot}>
            <StatCard value={String(bestStars) + ' STARS'} label="BEST RUN" accent={theme.colors.accent} />
          </View>
          <View style={styles.statSlot}>
            <StatCard value={String(solved)} label="CIRCUITS SOLVED" accent={theme.colors.primary} />
          </View>
        </View>

        <Text style={styles.hint}>HOW IT WORKS - TAP A NODE, THEN TAP A PATH</Text>

        <NeonButton label="PLAY" onPress={handleLevels} Icon={Zap} variant="primary" height={62} />

        <Pressable
          onPress={onToggleSound}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="SOUND"
          style={styles.soundRow}>
          {soundOn ? (
            <Volume2 size={20} color={theme.colors.primary} strokeWidth={2.2} />
          ) : (
            <VolumeX size={20} color={theme.colors.textFaint} strokeWidth={2.2} />
          )}
          <Text style={styles.soundLabel}>{soundOn ? 'SOUND ON' : 'SOUND OFF'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  hero: { height: HERO_H, width: SCREEN_W },
  menuWash: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,22,45,0.30)' },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 200 },
  heroArt: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  heroImg: { width: 240, height: 240, resizeMode: 'contain' },
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.sheet,
    borderTopRightRadius: theme.radius.sheet,
    borderTopWidth: 1,
    borderTopColor: 'rgba(47,197,204,0.30)',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 16,
  },
  sheetBracketLeft: {
    position: 'absolute',
    top: 12,
    left: 14,
    width: 16,
    height: 16,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: 'rgba(47,197,204,0.5)',
  },
  sheetBracketRight: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 16,
    height: 16,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: 'rgba(47,197,204,0.5)',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
    color: theme.colors.text,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(47,197,204,0.85)',
    textAlign: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  statSlot: { flex: 1 },
  hint: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(247,242,233,0.5)',
    textAlign: 'center',
  },
  soundRow: {
    marginTop: 12,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  soundLabel: {
    lineHeight: 20,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.textMuted,
  },
});
