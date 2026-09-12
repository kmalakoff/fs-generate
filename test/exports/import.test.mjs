import assert from 'assert';
import generate from 'fs-generate';

describe('exports .mjs', () => {
  it('default', () => {
    assert.equal(typeof generate, 'function');
  });
});
