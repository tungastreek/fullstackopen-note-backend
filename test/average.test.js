const { test, describe } = require('node:test');
const assert = require('node:assert');

const { average } = require('../src/utils/for-testing');

describe('Testing average', () => {
  test('one element', () => {
    assert.strictEqual(average([1]), 1);
  });

  test('many elements', () => {
    assert.strictEqual(average([1, 2, 3]), 2);
  });

  test('no element', () => {
    assert.strictEqual(average([]), 0);
  });
});
