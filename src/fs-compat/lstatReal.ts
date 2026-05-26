import type fs from 'fs';
import lstat from './lstat.ts';
import realpath from './realpath.ts';

function lstatReal(path: fs.PathLike, options: object | undefined, callback: (err: NodeJS.ErrnoException | null, stats?: fs.Stats | fs.BigIntStats) => void) {
  realpath(path, function realpathCallback(err: NodeJS.ErrnoException | null, resolvedPath?: string) {
    if (err) return callback(err);
    lstat(resolvedPath as string, options, callback);
  });
}
export default lstatReal as typeof fs.lstat;
