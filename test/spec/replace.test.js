const assert = require('assert');

const path = require('path');
const rimraf2 = require('rimraf2');
const Iterator = require('fs-iterator');
const Queue = require('queue-cb');
const statsSpys = require('fs-stats-spys');

const generate = require('fs-generate');

const TEST_DIR = path.join(__dirname, '..', '..', '.tmp');

describe('replace', () => {
  beforeEach((cb) => rimraf2(TEST_DIR, { disableGlob: true }, () => cb()));

  it('should create the expected structure (updating mis-matched)', (done) => {
    function genMismatched(done) {
      const spys = statsSpys();

      const MISMATCHED_STRUCTURE = {
        file1: null,
        file2: null,
        dir1: 'file',
        'dir2/file1': '~file1',
        'dir2/file2': 'dd',
        'dir3/dir4/file1': 'e',
        'dir3/dir4/dir5': null,
        filesymlink1: 'file',
        filelink1: ':dir3/dir4/file1',
        'dir3/filesymlink2': '~dir2/file1',
        'dir3/filelink2': ':dir2/file2',
        'dir3/dir4/dirsymlink1': null,
      };

      generate(TEST_DIR, MISMATCHED_STRUCTURE, (err) => {
        assert.ok(!err, err ? err.message : '');

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry) => {
            spys(entry.stats);
          },
          (err) => {
            assert.ok(!err, err ? err.message : '');
            assert.equal(spys.dir.callCount, 7);
            assert.equal(spys.file.callCount, 6);
            assert.equal(spys.link.callCount, 2);
            done();
          }
        );
      });
    }

    function gen(done) {
      const spys = statsSpys();

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

      generate(TEST_DIR, STRUCTURE, (err) => {
        assert.ok(!err, err ? err.message : '');

        const iterator = new Iterator(TEST_DIR, { lstat: true });
        iterator.forEach(
          (entry) => {
            spys(entry.stats);
          },
          (err) => {
            assert.ok(!err, err ? err.message : '');
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 9);
            assert.equal(spys.link.callCount, 3);
            done();
          }
        );
      });
    }

    const queue = new Queue(1);
    queue.defer(genMismatched);
    queue.defer(gen);
    queue.await(done);
  });
});
