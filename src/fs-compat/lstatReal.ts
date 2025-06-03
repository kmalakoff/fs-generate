import type fs from 'fs';
import lstat from './lstat.js';
import realpath from './realpath.js';

function lstatReal(path, options, callback) {
  realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    lstat(realpath, options, callback);
  });
}
export default lstatReal as typeof fs.lstat;
