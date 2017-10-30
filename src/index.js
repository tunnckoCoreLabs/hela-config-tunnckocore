/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const isCI = require('is-ci');
const gitLog = require('parse-git-log');

const format = 'prettier-eslint --write **/*.{mjs,js,jsx,es,es6}';
const lint = 'eslint --format codeframe **/*.{mjs,js,jsx,es,es6} --fix';
const style = ['yarn start format', 'yarn start lint'];
const test = [
  'nyc --reporter=lcov node test/index.js',
  'nyc report',
  'nyc check-coverage',
];

const precommit = ['yarn start style', 'git status --porcelain', 'yarn start test'];
const commit = ['yarn start ac gen', 'git add --all', 'gitcommit -s -S'];
const release = ({ helaShell }) =>
  gitLog.promise().then((commits) => {
    const { header, body } = commits[1].data;
    const parts = /^(\w+)\((.+)\): (.+)$/.exec(header);
    const breaking = /BREAKING CHANGE/i;
    let version = parts[1];

    if (version === 'chore') {
      return null;
    }

    if (parts[1] === 'fix') {
      version = 'patch';
    }
    if (parts[1] === 'feat') {
      version = 'minor';
    }
    if (header.indexOf(breaking) !== -1 || body.indexOf(breaking) !== -1) {
      version = 'major';
    }

    return helaShell([
      `yarn version --new-version ${version}`,
      'git push --follow-tags',
      'npm publish',
    ]);
  });

const protect = () => {
  /* istanbul ignore next */
  if (isCI) {
    return Promise.resolve();
  }

  const msg = 'the "npm publish" is forbidden, we use semantic-release on CI';

  return Promise.reject(new Error(msg));
};

const ac = ({ argv, helaExec }) => {
  const arg = argv._.slice(1).shift();
  if (!arg) {
    return helaExec('all-contributors init');
  }
  if (arg === 'a' || arg === 'add') {
    return helaExec('all-contributors add');
  }
  if (arg === 'g' || arg === 'gen' || arg === 'generate') {
    return helaExec('all-contributors generate');
  }
  return Promise.reject(new Error('hela ac: provide "add" or "gen" command'));
};

module.exports = {
  ac,
  format,
  lint,
  style,
  test,
  precommit,
  commit,
  release,
  protect,
};
