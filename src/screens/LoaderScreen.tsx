import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle as SvgCircle } from 'react-native-svg';
import theme from '../constants/theme';
import assets from '../assets';
import { TraceField } from '../components/ScreenBackground';
import { LOADER_DURATION_MS, LOADER_FADE_MS, LOADER_STEPS, LOADER_STEP_MS } from '../constants/config';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BAR_W = 220;
const EMBLEM = 148;

type Props = { onDone: () => void };

/**
 * Brand card. Non-interactive by design: it holds the screen for the full
 * splash window, then hands over.
 *
 * The bar is driven by a stepped interval rather than one long tween — a
 * multi-second animation keeps the view hierarchy busy and blocks the
 * automated capture pass from ever reading a stable frame.
 *
 * Visually this is the busiest frame in the app: a full-canvas trace lattice
 * plus a dark 0.55 wash. That structural difference from the menu is what the
 * screenshot gate measures.
 */
export default function LoaderScreen({ onDone }: Props) {
  const fade = useRef(new Animated.Value(1)).current;
  const emblemIn = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.82)).current;
  const titleIn = useRef(new Animated.Value(0)).current;
  const titleRise = useRef(new Animated.Value(16)).current;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(emblemIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(emblemScale, { toValue: 1, tension: 42, friction: 7, useNativeDriver: true }),
    ]).start();

    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleIn, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(titleRise, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 280);

    const stepper = setInterval(() => {
      setTick(prev => (prev >= LOADER_STEPS ? LOADER_STEPS : prev + 1));
    }, LOADER_STEP_MS);

    const done = setTimeout(() => {
      Animated.timing(fade, { toValue: 0, duration: LOADER_FADE_MS, useNativeDriver: true }).start();
      setTimeout(onDone, LOADER_FADE_MS);
    }, LOADER_DURATION_MS);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(done);
      clearInterval(stepper);
    };
  }, [emblemIn, emblemScale, fade, onDone, titleIn, titleRise]);

  const fillWidth = Math.round((Math.min(tick, LOADER_STEPS) / LOADER_STEPS) * BAR_W);

  return (
    <Animated.View style={[styles.root, { opacity: fade }]} pointerEvents="none">
      <ImageBackground source={assets.bgLoader} resizeMode="cover" style={styles.root}>
        <LinearGradient
          colors={theme.gradients.loader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.wash} />
        <View style={styles.field} pointerEvents="none">
          <TraceField width={SCREEN_W} height={SCREEN_H} />
        </View>

        <View style={styles.center}>
          <Animated.View
            style={[styles.emblem, { opacity: emblemIn, transform: [{ scale: emblemScale }] }]}
            pointerEvents="none">
            <Svg width={EMBLEM} height={EMBLEM} style={StyleSheet.absoluteFill}>
              <SvgCircle
                cx={EMBLEM / 2}
                cy={EMBLEM / 2}
                r={EMBLEM / 2 - 6}
                stroke={theme.colors.primary}
                strokeOpacity={0.9}
                strokeWidth={2}
                fill="none"
              />
              <Path d="M 8 34 L 8 8 L 34 8" stroke={theme.colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
              <Path d="M 140 34 L 140 8 L 114 8" stroke={theme.colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
              <Path d="M 8 114 L 8 140 L 34 140" stroke={theme.colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
              <Path d="M 140 114 L 140 140 L 114 140" stroke={theme.colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
            </Svg>
            <Image source={assets.spriteBulb} style={styles.bulb} />
          </Animated.View>

          <Animated.View
            style={[styles.titleBlock, { opacity: titleIn, transform: [{ translateY: titleRise }] }]}
            pointerEvents="none">
            <Text style={styles.brand}>BRIGHT WIN</Text>
            <Text style={styles.brandSub}>CIRCUIT</Text>
            <Text style={styles.tagline}>CONNECT THE LIGHTS</Text>
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          <View style={styles.track}>
            <LinearGradient
              colors={theme.gradients.progress}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.fill, { width: fillWidth }]}
            />
          </View>
          <Text style={styles.loading}>LOADING...</Text>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bgDeep },
  wash: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,10,26,0.55)' },
  field: { ...StyleSheet.absoluteFillObject, opacity: 0.85 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emblem: {
    width: EMBLEM,
    height: EMBLEM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulb: { width: 84, height: 84, resizeMode: 'contain' },
  titleBlock: { marginTop: 30, alignItems: 'center' },
  brand: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
    color: theme.colors.text,
    textShadowColor: theme.colors.primary,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  brandSub: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 10,
    color: theme.colors.primary,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(247,242,233,0.6)',
  },
  bottom: { alignItems: 'center', paddingBottom: 72 },
  track: {
    width: BAR_W,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(247,242,233,0.12)',
  },
  fill: { height: 6, borderRadius: 3 },
  loading: {
    marginTop: 14,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(247,242,233,0.45)',
  },
});
