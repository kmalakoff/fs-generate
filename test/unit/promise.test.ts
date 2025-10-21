import assert from 'assert';
import type { Stats } from 'fs';
import generate from 'fs-generate';
import Iterator, { type Entry } from 'fs-iterator';
import statsSpys from 'fs-stats-spys';
import path from 'path';
import Pinkie from 'pinkie-promise';
import rimraf2 from 'rimraf2';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
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
    if (typeof global === 'undefined') return;
    const globalPromise = global.Promise;
    before(() => {
      global.Promise = Pinkie;
    });
    after(() => {
      global.Promise = globalPromise;
    });
  })();
  beforeEach((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  it('should create the expected structure (clean)', async () => {
    const spys = statsSpys();

    await generate(TEST_DIR, STRUCTURE);
    const iterator = new Iterator(TEST_DIR, { lstat: true });
    await iterator.forEach((entry: Entry): undefined => {
      spys(entry.stats as Stats);
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
      await iterator.forEach((entry: Entry): undefined => {
        spys(entry.stats as Stats);
      });
      assert.equal(spys.dir.callCount, 5);
      assert.equal(spys.file.callCount, 9);
      assert.equal(spys.link.callCount, 3);
    }

    await Promise.all([gen, gen]);
  });
});
