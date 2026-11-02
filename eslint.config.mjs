import spellbookx from 'eslint-plugin-spellbookx';

export default [
  {
    ignores: [
      '.agents/**',
      '.openhands/**',
      '**/.react-router/**',
      '**/src/lib/prisma/**',
    ],
  },
  ...spellbookx.configs.recommended,
];
