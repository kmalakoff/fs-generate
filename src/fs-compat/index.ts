import type fs from 'fs';
import lstat from './lstat.js';
import lstatReal from './lstatReal.js';
import readdir from './readdir.js';
import realpath from './realpath.js';
import stat from './stat.js';

export default {
  lstat: lstat as typeof fs.lstat,
  lstatReal: lstatReal as typeof fs.lstat,
  readdir: readdir as typeof fs.readdir,
  realpath: realpath as typeof fs.realpath,
  stat: stat as typeof fs.stat,
};
