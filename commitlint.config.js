export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'remove', 'rename'],
    ],
    'header-max-length': [2, 'always', 72],
  },
};
