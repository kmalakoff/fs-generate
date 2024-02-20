const lstat = require('./lstat');
const realpath = require('./realpath');

module.exports = function lstatReal(path, options, callback) {
  realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    lstat(realpath, options, callback);
  });
};
