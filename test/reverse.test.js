const { test, describe } = require('node:test');
const assert = require('node:assert');

const { reverse } = require('../src/utils/for-testing');

describe('Testing reverse', () => {
  test('reverse of a', () => {
    assert.strictEqual(reverse('a'), 'a');
  });

  test('reverse of react', () => {
    assert.strictEqual(reverse('react'), 'tcaer');
  });

  test('reverse of saippuakauppias', () => {
    const result = reverse('saippuakauppias');
    assert.strictEqual(result, 'saippuakauppias');
  });
});
