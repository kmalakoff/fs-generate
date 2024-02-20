const lstat = require('./lstat');
const lstatReal = require('./lstatReal');
const readdir = require('./readdir');
const realpath = require('./realpath');
const stat = require('./stat');

module.exports = {
  lstat: lstat,
  lstatReal: lstatReal,
  readdir: readdir,
  realpath: realpath,
  stat: stat,
};
