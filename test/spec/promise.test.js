const Pinkie = require('pinkie-promise');
const assert = require('assert');

const path = require('path');
const rimraf2 = require('rimraf2');
const Iterator = require('fs-iterator');
const statsSpys = require('fs-stats-spys');

const generate = require('fs-generate');

const TEST_DIR = path.join(__dirname, '..', '..', '.tmp');
const STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  filesymlink1: '~dir3/dir4/file1',
  filelink1: ':dir3/dir4/file1',
  'dir3/filesymlink2': '~dir2/file1',
  'dir3/filelink2': ':dir2/file1',
  'dir3/dir4/dirsymlink1': '~dir2',
};

describe('promise', () => {
  (() => {
    // patch and restore promise
    const root = typeof global !== 'undefined' ? global : window;
    let rootPromise;
    before(() => {
      rootPromise = root.Promise;
      // @ts-ignore
      root.Promise = Pinkie;
    });
    after(() => {
      root.Promise = rootPromise;
    });
  })();
  beforeEach((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  it('should create the expected structure (clean)', async () => {
    const spys = statsSpys();

    await generate(TEST_DIR, STRUCTURE);
    const iterator = new Iterator(TEST_DIR, { lstat: true });
    await iterator.forEach((entry) => {
      spys(entry.stats);
    });
    assert.equal(spys.dir.callCount, 5);
    assert.equal(spys.file.callCount, 9);
    assert.equal(spys.link.callCount, 3);
  });

  it('should create the expected structure (twice)', async () => {
    async function gen() {
      const spys = statsSpys();
      await generate(TEST_DIR, STRUCTURE);
      const iterator = new Iterator(TEST_DIR, { lstat: true });
      await iterator.forEach((entry) => {
        spys(entry.stats);
      });
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 9);
      assert.equal(spys.link.callCount, 3);
    }

    await Promise.all([gen, gen]);
  });
});
