const fs = require('fs');

function statAddOptions(path, _options, callback) {
  return fs.stat(path, callback);
}

module.exports = fs.stat.length === 3 ? fs.stat : statAddOptions;
