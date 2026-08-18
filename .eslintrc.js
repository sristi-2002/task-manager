module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // `const {deleted, ...rest} = obj` is how we drop a field; the discarded
    // binding is the point of the pattern, not an oversight.
    '@typescript-eslint/no-unused-vars': [
      'error',
      {args: 'after-used', ignoreRestSiblings: true},
    ],
  },
};
