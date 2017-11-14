/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const path = require('path')
const util = require('util')
const isCI = require('is-ci')
const semver = require('semver')
const gitLog = require('parse-git-log')
const packageJson = require('get-pkg')
const detectChange = require('detect-next-version')

const format = 'prettier-eslint --write **/*.{mjs,js,jsx,es,es6}'
const lint = 'eslint --format codeframe **/*.{mjs,js,jsx,es,es6} --fix'
const style = ['yarn hela format', 'yarn hela lint']
const test = [
  'nyc --reporter=lcov node test/index.js',
  'nyc report',
  'nyc check-coverage',
]

const precommit = ['yarn hela style', 'git status --porcelain', 'yarn test']
const commit = ['yarn hela ac gen', 'git add --all', 'gitcommit -s -S']

/* eslint-disable no-shadow */

const release = async ({ helaShell }) => {
  /* istanbul ignore if */
  if (!isCI && process.env.NODE_ENV !== 'test') {
    throw new Error('expect `release` to be run only on CI or in testing')
  }

  const commits = await gitLog.promise()
  const lastCommit = commits[0]
  const commit = detectChange(lastCommit.contents, true)
  console.log(commit)

  /* istanbul ignore if */
  if (!commit.increment) return null

  const pkgName = path.basename(lastCommit.cwd)
  const pkgJson = await util.promisify(packageJson)(pkgName)
  const currentVersion = pkgJson.version
  const nextVersion = semver.inc(currentVersion, commit.increment)

  if (process.env.NODE_ENV === 'test') {
    return { pkgJson, currentVersion, nextVersion }
  }

  /* istanbul ignore next */
  return helaShell([
    `yarn version --no-git-tag-version --new-version ${nextVersion}`,
    `${path.join(__dirname, 'publisher.sh')}`,
  ])
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
