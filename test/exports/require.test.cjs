const assert = require('assert');
const generate = require('fs-generate');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof generate, 'function');
  });
});
