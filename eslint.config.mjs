import spellbookx from 'eslint-plugin-spellbookx';

export default [
  {
    ignores: ['**/.react-router/**'],
  },
  ...spellbookx.configs.recommended,
];
