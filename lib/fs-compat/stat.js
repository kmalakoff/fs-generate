var fs = require('fs');

function statAddOptions(path, options, callback) {
  // if (arguments.length === 2) return fs.stat(path, options);
  return fs.stat(path, callback);
}

module.exports = fs.stat.length === 3 ? fs.stat : statAddOptions;
