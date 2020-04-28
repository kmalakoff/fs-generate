var assert = require('assert');

var path = require('path');
var rimraf = require('rimraf2');
var Iterator = require('fs-iterator');
var Queue = require('queue-cb');
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

describe('callback', function () {
  beforeEach(rimraf.bind(null, DIR));
  after(rimraf.bind(null, DIR));

  it('should create the expected structure (clean)', function (done) {
    var spys = statsSpys();

    generate(DIR, STRUCTURE, function (err) {
      assert.ok(!err);

      var iterator = new Iterator(DIR, { lstat: true });
      iterator.forEach(
        function (entry) {
          spys(entry.stats);
        },
        function (err) {
          assert.ok(!err);
          assert.equal(spys.dir.callCount, 5);
          assert.equal(spys.file.callCount, 7);
          assert.equal(spys.link.callCount, 3);
          done();
        }
      );
    });
  });

  it('should create the expected structure (twice)', function (done) {
    function gen(done) {
      var spys = statsSpys();

      generate(DIR, STRUCTURE, function (err) {
        assert.ok(!err);

        var iterator = new Iterator(DIR, { lstat: true });
        iterator.forEach(
          function (entry) {
            spys(entry.stats);
          },
          function (err) {
            assert.ok(!err);
            assert.equal(spys.dir.callCount, 5);
            assert.equal(spys.file.callCount, 7);
            assert.equal(spys.link.callCount, 3);
            done();
          }
        );
      });
    }

    var queue = new Queue(1);
    queue.defer(gen);
    queue.defer(gen);
    queue.await(done);
  });
});
