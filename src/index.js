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

const build = async (opts) => {
  const { shell } = opts;
  await shell('rm -rf dist');
  await runnerWithLog(opts);
};

const test = async (opts) => {
  const { argv, shell } = opts;

  const flags = Object.assign({ path: 'test' }, argv);
  const cmd = `node ${flags.path}`;

  await build(opts);

  if (flags.cov === false) {
    return shell(`node ${flags.path}`);
  }
  if (flags.check === false) {
    return shell([`nyc --reporter text-lcov ${cmd}`, 'nyc report']);
  }

  return shell([`nyc --reporter text-lcov ${cmd}`, 'nyc report', 'nyc check-coverage']);
};

const commit = async (opts) => {
  const { argv, shell } = opts;

  if (argv.lint !== false) {
    await lint(opts);
  }

  if (argv.dry) {
    return shell(['git add --all', 'gitcommit -s -S']);
  }

  if (argv.docs !== false) {
    await shell('yarn start docs');
  }

  if (argv.test !== false) {
    await test(opts);
  }

  return shell(['git status --porcelain', 'git add --all', 'gitcommit -s -S']);
};

const docs = 'verb';

const release = async (opts) => {
  const { shell } = opts;
  await build(opts);
  return shell('new-release');
};

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
