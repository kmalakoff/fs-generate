import fs from 'fs';

function lstatAddOptions(path: fs.PathLike, _options: object | undefined, callback: (err: NodeJS.ErrnoException | null, stats?: fs.Stats) => void) {
  return fs.lstat(path, callback);
}

export default (fs.lstat.length === 3 ? fs.lstat : lstatAddOptions) as typeof fs.lstat;
