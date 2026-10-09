/**
 * Nine hand-tuned circuit levels.
 *
 * Each level is a full-fill routing puzzle: the stored paths are disjoint,
 * orthogonally connected and together cover EVERY cell of the grid, so
 * "all pairs linked" and "whole board lit" are the same win condition.
 *
 * Cells are flat indices (row * cols + col) packed into a space separated
 * string. Keeping them as strings rather than nested arrays keeps this module
 * tiny to parse at load time; the arrays are built lazily by getLevel().
 */

export type GlyphKind = 'CIRCLE' | 'STAR' | 'DIAMOND' | 'HEX' | 'DROP';

export type RawPath = { glyph: GlyphKind; cells: string };

export type RawLevel = {
  id: number;
  cols: number;
  minSegments: number;
  movesBudget: number;
  paths: RawPath[];
};

export type LevelPair = {
  glyph: GlyphKind;
  colorIndex: number;
  /** Full solution route, first and last cell are the two emitters. */
  solution: number[];
};

export type Level = {
  id: number;
  cols: number;
  cells: number;
  minSegments: number;
  movesBudget: number;
  pairs: LevelPair[];
};

export const RAW_LEVELS: RawLevel[] = [
  {
    id: 1,
    cols: 5,
    minSegments: 21,
    movesBudget: 34,
    paths: [
      { glyph: 'CIRCLE', cells: '8 3 4 9 14' },
      { glyph: 'STAR', cells: '13 18 19 24 23' },
      { glyph: 'DIAMOND', cells: '22 21 20 15 16' },
      { glyph: 'HEX', cells: '17 12 11 10 5 0 1 2 7 6' },
    ],
  },
  {
    id: 2,
    cols: 5,
    minSegments: 21,
    movesBudget: 34,
    paths: [
      { glyph: 'CIRCLE', cells: '12 7 2 1 0 5 6' },
      { glyph: 'STAR', cells: '11 10 15 20' },
      { glyph: 'DIAMOND', cells: '21 16 17 22 23 24' },
      { glyph: 'HEX', cells: '19 18 13 14 9 8 3 4' },
    ],
  },
  {
    id: 3,
    cols: 5,
    minSegments: 21,
    movesBudget: 34,
    paths: [
      { glyph: 'CIRCLE', cells: '8 9 4 3 2 1' },
      { glyph: 'STAR', cells: '0 5 10 15 20 21' },
      { glyph: 'DIAMOND', cells: '22 23 24 19' },
      { glyph: 'HEX', cells: '14 13 18 17 16 11 12 7 6' },
    ],
  },
  {
    id: 4,
    cols: 6,
    minSegments: 31,
    movesBudget: 50,
    paths: [
      { glyph: 'CIRCLE', cells: '11 5 4 3 2' },
      { glyph: 'STAR', cells: '1 0 6 7 8 9 10 16' },
      { glyph: 'DIAMOND', cells: '17 23 22 28 29 35 34' },
      { glyph: 'HEX', cells: '33 27 21 15 14 20 26' },
      { glyph: 'DROP', cells: '32 31 30 24 25 19 18 12 13' },
    ],
  },
  {
    id: 5,
    cols: 6,
    minSegments: 31,
    movesBudget: 50,
    paths: [
      { glyph: 'CIRCLE', cells: '14 15 16 17 23' },
      { glyph: 'STAR', cells: '22 21 20 19 13 7' },
      { glyph: 'DIAMOND', cells: '8 9 10 11 5 4 3' },
      { glyph: 'HEX', cells: '2 1 0 6 12 18 24' },
      { glyph: 'DROP', cells: '30 31 25 26 32 33 27 28 34 35 29' },
    ],
  },
  {
    id: 6,
    cols: 6,
    minSegments: 31,
    movesBudget: 50,
    paths: [
      { glyph: 'CIRCLE', cells: '3 4 5 11 17 23' },
      { glyph: 'STAR', cells: '29 35 34 28 22 16' },
      { glyph: 'DIAMOND', cells: '10 9 15 21 27 33 32 26 20' },
      { glyph: 'HEX', cells: '14 8 2 1 0 6 7' },
      { glyph: 'DROP', cells: '13 12 18 19 25 31 30 24' },
    ],
  },
  {
    id: 7,
    cols: 6,
    minSegments: 31,
    movesBudget: 42,
    paths: [
      { glyph: 'CIRCLE', cells: '31 30 24 18 12 6 0 1' },
      { glyph: 'STAR', cells: '2 3 4 5 11 10 9' },
      { glyph: 'DIAMOND', cells: '8 7 13 19 25 26 32' },
      { glyph: 'HEX', cells: '33 34 35 29 23 17 16' },
      { glyph: 'DROP', cells: '22 28 27 21 15 14 20' },
    ],
  },
  {
    id: 8,
    cols: 6,
    minSegments: 31,
    movesBudget: 42,
    paths: [
      { glyph: 'CIRCLE', cells: '4 5 11 10 9 3 2' },
      { glyph: 'STAR', cells: '1 0 6 7 8 14 13 12' },
      { glyph: 'DIAMOND', cells: '18 19 20 21 15 16 17' },
      { glyph: 'HEX', cells: '23 22 28 29 35 34 33' },
      { glyph: 'DROP', cells: '27 26 32 31 25 24 30' },
    ],
  },
  {
    id: 9,
    cols: 6,
    minSegments: 31,
    movesBudget: 42,
    paths: [
      { glyph: 'CIRCLE', cells: '30 31 32 33 34 35 29 28' },
      { glyph: 'STAR', cells: '27 26 25 24 18 19 20' },
      { glyph: 'DIAMOND', cells: '21 22 23 17 11 5 4' },
      { glyph: 'HEX', cells: '3 2 1 0 6 12' },
      { glyph: 'DROP', cells: '13 7 8 14 15 16 10 9' },
    ],
  },
];

export const TOTAL_LEVELS = RAW_LEVELS.length;

/** Parse one level into its runtime shape. Cheap, and never run at module load. */
export function getLevel(id: number): Level {
  const clamped = Math.min(Math.max(id, 1), RAW_LEVELS.length);
  const raw = RAW_LEVELS[clamped - 1];
  return {
    id: raw.id,
    cols: raw.cols,
    cells: raw.cols * raw.cols,
    minSegments: raw.minSegments,
    movesBudget: raw.movesBudget,
    pairs: raw.paths.map((p, i) => ({
      glyph: p.glyph,
      colorIndex: i,
      solution: p.cells.split(' ').map(n => parseInt(n, 10)),
    })),
  };
}

/** Board size label shown on the level tiles. */
export function levelSizeLabel(id: number): string {
  const raw = RAW_LEVELS[Math.min(Math.max(id, 1), RAW_LEVELS.length) - 1];
  return raw.cols + 'x' + raw.cols;
}

export function levelDifficulty(id: number): 'EASY' | 'MEDIUM' | 'HARD' {
  if (id <= 3) { return 'EASY'; }
  if (id <= 6) { return 'MEDIUM'; }
  return 'HARD';
}
