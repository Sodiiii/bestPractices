import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      'lint-staged.config.js',
      'vite-env.d.ts',
      'CLAUDE.md',
      '.ruler/**/*',
      '.claude/**/*',
      'docs/**/*',
      '*.md',
      '**/*.md',
      'public/mockServiceWorker.js',
    ],
  },
  {
    rules: {
      'no-console': ['warn'],
      'ts/no-use-before-define': ['warn'],
      'perfectionist/sort-imports': ['error', {
        type: 'line-length',
        internalPattern: ['^@/.+'],
      }],
      'unicorn/filename-case': [
        'error',
        {
          case: 'camelCase',
          ignore: ['README.md', 'CLAUDE.md', 'vite-env.d.ts'],
        },
      ],
      'ts/consistent-type-definitions': ['error', 'type'],
    },
  },
)
