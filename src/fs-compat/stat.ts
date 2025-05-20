import fs from 'fs';

function statAddOptions(path, _options, callback) {
  return fs.stat(path, callback);
}

export default fs.stat.length === 3 ? fs.stat : statAddOptions;
