/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */

export default {
  '**/*.{js,jsx,ts,tsx}': [
    'eslint',
    // Spell checking https://cspell.org/docs/getting-started
    // () => 'cspell .',
    () => 'npm run typecheck',
  ],
  'src/**/*.scss': [
    'stylelint',
  ],
}
