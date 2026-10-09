/**
 * Visual preset: CYBERPUNK (workspace preset #4).
 * The preset's accent hexes are overridden with the brief's palette, but the
 * `name` field stays on the preset as required by the workspace rules.
 */

export const theme = {
  name: 'CYBERPUNK',

  colors: {
    bg: '#10162D',
    bgDeep: '#060A1A',
    surface: '#161E3A',
    surfaceAlt: '#1B1140',
    primary: '#2FC5CC',
    secondary: '#4C38A2',
    accent: '#F2C94C',
    danger: '#EA5D82',
    text: '#F7F2E9',
    textMuted: 'rgba(247,242,233,0.62)',
    textFaint: 'rgba(247,242,233,0.38)',
    hairline: 'rgba(47,197,204,0.28)',
    glass: 'rgba(247,242,233,0.06)',
    glassBorder: 'rgba(247,242,233,0.12)',
    ink: '#0B1026',
  },

  // Gradients are plain string arrays on purpose: `as const` turns them into
  // readonly tuples, which LinearGradient's `colors` prop rejects at build time.
  gradients: {
    loader: ['#060A1A', '#10162D', '#1B1140'] as string[],
    menuFade: ['transparent', 'rgba(16,22,45,0.85)', '#10162D'] as string[],
    board: ['#10162D', '#141B38', '#1B1140'] as string[],
    cta: ['#2FC5CC', '#4C38A2'] as string[],
    gold: ['#F2C94C', '#EA5D82'] as string[],
    hint: ['#4C38A2', '#2FC5CC'] as string[],
    progress: ['#4C38A2', '#2FC5CC', '#F2C94C'] as string[],
    gameVeil: ['rgba(16,22,45,0.78)', 'rgba(16,22,45,0.92)'] as string[],
    result: ['#1B1140', '#10162D'] as string[],
  },

  // Five emitter colours, one per pair glyph.
  wire: ['#2FC5CC', '#F2C94C', '#EA5D82', '#7B63D9', '#F7F2E9'] as string[],

  radius: { chip: 8, card: 14, button: 18, sheet: 28, board: 20 },

  type: {
    hero: { fontSize: 36, fontWeight: '900' as const, letterSpacing: 4 },
    title: { fontSize: 26, fontWeight: '900' as const, letterSpacing: 2 },
    section: { fontSize: 20, fontWeight: '800' as const, letterSpacing: 2 },
    body: { fontSize: 15, fontWeight: '600' as const },
    caption: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.5 },
  },
};

export type Theme = typeof theme;
export default theme;
