import path from 'path';
import fs from 'graceful-fs';
import mkdirp from 'mkdirp-classic';
import Queue from 'queue-cb';
import rimraf2 from 'rimraf2';

import fsCompat from './fs-compat/index.js';
const STAT_OPTIONS = { bigint: process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE) };

function directory(fullPath, callback) {
  fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
    if (err || !stat) mkdirp(fullPath, callback);
    else if (!stat.isDirectory()) {
      rimraf2(fullPath, { disableGlob: true }, (err) => {
        err ? callback(err) : mkdirp(fullPath, callback);
      });
    } else callback();
  });
}

function file(fullPath, contents, callback) {
  fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
    if (err || !stat) fs.writeFile(fullPath, contents, 'utf8', callback);
    else if (!stat.isFile()) {
      rimraf2(fullPath, { disableGlob: true }, (err) => {
        err ? callback(err) : fs.writeFile(fullPath, contents, 'utf8', callback);
      });
    } else {
      fs.readFile(fullPath, 'utf8', (err, existingContents) => {
        if (err) callback(err);
        else if (existingContents !== contents) fs.writeFile(fullPath, contents, 'utf8', callback);
        else callback();
      });
    }
  });
}

function symlink(targetFullPath, fullPath, callback) {
  fsCompat.lstatReal(targetFullPath, STAT_OPTIONS, (err, targetStat) => {
    if (err || !targetStat) return callback(err || new Error(`Symlink path does not exist${targetFullPath}`));
    const targetRelativePath = path.relative(path.dirname(fullPath), targetFullPath);
    const type = targetStat.isDirectory() ? 'dir' : 'file';
    fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
      if (err || !stat) fs.symlink(targetRelativePath, fullPath, type, callback);
      else if (!stat.isSymbolicLink()) {
        rimraf2(fullPath, { disableGlob: true }, (err) => {
          err ? callback(err) : fs.symlink(targetRelativePath, fullPath, type, callback);
        });
      } else {
        fsCompat.realpath(fullPath, (err, realpath) => {
          if (err || realpath !== targetFullPath)
            rimraf2(fullPath, { disableGlob: true }, (err) => {
              err ? callback(err) : fs.symlink(targetRelativePath, fullPath, type, callback);
            });
          else callback();
        });
      }
    });
  });
}

function link(targetFullPath, fullPath, callback) {
  fsCompat.lstatReal(targetFullPath, STAT_OPTIONS, (err, targetStat) => {
    if (err || !targetStat) return callback(err || new Error(`Symlink path does not exist${targetFullPath}`));

    fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
      if (err || !stat) fs.link(targetFullPath, fullPath, callback);
      else if (!stat.isFile()) {
        rimraf2(fullPath, { disableGlob: true }, (err) => {
          err ? callback(err) : fs.link(targetFullPath, fullPath, callback);
        });
      } else {
        fsCompat.realpath(fullPath, (err, realpath) => {
          if (err || realpath !== targetFullPath)
            rimraf2(fullPath, { disableGlob: true }, (err) => {
              err ? callback(err) : fs.link(targetFullPath, fullPath, callback);
            });
          else callback();
        });
      }
    });
  });
}

function generateOne(dir, relativePath, contents, callback) {
  const fullPath = path.join(dir, relativePath.split('/').join(path.sep));
  if (!contents) return directory(fullPath, callback);
  mkdirp(path.dirname(fullPath), (err) => {
    if (err) return callback(err);

    if (contents.length && contents[0] === '~') symlink(path.join(dir, contents.slice(1).split('/').join(path.sep)), fullPath, callback);
    else if (contents.length && contents[0] === ':') link(path.join(dir, contents.slice(1).split('/').join(path.sep)), fullPath, callback);
    else file(fullPath, contents, callback);
  });
}

function worker(dir, structure, callback) {
  const queue = new Queue(1);
  for (const relativePath in structure) {
    queue.defer(generateOne.bind(null, dir, relativePath, structure[relativePath]));
  }
  queue.await(callback);
}

export default (dir, structure, callback) => {
  if (callback !== undefined) return worker(dir, structure, callback);
  return new Promise((resolve, reject) => worker(dir, structure, (err) => (err ? reject(err) : resolve(undefined))));
};
