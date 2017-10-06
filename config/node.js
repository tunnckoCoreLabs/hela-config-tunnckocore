/**
 * @author Charlike Mike Reagent <open.source.charlike@gmail.com>
 * @copyright 2017 tunnckoCore, Inc. and other contributors
 * @license MIT
 */

const builtins = require('builtin-modules')

const { pkg, createConfig, createBabel } = require('./base')

module.exports = createConfig({
  output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }],
  external: Object.keys(pkg.dependencies || {})
    .concat(pkg.devDependencies)
    .concat(builtins),
  plugins: [
    createBabel({
      plugins: ['unassert'],
      targets: { node: 6 },
    }),
  ],
})
