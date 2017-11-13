/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const path = require('path');
const isCI = require('is-ci');
const semver = require('semver');
const gitLog = require('parse-git-log');
const packageJson = require('package-json');

const format = 'prettier-eslint --write **/*.{mjs,js,jsx,es,es6}';
const lint = 'eslint --format codeframe **/*.{mjs,js,jsx,es,es6} --fix';
const style = ['yarn hela format', 'yarn hela lint'];
const test = [
  'nyc --reporter=lcov node test/index.js',
  'nyc report',
  'nyc check-coverage',
];

const precommit = ['yarn hela style', 'git status --porcelain', 'yarn hela test'];
const commit = ['yarn hela ac gen', 'git add --all', 'gitcommit -s -S'];

function detectChange ({ header, body }) {
  const parts = /^(\w+)\((.+)\): (.+)$/.exec(header);
  const breaking = /BREAKING CHANGE/i;
  const isBreaking = header.indexOf(breaking) !== -1 || body.indexOf(breaking) !== -1;
  let increment = null;

  if (/fix|bugfix|patch/.test(parts[1])) {
    increment = 'patch';
  }
  if (/feat|feature|minor/.test(parts[1])) {
    increment = 'minor';
  }
  if (/break|breaking|major/.test(parts[1]) || isBreaking) {
    increment = 'major';
  }

  return increment;
}

const release = ({ helaShell }) =>
  gitLog.promise().then(async (commits) => {
    const lastCommit = commits[0];
    const increment = detectChange(lastCommit.data);

    if (!increment) return null;

    const pkgName = path.basename(lastCommit.cwd);
    const pkgJson = await packageJson(pkgName);
    const currentVersion = pkgJson.version;
    const nextVersion = semver.inc(currentVersion, increment);

    return helaShell([
      `yarn version --no-git-tag-version --new-version ${nextVersion}`,
      `${path.join(__dirname, 'publisher.sh')}`,
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
