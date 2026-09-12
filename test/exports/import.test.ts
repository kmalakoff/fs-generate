import assert from 'assert';
import generate from 'fs-generate';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof generate, 'function');
  });
});
