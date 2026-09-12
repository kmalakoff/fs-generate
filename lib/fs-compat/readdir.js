var fs = require('fs');

// prior to Node 9, fs.readdir did not return sorted files
var readdir = fs.readdir;
if (+process.versions.node.split('.')[1] <= 8) {
  readdir = function readdirSort(path, callback) {
    fs.readdir(path, function (err, files) {
      err ? callback(err) : callback(null, files.sort());
    });
  };
}

function readdirAddOptions(path, options, callback) {
  // if (arguments.length === 2) return readdir(path, options);
  // if (options.withFileTypes) return callback(new Error('withFileTypes option not emulated'));
  return readdir(path, callback);
}

module.exports = fs.readdir.length === 3 ? fs.readdir : readdirAddOptions;
