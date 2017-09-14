const test = require('mukla')
const tasks = require('./index')

test('should work', () => {
  test.strictEqual(typeof tasks, 'object')
})
