import spellbookx from 'eslint-plugin-spellbookx';

export default [
  {
    ignores: ['.agents/**', '.openhands/**', '**/.react-router/**'],
  },
  ...spellbookx.configs.recommended,
];
