const fs = require('fs');

function lstatAddOptions(path, _options, callback) {
  return fs.lstat(path, callback);
}

module.exports = fs.lstat.length === 3 ? fs.lstat : lstatAddOptions;
