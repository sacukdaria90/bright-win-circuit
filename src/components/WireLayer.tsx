import React from 'react';
import Svg, { Polyline } from 'react-native-svg';
import theme from '../constants/theme';

type Props = {
  routes: number[][];
  cols: number;
  tile: number;
  bloom: number;
};

/**
 * The wires themselves: one crisp polyline per pair plus a wider, low-alpha
 * copy underneath for the neon bloom. Drawn in a single Svg so the whole
 * garland is one layer above the cells and below the emitters.
 */
export default function WireLayer({ routes, cols, tile, bloom }: Props) {
  const span = tile * cols;
  const width = Math.max(4, Math.round(tile * 0.3));

  const toPoints = (route: number[]): string =>
    route
      .map(cell => {
        const x = (cell % cols) * tile + tile / 2;
        const y = Math.floor(cell / cols) * tile + tile / 2;
        return x + ',' + y;
      })
      .join(' ');

  return (
    <Svg width={span} height={span} pointerEvents="none">
      {routes.map((route, i) =>
        route.length > 1 ? (
          <Polyline
            key={'bloom' + i}
            points={toPoints(route)}
            stroke={theme.wire[i % theme.wire.length]}
            strokeOpacity={bloom}
            strokeWidth={width * 1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : null,
      )}
      {routes.map((route, i) =>
        route.length > 1 ? (
          <Polyline
            key={'wire' + i}
            points={toPoints(route)}
            stroke={theme.wire[i % theme.wire.length]}
            strokeWidth={width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : null,
      )}
    </Svg>
  );
}
