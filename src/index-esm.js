/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

import isCI from 'is-ci';

const format = 'prettier-eslint --write **/*.{mjs,js,jsx,es,es6}';
const lint = 'eslint **/*.{mjs,js,jsx,es,es6} --format codeframe --fix';
const style = ['yarn start format', 'yarn start lint'];
const test = [
  'nyc --reporter=lcov babel-node test/index.js',
  'nyc report',
  'nyc check-coverage',
];

const precommit = [
  'yarn start style',
  'git status --porcelain',
  'yarn start test',
];

const commit = ['git add --all', 'simple-commit-message'];

const release = ['semantic-release pre', 'npm publish', 'semantic-release post'];

const protect = () => {
  /* istanbul ignore next */
  if (isCI) {
    return Promise.resolve();
  }

  const msg = 'the "npm publish" is forbidden, we use semantic-release on CI';

  return Promise.reject(new Error(msg));
};

export default {
  format,
  lint,
  style,
  test,
  precommit,
  commit,
  release,
  protect,
};
