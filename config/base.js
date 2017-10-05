/**
 * @author Charlike Mike Reagent <open.source.charlike@gmail.com>
 * @copyright 2017 tunnckoCore and other contributors
 * @license MIT
 */

const path = require('path')
const babel = require('rollup-plugin-babel')
const eslint = require('rollup-plugin-eslint')
const unassert = require('rollup-plugin-unassert')
const commonjs = require('rollup-plugin-commonjs')

// helpers
const camelcase = require('camelcase')
const year = require('year')

const pkg = require(path.join(process.cwd(), 'package.json'))

const preamble = `/**
 * @author Charlike Mike Reagent <open.source.charlike@gmail.com>
 * @copyright ${year()} @tunnckoCore/team and contributors
 * @license ${pkg.license}
 */`

const idx = pkg.name.indexOf('/') > -1
const name = idx ? camelcase(pkg.name.slice(idx)) : camelcase(pkg.name)
const createBabel = ({ targets, plugins }) => {
  const opts = {
    presets: [
      [
        'env',
        {
          spec: true,
          modules: false,
          useBuiltIns: true,
          targets,
        },
      ],
    ],
    plugins: [
      'external-helpers',
      ['transform-object-rest-spread', { useBuiltIns: true }],
      ['transform-react-jsx', { pragma: 'h' }],
    ]
      .concat(plugins)
      .filter(Boolean),
  }

  return babel(opts)
}

const createConfig = (options) => {
  options = Object.assign({}, options)

  const plugins = [
    commonjs(),
    eslint({ formatter: 'codeframe', throwOnError: true, fix: true }),
    unassert(),
  ]

  const opts = {
    banner: preamble,
    input: 'src/index.js',
    plugins: plugins.concat(options.plugins).filter(Boolean),
    context: '{}',
  }
  delete options.plugins

  return Object.assign(opts, options)
}

module.exports = { name, pkg, preamble, createConfig, createBabel }
