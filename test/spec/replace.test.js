var assert = require('assert');

var fs = require('fs');
var path = require('path');
var remove = require('remove');
var walk = require('walk-filtered');
var Queue = require('queue-cb');
var statsSpys = require('fs-stats-spys');

var generate = require('../..');

var DIR = path.join(__dirname, 'dest');

describe('replace', function () {
  beforeEach(function (callback) {
    fs.existsSync(DIR) ? remove(DIR, callback) : callback();
  });
  after(function (callback) {
    fs.existsSync(DIR) ? remove(DIR, callback) : callback();
  });

  it('should create the expected structure (updating mis-matched)', function (callback) {
    function genMismatched(callback) {
      var spys = statsSpys();

      var MISMATCHED_STRUCTURE = {
        file1: null,
        file2: null,
        dir1: 'file',
        'dir2/file1': '~file1',
        'dir2/file2': 'dd',
        'dir3/dir4/file1': 'e',
        'dir3/dir4/dir5': null,
        link1: 'file',
        'dir3/link2': '~dir2/file1',
        'dir3/dir4/link3': null,
      };

      generate(DIR, MISMATCHED_STRUCTURE, function (err) {
        assert.ok(!err);

        walk(
          DIR,
          function (entry) {
            spys(entry.stats);
          },
          { alwaysStat: true },
          function (err) {
            assert.ok(!err);
            assert.equal(spys.dir.callCount, 8);
            assert.equal(spys.file.callCount, 4);
            assert.equal(spys.link.callCount, 2);
            callback();
          }
        );
      });
    }

    function gen(callback) {
      var spys = statsSpys();

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

      generate(DIR, STRUCTURE, function (err) {
        assert.ok(!err);

        walk(
          DIR,
          function (entry) {
            spys(entry.stats);
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
    queue.defer(genMismatched);
    queue.defer(gen);
    queue.await(callback);
  });
});
