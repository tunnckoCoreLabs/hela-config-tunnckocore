/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

/**
 * Switch to ES Modules, when `resolve-plugins` async is done.
 *
 * Reminder: Only needed deps which should remain
 * when the `rolldown` is released (currently live here).
 *
 * "dependencies": {
 *   "eslint": "^4.17.0",
 *   "eslint-config-xaxa": "^0.2.2",
 *   "gitcommit": "^0.2.4",
 *   "is-ci": "^1.1.0",
 *   "new-release": "^4.0.1",
 *   "nyc": "^11.4.1"
 * }
 */

/* eslint-disable import/prefer-default-export, import/no-commonjs, import/no-nodejs-modules */

import isCI from 'is-ci';
import runnerWithLog from './rolldown';

const lint = async ({ argv, shell }) => {
  let cmd = 'eslint src test -f codeframe --quiet --fix';

  if (argv.dry) {
    cmd = `${cmd} --fix-dry`;
  } else {
    cmd = `${cmd} --fix`;
  }

  return shell(cmd);
};

const build = async ({ shell, cwd }) => {
  await shell('rm -rf dist');
  await runnerWithLog(cwd);
};

const test = async ({ argv, shell, cwd }) => {
  const opts = Object.assign({ path: 'test' }, argv);
  const cmd = `node ${opts.path}`;

  await build({ cwd, shell });

  if (opts.cov === false) {
    return shell(`node ${opts.path}`);
  }
  if (opts.check === false) {
    return shell([`nyc --reporter=lcov ${cmd}`, 'nyc report']);
  }

  return shell([`nyc --reporter=lcov ${cmd}`, 'nyc report', 'nyc check-coverage']);
};

const commit = async ({ argv, shell }) => {
  if (argv.lint !== false) {
    await lint({ argv, shell });
  }

  if (argv.dry) {
    return shell(['git add --all', 'gitcommit -s -S']);
  }

  if (argv.docs !== false) {
    await shell('yarn start docs');
  }

  if (argv.test !== false) {
    await test({ argv, shell });
  }

  return shell(['git status --porcelain', 'git add --all', 'gitcommit -s -S']);
};

const docs = 'verb';
const release = 'new-release';

const protect = async () => {
  if (!isCI) {
    const msg = 'the "npm publish" is forbidden, we release and publish on CI service';
    throw new Error(msg);
  }
};

const tasks = {
  lint,
  test,
  commit,
  docs,
  build,
  release,
  protect,
};

export default { tasks };
