var assert = require('assert');

var fs = require('fs');
var path = require('path');
var remove = require('remove');
var walk = require('walk-filtered');
var Queue = require('queue-cb');
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

describe('basic', function () {
  beforeEach(function (callback) {
    fs.existsSync(DIR) ? remove(DIR, callback) : callback();
  });
  after(function (callback) {
    fs.existsSync(DIR) ? remove(DIR, callback) : callback();
  });

  it('should create the expected structure (clean)', function (callback) {
    var spys = statsSpys();

    generate(DIR, STRUCTURE, function (err) {
      assert.ok(!err);

      walk(
        DIR,
        function (entry) {
          spys(entry.stats, entry.path);
        },
        { alwaysStat: true },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 3);
          callback();
        }
      );
    });
  });

  it('should create the expected structure (twice)', function (callback) {
    function gen(callback) {
      var spys = statsSpys();

      generate(DIR, STRUCTURE, function (err) {
        assert.ok(!err);

        walk(
          DIR,
          function (entry) {
            spys(entry.stats, entry.path);
          },
          { alwaysStat: true },
          function (err) {
            assert.ok(!err);
            assert.equal(spys.dir.callCount, 6);
            assert.equal(spys.file.callCount, 5);
            assert.equal(spys.link.callCount, 3);
            callback();
          }
        );
      });
    }

    var queue = new Queue(1);
    queue.defer(gen);
    queue.defer(gen);
    queue.await(callback);
  });
});
