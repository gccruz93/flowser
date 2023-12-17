/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier',
  ],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        endOfLine: 'auto',
      },
    ],
    'no-undef': 'off',
    'vue/attribute-hyphenation': 0,
  },
}
