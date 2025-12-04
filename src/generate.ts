import { rm } from 'fs-remove-compat';
import fs from 'graceful-fs';
import mkdirp from 'mkdirp-classic';
import path from 'path';
import Queue from 'queue-cb';

import fsCompat from './fs-compat/index.ts';

const STAT_OPTIONS = { bigint: process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE) };

import type { Callback, Structure } from './types.ts';

function directory(fullPath: string, callback: Callback) {
  fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
    if (err || !stat) mkdirp(fullPath, callback);
    else if (!stat.isDirectory()) {
      rm(fullPath, { recursive: true }, (err) => {
        err ? callback(err) : mkdirp(fullPath, callback);
      });
    } else callback();
  });
}

function file(fullPath: string, contents: string, callback: Callback) {
  fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
    if (err || !stat) fs.writeFile(fullPath, contents, 'utf8', callback);
    else if (!stat.isFile()) {
      rm(fullPath, { recursive: true }, (err) => {
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

function symlink(targetFullPath: string, fullPath: string, callback: Callback) {
  fsCompat.lstatReal(targetFullPath, STAT_OPTIONS, (err, targetStat) => {
    if (err || !targetStat) return callback(err || new Error(`Symlink path does not exist${targetFullPath}`));
    const targetRelativePath = path.relative(path.dirname(fullPath), targetFullPath);
    const type = targetStat.isDirectory() ? 'dir' : 'file';
    fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
      if (err || !stat) fs.symlink(targetRelativePath, fullPath, type, callback);
      else if (!stat.isSymbolicLink()) {
        rm(fullPath, { recursive: true }, (err) => {
          err ? callback(err) : fs.symlink(targetRelativePath, fullPath, type, callback);
        });
      } else {
        fsCompat.realpath(fullPath, (err, realpath) => {
          if (err || realpath !== targetFullPath)
            rm(fullPath, { recursive: true }, (err) => {
              err ? callback(err) : fs.symlink(targetRelativePath, fullPath, type, callback);
            });
          else callback();
        });
      }
    });
  });
}

function link(targetFullPath: string, fullPath: string, callback: Callback) {
  fsCompat.lstatReal(targetFullPath, STAT_OPTIONS, (err, targetStat) => {
    if (err || !targetStat) return callback(err || new Error(`Symlink path does not exist${targetFullPath}`));

    fsCompat.lstat(fullPath, STAT_OPTIONS, (err, stat) => {
      if (err || !stat) fs.link(targetFullPath, fullPath, callback);
      else if (!stat.isFile()) {
        rm(fullPath, { recursive: true }, (err) => {
          err ? callback(err) : fs.link(targetFullPath, fullPath, callback);
        });
      } else {
        fsCompat.realpath(fullPath, (err, realpath) => {
          if (err || realpath !== targetFullPath)
            rm(fullPath, { recursive: true }, (err) => {
              err ? callback(err) : fs.link(targetFullPath, fullPath, callback);
            });
          else callback();
        });
      }
    });
  });
}

function generateOne(dir: string, relativePath: string, contents: string, callback: Callback) {
  const fullPath = path.join(dir, relativePath.split('/').join(path.sep));
  if (!contents) return directory(fullPath, callback);
  mkdirp(path.dirname(fullPath), (err) => {
    if (err) return callback(err);

    if (contents.length && contents[0] === '~') symlink(path.join(dir, contents.slice(1).split('/').join(path.sep)), fullPath, callback);
    else if (contents.length && contents[0] === ':') link(path.join(dir, contents.slice(1).split('/').join(path.sep)), fullPath, callback);
    else file(fullPath, contents, callback);
  });
}

function worker(dir: string, structure: Structure, callback: Callback): undefined {
  const queue = new Queue(1);
  for (const relativePath in structure) queue.defer(generateOne.bind(null, dir, relativePath, structure[relativePath]));
  queue.await(callback);
}

export default (dir: string, structure: Structure, callback?: Callback): undefined | Promise<undefined> => {
  if (callback !== undefined) return worker(dir, structure, callback);
  return new Promise((resolve, reject) =>
    worker(dir, structure, (err?: NodeJS.ErrnoException) => {
      err ? reject(err) : resolve(undefined);
    })
  );
};
