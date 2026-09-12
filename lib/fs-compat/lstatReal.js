const fs = require('fs');

var lstat = require('./lstat');

module.exports = function lstatReal(path, options, callback) {
  fs.realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    lstat(realpath, options, callback);
  });
};
