var assert = require('assert');

var fs = require('fs');
var path = require('path');
var remove = require('remove');
var walk = require('walk-filtered');
var generate = require('../..');
var statsSpys = require('../utils').statsSpys;

var DIR = path.join(__dirname, 'dest');
var STRUCTURE = {
  file1: 'a',
  file2: 'b',
  dir1: null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  link1: '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
  'dir3/dir4/link3': '~dir2',
};

describe('promises', function () {
  if (typeof Promise === 'undefined') return; // no promise support

  beforeEach(function (callback) {
    fs.existsSync(DIR) ? remove(DIR, callback) : callback();
  });
  after(function (callback) {
    fs.existsSync(DIR) ? remove(DIR, callback) : callback();
  });

  it('should create the expected structure (clean)', function () {
    var spys = statsSpys();

    return generate(DIR, STRUCTURE).then(function () {
      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
        },
        { alwaysStat: true }
      ).then(function () {
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 3);
      });
    });
  });

  it('should create the expected structure (twice)', function () {
    function gen() {
      var spys = statsSpys();
      return generate(DIR, STRUCTURE).then(function () {
        walk(
          DIR,
          function (entry) {
            spys(entry.stats, entry.path);
          },
          { alwaysStat: true }
        ).then(function () {
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 3);
        });
      });
    }

    return Promise.all([gen, gen]);
  });
});
