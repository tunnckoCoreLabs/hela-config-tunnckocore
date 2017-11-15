/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const isCI = require('is-ci')
const test = require('mukla')
// const isObject = require('isobject')
const tasks = require('../src/index.js')

test('preset/config export tasks object', (done) => {
  test.strictEqual(typeof tasks, 'object')
  test.strictEqual(typeof tasks.lint, 'string')
  test.strictEqual(typeof tasks.format, 'string')
  done()
})

test('prepublish task should throw on local', () => {
  if (isCI) {
    return tasks.protect()
  }

  return tasks.protect().catch((er) => {
    test.strictEqual(er.message.includes('"npm publish" is forbidden'), true)
  })
})

// test('release task work correctly and return object in testing mode', async () => {
//   const result = await tasks.release({}, true)

//   test.strictEqual(isObject(result), true)
//   test.strictEqual(isObject(result.pkgJson), true)
//   test.ok(result.currentVersion)
//   test.ok(result.nextVersion)
// })
