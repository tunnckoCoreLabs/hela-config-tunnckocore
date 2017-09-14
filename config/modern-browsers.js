/**
 * @author Charlike Mike Reagent <open.source.charlike@gmail.com>
 * @copyright 2017 tunnckoCore and other contributors
 * @license MIT
 */

const uglify = require('rollup-plugin-uglify')
const { minify } = require('uglify-es')
const resolve = require('rollup-plugin-node-resolve')
const { name, pkg, preamble, createConfig, createBabel } = require('./base')

// simplified `rollup-plugin-gzip`, extract it!
const gzip = require('./gzip-plugin')

const config = createConfig({
  output: {
    name,
    file: pkg.modern || 'dist/index.min.js',
    format: 'es',
  },
  plugins: [
    createBabel({
      targets: {
        browsers: [
          'Chrome >= 60',
          'Safari >= 10.1',
          'iOS >= 10.3',
          'Firefox >= 54',
          'Edge >= 15',
        ],
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
