import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import theme from '../constants/theme';
import assets from '../assets';

type Variant = 'loader' | 'menu' | 'game' | 'result';

type Props = {
  variant: Variant;
  children: React.ReactNode;
};

/** Deterministic lattice — the loader's signature "live circuit" texture. */
function TraceField({ width, height }: { width: number; height: number }) {
  const dots: React.ReactNode[] = [];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 8; col++) {
      const x = (col + 0.5) * (width / 8) + (rand() - 0.5) * 18;
      const y = (row + 0.5) * (height / 12) + (rand() - 0.5) * 18;
      dots.push(<Circle key={'d' + row + '-' + col} cx={x} cy={y} r={1.6} fill={theme.colors.primary} opacity={0.5} />);
    }
  }
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const y = ((i + 0.5) * height) / 14;
    lines.push(
      <Line key={'l' + i} x1={0} y1={y} x2={width} y2={y} stroke={theme.colors.primary} strokeOpacity={0.2} strokeWidth={1} />,
    );
  }
  return (
    <Svg width={width} height={height}>
      {lines}
      {dots}
    </Svg>
  );
}

/** Corner circuit decor used by the quieter screens. */
function CornerTraces() {
  return (
    <Svg width={180} height={180}>
      <Polyline points="10,170 10,60 70,60 70,10 170,10" stroke={theme.colors.secondary} strokeOpacity={0.3} strokeWidth={2} fill="none" />
      <Polyline points="40,170 40,100 110,100 110,40 170,40" stroke={theme.colors.primary} strokeOpacity={0.22} strokeWidth={2} fill="none" />
      <Polyline points="70,170 70,140 150,140 150,70 170,70" stroke={theme.colors.secondary} strokeOpacity={0.2} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export { TraceField, CornerTraces };

export default function ScreenBackground({ variant, children }: Props) {
  if (variant === 'game') {
    return (
      <ImageBackground source={assets.bgGame} resizeMode="cover" style={styles.root}>
        <LinearGradient colors={theme.gradients.gameVeil} style={StyleSheet.absoluteFill} />
        {children}
      </ImageBackground>
    );
  }

  if (variant === 'result') {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
        <LinearGradient
          colors={theme.gradients.result}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cornerTopRight} pointerEvents="none">
          <CornerTraces />
        </View>
        {children}
      </View>
    );
  }

  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  cornerTopRight: { position: 'absolute', top: 40, right: -20, opacity: 0.9 },
});
