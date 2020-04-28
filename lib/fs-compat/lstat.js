var fs = require('fs');

function lstatAddOptions(path, options, callback) {
  // if (arguments.length === 2) return fs.lstat(path, options);
  return fs.lstat(path, callback);
}

module.exports = fs.lstat.length === 3 ? fs.lstat : lstatAddOptions;
