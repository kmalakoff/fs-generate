import fs from 'fs';

function statAddOptions(path: fs.PathLike, _options: object | undefined, callback: (err: NodeJS.ErrnoException | null, stats?: fs.Stats) => void) {
  return fs.stat(path, callback);
}

export default (fs.stat.length === 3 ? fs.stat : statAddOptions) as typeof fs.stat;
