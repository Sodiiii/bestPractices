import antfu from '@antfu/eslint-config'

export default antfu({
  stylistics: {
    indent: 4,
    semi: true,
    quotes: 'double',
  },
  rules: {
    'no-console': ['warn'],
    'perfectionist/sort-imports': ['error', {
      type: 'line-length',
      internalPattern: ['^@/.+'],
    }],
    'unicorn/filename-case': [
      'error',
      {
        case: 'camelCase',
        ignore: ['README.md', 'vite-env.d.ts', 'lint-staged.config.js'],
      },
    ],
    'unused-imports/no-unused-vars': [
      'warn',
    ],
    'max-statements-per-line': ['error', {
      max: 2,
    }],
    'style/max-statements-per-line': ['error', {
      max: 2,
    }],
  },
  ignores: [
    '**/mockServiceWorker.js',
  ],
})
