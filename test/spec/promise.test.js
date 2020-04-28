var assert = require('assert');

var path = require('path');
var rimraf = require('rimraf');
var Iterator = require('fs-iterator');
var statsSpys = require('fs-stats-spys');

var generate = require('../..');

var DIR = path.join(__dirname, 'dest');
var STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  filelink1: '~dir3/dir4/file1',
  'dir3/filelink2': '~dir2/file1',
  'dir3/dir4/dirlink1': '~dir2',
};

describe('promise', function () {
  if (typeof Promise === 'undefined') return; // no promise support

  beforeEach(rimraf.bind(null, DIR));
  after(rimraf.bind(null, DIR));

  it('should create the expected structure (clean)', function () {
    var spys = statsSpys();

    return generate(DIR, STRUCTURE).then(function () {
      var iterator = new Iterator(DIR, { lstat: true });
      return iterator
        .forEach(function (entry) {
          spys(entry.stats);
        })
        .then(function () {
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 7);
          assert.equal(spys.link.callCount, 3);
        })
        .catch(function (err) {
          assert.ok(!err);
        });
    });
  });

  it('should create the expected structure (twice)', function () {
    function gen() {
      var spys = statsSpys();
      return generate(DIR, STRUCTURE).then(function () {
        var iterator = new Iterator(DIR, { lstat: true });
        return iterator
          .forEach(function (entry) {
            spys(entry.stats);
          })
          .then(function () {
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 7);
            assert.equal(spys.link.callCount, 3);
          })
          .catch(function (err) {
            assert.ok(!err);
          });
      });
    }

    return Promise.all([gen, gen]);
  });
});
