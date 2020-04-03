var chai = require('chai');
chai.use(require('sinon-chai'));
var assert = chai.assert;

var fs = require('fs-extra');
var path = require('path');
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

describe('promises', () => {
  beforeEach(() => fs.remove(DIR));
  after(() => fs.remove(DIR));

  it('should create the expected structure (clean)', async () => {
    var spys = statsSpys();

    await generate(DIR, STRUCTURE);
    await walk(DIR, (path, stats) => spys(stats, path));
    assert.equal(spys.dir.callCount, 6);
    assert.equal(spys.file.callCount, 5);
    assert.equal(spys.link.callCount, 3);
  });

  it('should create the expected structure (twice)', async () => {
    const gen = async () => {
      var spys = statsSpys();

      await generate(DIR, STRUCTURE);
      await walk(DIR, (path, stats) => spys(stats, path));
    };

    await Promise.all([gen, gen]);
  });
});
