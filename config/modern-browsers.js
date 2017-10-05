/**
 * @author Charlike Mike Reagent <open.source.charlike@gmail.com>
 * @copyright 2017 tunnckoCore and other contributors
 * @license MIT
 */

const { minify } = require('uglify-es')
const uglify = require('rollup-plugin-uglify')
const resolve = require('rollup-plugin-node-resolve')
const { name, pkg, preamble, createConfig, createBabel } = require('./base')

// simplified `rollup-plugin-gzip`, extract it!
const gzip = require('./gzip-plugin')

const config = createConfig({
  output: {
    name,
    file: pkg.unpkg,
    format: 'umd',
  },
  plugins: [
    createBabel({
      plugins: ['unassert'],
      targets: {
        // As of 24 September 2017
        // http://browserl.ist ">= 1%, Edge >= 14, not IE 11, not Chrome 49"

        // Mobile:
        // - Chrome >= 59
        // - UC Browser >= 11.4
        // - iOS Safari >= 10.3
        // - iOS Safari >= 10.0-10.2
        // - Opera Mini all
        // - Samsung Internet >= 4

        // Desktop:
        // - Chrome 58, 59
        // - Edge >=14
        // - Firefox 54
        // - Safari 10.4
        browsers: ['>= 1%', 'Edge >= 14', 'not IE 11', 'not Chrome 49'],
      },
    }),
    uglify(
      {
        compress: { warnings: false },
        output: { preamble },
      },
      minify
    ),
    gzip(),
  ],
})

// Resolve all deps, because we creating browser bundle
config.plugins.unshift(resolve())

module.exports = config
