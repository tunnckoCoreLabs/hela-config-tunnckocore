/* eslint-disable max-len */

const test = require('mukla')
const tasks = require('./index')

test('should work', () => {
  test.strictEqual(typeof tasks, 'object')
})
