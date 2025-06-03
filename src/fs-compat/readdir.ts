import fs from 'fs';

// prior to Node 9, fs.readdir did not return sorted files
const parts = process.versions.node.split('.');
const readdir =
  +parts[0] === 0 && +parts[1] <= 8
    ? function readdirSort(path, callback) {
        fs.readdir(path, (err, files) => {
          err ? callback(err) : callback(null, files.sort());
        });
      }
    : fs.readdir;

function readdirAddOptions(path, _options, callback) {
  return readdir(path, callback);
}

export default (fs.readdir.length === 3 ? fs.readdir : readdirAddOptions) as typeof fs.readdir;
