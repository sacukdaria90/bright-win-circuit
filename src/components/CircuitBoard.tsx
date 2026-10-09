import React, { useMemo } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import theme from '../constants/theme';
import { GameState, emitterMap } from '../game/engine';
import NodeGlyph from './NodeGlyph';
import WireLayer from './WireLayer';

const SCREEN_W = Dimensions.get('window').width;

/**
 * Board geometry.
 *
 * The parent View's `width` does NOT include its own padding or border for the
 * children's content area, so the frame has to be subtracted BEFORE the tile
 * size is derived — otherwise the right-hand column spills past the rounded
 * edge. BOARD_W is then rebuilt from the floored tile so there is never a
 * sub-pixel remainder.
 */
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
const PAD = 6;
const BORDER = 2;
export const BOARD_FRAME = PAD + BORDER;

export function boardMetrics(cols: number) {
  const tile = Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / cols);
  return { tile, size: tile * cols + 2 * BOARD_FRAME, span: tile * cols };
}

type Props = {
  state: GameState;
  onCellTap: (cell: number) => void;
  bloom: number;
  locked?: boolean;
};

export default function CircuitBoard({ state, onCellTap, bloom, locked = false }: Props) {
  const cols = state.level.cols;
  const { tile, size, span } = useMemo(() => boardMetrics(cols), [cols]);
  const ends = useMemo(() => emitterMap(state.level), [state.level]);

  const cells: number[] = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < cols * cols; i++) {
      out.push(i);
    }
    return out;
  }, [cols]);

  const activeRoute = state.activePair >= 0 ? state.routes[state.activePair] : null;
  const head = activeRoute && activeRoute.length ? activeRoute[activeRoute.length - 1] : -1;

  return (
    <View style={[styles.board, { width: size, height: size }]}>
      <View style={{ width: span, height: span }}>
        {cells.map(cell => {
          const owner = state.owner[cell];
          const pairColor = owner >= 0 ? theme.wire[owner % theme.wire.length] : null;
          const isEnd = ends.has(cell);
          const isHead = cell === head;
          const isError = cell === state.errorCell && state.phase === 'routing';
          const x = (cell % cols) * tile;
          const y = Math.floor(cell / cols) * tile;
          return (
            <Pressable
              key={cell}
              onPress={locked ? undefined : () => onCellTap(cell)}
              disabled={locked}
              accessibilityRole="button"
              accessibilityLabel={'CELL ' + String(cell)}
              style={[styles.cell, { left: x, top: y, width: tile, height: tile }]}>
              <View
                style={[
                  styles.cellSkin,
                  {
                    width: tile - 2,
                    height: tile - 2,
                    backgroundColor: pairColor ? pairColor + '2E' : 'rgba(247,242,233,0.03)',
                    borderColor: isError ? theme.colors.danger : 'rgba(247,242,233,0.07)',
                  },
                ]}
              />
            </Pressable>
          );
        })}

        <View style={[styles.overlay, { width: span, height: span }]} pointerEvents="none">
          <WireLayer routes={state.routes} cols={cols} tile={tile} bloom={bloom} />
        </View>

        <View style={[styles.overlay, { width: span, height: span }]} pointerEvents="none">
          {cells.map(cell => {
            if (!ends.has(cell)) {
              return null;
            }
            const owner = ends.get(cell) as number;
            const color = theme.wire[owner % theme.wire.length];
            const nodeSize = tile - 10;
            const x = (cell % cols) * tile + 5;
            const y = Math.floor(cell / cols) * tile + 5;
            return (
              <View
                key={'n' + cell}
                style={[
                  styles.node,
                  {
                    left: x,
                    top: y,
                    width: nodeSize,
                    height: nodeSize,
                    backgroundColor: color + (state.solved[owner] ? 'FF' : 'CC'),
                    borderColor: state.activePair === owner ? theme.colors.text : color,
                  },
                ]}>
                <NodeGlyph kind={state.level.pairs[owner].glyph} color={theme.colors.ink} size={nodeSize * 0.62} />
              </View>
            );
          })}

          {head >= 0 && !ends.has(head) ? (
            <View
              style={[
                styles.headRing,
                {
                  left: (head % cols) * tile + tile * 0.2,
                  top: Math.floor(head / cols) * tile + tile * 0.2,
                  width: tile * 0.6,
                  height: tile * 0.6,
                  borderRadius: tile * 0.3,
                },
              ]}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    padding: PAD,
    borderWidth: BORDER,
    borderColor: 'rgba(47,197,204,0.45)',
    borderRadius: theme.radius.board,
    backgroundColor: 'rgba(11,16,38,0.82)',
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.5,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  cell: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  cellSkin: { borderRadius: 6, borderWidth: 1 },
  overlay: { position: 'absolute', left: 0, top: 0 },
  node: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: theme.colors.text,
    backgroundColor: 'rgba(247,242,233,0.18)',
  },
});
