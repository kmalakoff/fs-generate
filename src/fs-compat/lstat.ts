import fs from 'fs';

function lstatAddOptions(path, _options, callback) {
  return fs.lstat(path, callback);
}

export default fs.lstat.length === 3 ? fs.lstat : lstatAddOptions;
