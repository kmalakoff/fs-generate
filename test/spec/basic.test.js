var chai = require('chai'); chai.use(require('sinon-chai'));
var assert = chai.assert;

var fs = require('fs-extra');
var sysPath = require('path');
var async = require('async');
var walk = require('walk-filtered');
var generate = require('../..');
var statsSpys = require('../utils').statsSpys;

var DIR = sysPath.join(__dirname, 'dest');
var STRUCTURE = {
  'file1': 'a',
  'file2': 'b',
  'dir1': null,
  'dir2/file1': 'c',
  'dir2/file2': 'd',
  'dir3/dir4/file1': 'e',
  'dir3/dir4/dir5': null,
  'link1': '~dir3/dir4/file1',
  'dir3/link2': '~dir2/file1',
  'dir3/dir4/link3': '~dir2'
};

describe("basic", function() {
  beforeEach(function(callback) { fs.remove(DIR, callback); })
  after(function(callback) { fs.remove(DIR, callback); })

  it("should create the expected structure (clean)", function(callback) {
    var spys = statsSpys();

    generate(DIR, STRUCTURE, function(err) {
      assert.ok(!err);

      walk(DIR, function(path, stats) { spys(stats, path); }, true, function(err) {
        assert.equal(spys.dir.callCount, 6);
        assert.equal(spys.file.callCount, 5);
        assert.equal(spys.link.callCount, 3);
        callback();
      });
    });
  });

  it("should create the expected structure (twice)", function(callback) {
    function gen(callback) {
      var spys = statsSpys();

      generate(DIR, STRUCTURE, function(err) {
        assert.ok(!err);

        walk(DIR, function(path, stats) { spys(stats, path); }, true, function(err) {
          assert.equal(spys.dir.callCount, 6);
          assert.equal(spys.file.callCount, 5);
          assert.equal(spys.link.callCount, 3);
          callback();
        });
      });
    }

    async.series([gen, gen], callback)
  });
});
