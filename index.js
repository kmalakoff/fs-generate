var path = require('path');
var fs = require('fs');
var remove = require('remove');
var mkdirp = require('mkdirp');
var eachSeries = require('async-each-series');

function startsWith(string, start) {
  return typeof string === 'string' && string.substring(0, start.length) === start;
}

function directory(path, callback) {
  fs.lstat(path, function (err, stat) {
    if (err || !stat) mkdirp(path, callback);
    else if (!stat.isDirectory())
      remove(path, function (err) {
        err ? callback(err) : mkdirp(path, callback);
      });
    else callback();
  });
}

function file(path, contents, callback) {
  fs.lstat(path, function (err, stat) {
    if (err || !stat) fs.writeFile(path, contents, 'utf8', callback);
    else if (!stat.isFile())
      remove(path, function (err) {
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
  fs.lstat(path, function (err, stat) {
    if (err || !stat) fs.symlink(target, path, callback);
    else if (!stat.isSymbolicLink())
      remove(path, function (err) {
        err ? callback(err) : fs.symlink(target, path, callback);
      });
    else {
      fs.realpath(path, function (err, realpath) {
        if (err) callback(err);
        else if (realpath !== target)
          remove(path, function (err) {
            err ? callback(err) : fs.symlink(target, path, callback);
          });
        else callback();
      });
    }
  });
}

function generate(dir, structure, callback) {
  eachSeries(
    Object.keys(structure),
    function (relativePath, callback) {
      var fullPath = path.join(dir, relativePath.split('/').join(path.sep));

      var contents = structure[relativePath];
      if (!contents) return directory(fullPath, callback);

      mkdirp(path.dirname(fullPath), function (err) {
        if (err) return callback(err);

        if (!startsWith(contents, '~')) file(fullPath, contents, callback);
        else symlink(path.join(dir, contents.slice(1).split('/').join(path.sep)), fullPath, callback);
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
