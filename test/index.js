/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

/* eslint-disable import/no-commonjs */

const test = require('mukla');
const config = require('../dist/index.cjs');

const fake = { argv: {}, shell: () => 1 };

test('lint task', async () => {
  await config.tasks.lint(fake);
  test.ok(true, 'should pass');
});
