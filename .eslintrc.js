module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  "parserOptions": {
    "parser": "@typescript-eslint/parser",
    "sourceType": "module"
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  rules: {
    'react/prop-types': 'off',
  },
  env: {
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
