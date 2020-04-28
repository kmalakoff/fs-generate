var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var mkpath = require('mkpath');
var eachSeries = require('async-each-series');

var fsCompat = require('./lib/fs-compat');
var STAT_OPTIONS = { bigint: process.platform === 'win32' };

function directory(path, callback) {
  fsCompat.lstat(path, STAT_OPTIONS, function (err, stat) {
    if (err || !stat) mkpath(path, callback);
    else if (!stat.isDirectory())
      rimraf(path, function (err) {
        err ? callback(err) : mkpath(path, callback);
      });
    else callback();
  });
}

function file(path, contents, callback) {
  fsCompat.lstat(path, STAT_OPTIONS, function (err, stat) {
    if (err || !stat) fs.writeFile(path, contents, 'utf8', callback);
    else if (!stat.isFile())
      rimraf(path, function (err) {
        err ? callback(err) : fs.writeFile(path, contents, 'utf8', callback);
      });
    else {
      fs.readFile(path, 'utf8', function (err, existingContents) {
        if (err) callback(err);
        else if (existingContents !== contents) fs.writeFile(path, contents, 'utf8', callback);
        else callback();
      });
    }
  });
}

function symlink(target, path, callback) {
  fsCompat.lstatReal(target, STAT_OPTIONS, function (err, targetStat) {
    if (err || !targetStat) return callback(err || new Error('Symlink path does not exist' + target));
    var type = targetStat.isDirectory() ? 'dir' : 'file';

    fsCompat.lstat(path, STAT_OPTIONS, function (err, stat) {
      if (err || !stat) fs.symlink(target, path, type, callback);
      else if (!stat.isSymbolicLink())
        rimraf(path, function (err) {
          err ? callback(err) : fs.symlink(target, path, type, callback);
        });
      else {
        fsCompat.realpath(path, function (err, realpath) {
          if (err) callback(err);
          else if (realpath !== target)
            rimraf(path, function (err) {
              err ? callback(err) : fs.symlink(target, path, type, callback);
            });
          else callback();
        });
      }
    });
  });
}

function generate(dir, structure, callback) {
  eachSeries(
    Object.keys(structure),
    function (relativePath, callback) {
      var fullPath = path.join(dir, relativePath.split('/').join(path.sep));

      var contents = structure[relativePath];
      if (!contents) return directory(fullPath, callback);

      mkpath(path.dirname(fullPath), function (err) {
        if (err) return callback(err);

        if (contents.length && contents[0] === '~') symlink(path.join(dir, contents.slice(1).split('/').join(path.sep)), fullPath, callback);
        else file(fullPath, contents, callback);
      });
    },
    callback
  );
}
module.exports = function (dir, structure, callback) {
  if (arguments.length === 3) return generate(dir, structure, callback);

  return new Promise(function (resolve, reject) {
    generate(dir, structure, function (err) {
      err ? reject(err) : resolve();
    });
  });
};
