import type fs from 'fs';
import lstat from './lstat.ts';
import realpath from './realpath.ts';

function lstatReal(path, options, callback) {
  realpath(path, function realpathCallback(err, realpath) {
    if (err) return callback(err);
    lstat(realpath, options, callback);
  });
}
export default lstatReal as typeof fs.lstat;
