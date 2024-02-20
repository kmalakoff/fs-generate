const assert = require('assert');

const path = require('path');
const rimraf = require('rimraf');
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
  if (typeof Promise === 'undefined') return; // no promise support

  beforeEach(rimraf.bind(null, TEST_DIR));

  it('should create the expected structure (clean)', () => {
    const spys = statsSpys();

    return generate(TEST_DIR, STRUCTURE).then(() => {
      const iterator = new Iterator(TEST_DIR, { lstat: true });
      return iterator
        .forEach((entry) => {
          spys(entry.stats);
        })
        .then(() => {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 9);
          assert.equal(spys.link.callCount, 3);
        })
        .catch((err) => {
          assert.ok(!err);
        });
    });
  });

  it('should create the expected structure (twice)', () => {
    function gen() {
      const spys = statsSpys();
      return generate(TEST_DIR, STRUCTURE).then(() => {
        const iterator = new Iterator(TEST_DIR, { lstat: true });
        return iterator
          .forEach((entry) => {
            spys(entry.stats);
          })
          .then(() => {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 9);
            assert.equal(spys.link.callCount, 3);
          })
          .catch((err) => {
            assert.ok(!err);
          });
      });
    }

    return Promise.all([gen, gen]);
  });
});
