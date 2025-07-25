module.exports = {
  extends: ['@stoplight'],
  rules: {
    'prettier/prettier': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['lodash/*', '@fortawesome/free-solid-svg-icons/*'],
      },
    ],
    'camelcase': 'error',
    'comma-dangle': [
      'error',
      {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'always-multiline',
      },
    ],
    'eol-last': [
      'error',
      'always',
    ],
    'eqeqeq': [
      'error',
      'always',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'never',
    ],
  },
  overrides: [
    {
      files: ['src/__fixtures__/**/*'],
      rules: {
        camelcase: 'off',
      },
    },
    {
      files: ['**/*.json', '**/*.jsonc'],
      parser: 'jsonc-eslint-parser',
      extends: [
        'plugin:jsonc/recommended-with-json',
      ],
    },
  ],
}
