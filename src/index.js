/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const isCI = require('is-ci')
const { prepublish, publish } = require('new-release')

const helaBin = process.cwd().endsWith('hela') ? './src/cli.js' : 'yarn hela'

const format = 'prettier-eslint --write **/*.{mjs,js,jsx,es,es6}'
const lint = 'eslint --format codeframe **/*.{mjs,js,jsx,es,es6} --fix'
const style = [`${helaBin} format`, `${helaBin} lint`]
const test = [
  'nyc --reporter=lcov node test/index.js',
  'nyc report',
  'nyc check-coverage',
]

const precommit = [`${helaBin} style`, 'git status --porcelain', 'yarn test']
const commit = [`${helaBin} ac gen`, 'git add --all', 'gitcommit -s -S']

const release = async ({ cwd }) => {
  /* istanbul ignore if */
  if (!isCI && process.env.NODE_ENV !== 'test') {
    throw new Error('expect `release` to be run only on CI or in testing')
  }

  const result = await prepublish(cwd)

  /* istanbul ignore if */
  if (!result) return null

  if (process.env.NODE_ENV === 'test') {
    return result
  }

  return publish(result.nextVersion)
}

const protect = async () => {
  if (!isCI) {
    const msg = 'the "npm publish" is forbidden, we release and publish on CI service'
    throw new Error(msg)
  }
}

const ac = ({ argv, helaExec }) => {
  const arg = argv._.slice(1).shift()
  if (!arg) {
    return helaExec('all-contributors init')
  }
  if (arg === 'a' || arg === 'add') {
    return helaExec('all-contributors add')
  }
  if (arg === 'g' || arg === 'gen' || arg === 'generate') {
    return helaExec('all-contributors generate')
  }
  return Promise.reject(new Error('hela ac: provide "add" or "gen" command'))
}

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
}
