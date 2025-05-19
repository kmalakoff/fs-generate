import lstat from './lstat.js';
import realpath from './realpath.js';

export default function lstatReal(path, options, callback) {
  realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    lstat(realpath, options, callback);
  });
}
