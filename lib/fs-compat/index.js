var lstat = require('./lstat');
var lstatReal = require('./lstatReal');
var readdir = require('./readdir');
var stat = require('./stat');

module.exports = {
  lstat: lstat,
  lstatReal: lstatReal,
  readdir: readdir,
  stat: stat,
};
