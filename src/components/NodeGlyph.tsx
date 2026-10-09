import React from 'react';
import Svg, { Circle, Polygon } from 'react-native-svg';
import { GlyphKind } from '../game/levels';

type Props = {
  kind: GlyphKind;
  color: string;
  size: number;
};

function points(list: number[][]): string {
  return list.map(p => p[0] + ',' + p[1]).join(' ');
}

/**
 * Emitter symbols drawn as pure vector shapes.
 *
 * Deliberately not emoji and not box-drawing characters: on Android those
 * collapse to the same fallback glyph, which would make five distinct pairs
 * look identical on the board.
 */
export default function NodeGlyph({ kind, color, size }: Props) {
  const c = size / 2;
  const r = size * 0.42;

  if (kind === 'CIRCLE') {
    return (
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} fill={color} />
      </Svg>
    );
  }

  if (kind === 'DIAMOND') {
    return (
      <Svg width={size} height={size}>
        <Polygon points={points([[c, c - r], [c + r, c], [c, c + r], [c - r, c]])} fill={color} />
      </Svg>
    );
  }

  if (kind === 'HEX') {
    const hex: number[][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      hex.push([c + r * Math.cos(a), c + r * Math.sin(a)]);
    }
    return (
      <Svg width={size} height={size}>
        <Polygon points={points(hex)} fill={color} />
      </Svg>
    );
  }

  if (kind === 'DROP') {
    return (
      <Svg width={size} height={size}>
        <Polygon points={points([[c, c - r], [c + r * 0.82, c + r * 0.55], [c - r * 0.82, c + r * 0.55]])} fill={color} />
        <Circle cx={c} cy={c + r * 0.3} r={r * 0.46} fill={color} />
      </Svg>
    );
  }

  // STAR
  const star: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    star.push([c + rad * Math.cos(a), c + rad * Math.sin(a)]);
  }
  return (
    <Svg width={size} height={size}>
      <Polygon points={points(star)} fill={color} />
    </Svg>
  );
}
