/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

import path from 'path'
import isCI from 'is-ci'

const format = 'prettier-eslint --write **/*.{mjs,js,jsx,es,es6}'
const lint = 'eslint **/*.{mjs,js,jsx,es,es6} --format codeframe --fix'
const style = ['yarn start format', 'yarn start lint']
const test = [
  `rollup -c ${path.join(path.dirname(__dirname), 'rollup.config.js')}`,
  'nyc --reporter=lcov node dist/test.js',
  'nyc report',
  'nyc check-coverage',
]

const precommit = [
  'yarn start style',
  'git status --porcelain',
  'yarn start test',
  'git add --all',
]

const commit = ['simple-commit-message']
const release = ['semantic-release pre', 'npm publish', 'semantic-release post']

const protect = () => {
  // istanbul ignore next
  if (isCI) {
    return Promise.resolve()
  }

  const msg = 'the "npm publish" is forbidden, we use semantic-release on CI'

  return Promise.reject(new Error(msg))
}

export default {
  format,
  lint,
  style,
  test,
  precommit,
  commit,
  release,
  protect,
}
