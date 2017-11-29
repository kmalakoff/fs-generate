var sysPath = require('path');
var fs = require('fs-extra');
var eachSeries = require('async-each-series');

function startsWith(string, start) { return (string.substring(0, start.length) === start); }

function directory(path, callback) {
  fs.lstat(path, function(err, stat) {
    if (!stat) fs.mkdirs(path, callback);
    else if (!stat.isDirectory()) fs.remove(path, function(err) { err ? callback(err) : fs.mkdirs(path, callback); });
    else callback();
  });
}

function file(path, contents, callback) {
  fs.lstat(path, function(err, stat) {
    if (!stat) fs.outputFile(path, contents, 'utf8', callback);
    else if (!stat.isFile()) fs.remove(path, function(err) { err ? callback(err) : fs.outputFile(path, contents, 'utf8', callback); });
    else {
      fs.readFile(path, 'utf8', function(err, existingContents) {
        if (err) callback(err);
        else if (existingContents !== contents) fs.writeFile(path, contents, 'utf8', callback);
        else callback();
      });
    }
  });
}

function symlink(target, path, callback) {
  fs.lstat(path, function(err, stat) {
    if (!stat) fs.symlink(target, path, callback);
    else if (!stat.isSymbolicLink()) fs.remove(path, function(err) { err ? callback(err) : fs.symlink(target, path, callback); });
    else {
      fs.realpath(path, function(err, realpath) {
        if (err) callback(err);
        else if (realpath !== target) fs.remove(path, function(err) { err ? callback(err) : fs.symlink(target, path, callback); });
        else callback();
      });
    }
  });
}

module.exports = function(dir, structure, callback) {
  eachSeries(Object.keys(structure), function(path, callback) {
    var fullPath = sysPath.join(dir, path.split('/').join(sysPath.sep));

    var contents = structure[path];
    if (!contents) return directory(fullPath, callback);

    fs.mkdirs(sysPath.dirname(fullPath), function(err) {
      if (err) return callback(err);

      if (!startsWith(contents, '~'))
        file(fullPath, contents, callback);
      else
        symlink(sysPath.join(dir, contents.slice(1).split('/').join(sysPath.sep)), fullPath, callback);
    });
  },
  function(err) { err ? callback(err) : callback(null, dir); });
}
