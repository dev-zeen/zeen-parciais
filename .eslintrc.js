module.exports = {
  root: true,
  rules: {
    'prettier/prettier': [
      'off',
      {
        endOfLine: 'auto',
      },
    ],
    quotes: [2, 'single', { avoidEscape: true }],
  },
  extends: ['universe', 'plugin:react-hooks/recommended'],
};
