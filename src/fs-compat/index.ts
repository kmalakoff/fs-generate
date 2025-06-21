import type fs from 'fs';
import lstat from './lstat.ts';
import lstatReal from './lstatReal.ts';
import readdir from './readdir.ts';
import realpath from './realpath.ts';
import stat from './stat.ts';

export default {
  lstat: lstat as typeof fs.lstat,
  lstatReal: lstatReal as typeof fs.lstat,
  readdir: readdir as typeof fs.readdir,
  realpath: realpath as typeof fs.realpath,
  stat: stat as typeof fs.stat,
};
