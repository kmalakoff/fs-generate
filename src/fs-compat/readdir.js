const fs = require('fs');

// prior to Node 9, fs.readdir did not return sorted files
let readdir = fs.readdir;
if (+process.versions.node.split('.')[1] <= 8) {
  readdir = function readdirSort(path, callback) {
    fs.readdir(path, (err, files) => {
      err ? callback(err) : callback(null, files.sort());
    });
  };
}

function readdirAddOptions(path, _options, callback) {
  return readdir(path, callback);
}

module.exports = fs.readdir.length === 3 ? fs.readdir : readdirAddOptions;
